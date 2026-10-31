<?php

namespace App\Services;

use App\Exceptions\InvalidStatusTransitionException;
use App\Models\Facture;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Sale workflow: En attente -> Validee (stock out + invoice) or Annulee.
 * Every action runs in one transaction with the sale row locked.
 */
class SaleService
{
    public function create(array $data, User $user): Sale
    {
        return DB::transaction(function () use ($data, $user) {
            $sale = Sale::create([
                ...$this->saleAttributes($data),
                'user_id' => $user->id,
                'status' => Sale::STATUS_EN_ATTENTE,
                'date_vente' => $data['date_vente'] ?? now(),
            ]);

            $sale->articles()->sync($this->lines($data['articles']));

            if (($data['status'] ?? null) === Sale::STATUS_VALIDEE) {
                $sale = $this->validate($sale);
            }

            return $sale;
        });
    }

    public function update(Sale $sale, array $data): Sale
    {
        return DB::transaction(function () use ($sale, $data) {
            $sale = $this->lockPending($sale, 'updated');

            // status only changes through validate()/cancel(); user_id keeps the creator
            $sale->update([
                ...$this->saleAttributes($data),
                'date_vente' => $data['date_vente'] ?? $sale->date_vente,
            ]);

            $sale->articles()->sync($this->lines($data['articles']));

            return $sale;
        });
    }

    public function validate(Sale $sale): Sale
    {
        return DB::transaction(function () use ($sale) {
            $sale = $this->lockPending($sale, 'validated');
            $sale->load('articles.stock');

            foreach ($sale->articles as $article) {
                StockMovement::create([
                    'stock_id' => $article->stock?->id ?? throw new InvalidStatusTransitionException("Article {$article->nom} has no stock record."),
                    'type' => StockMovement::TYPE_OUT,
                    'quantite' => $article->pivot->quantite,
                    'is_generated' => true,
                    'motif' => 'Vente',
                ]);
            }

            $sale->update(['status' => Sale::STATUS_VALIDEE]);

            $this->createInvoice($sale);

            return $sale;
        });
    }

    public function cancel(Sale $sale): Sale
    {
        return DB::transaction(function () use ($sale) {
            $sale = $this->lockPending($sale, 'canceled');
            $sale->update(['status' => Sale::STATUS_ANNULEE]);

            return $sale;
        });
    }

    private function createInvoice(Sale $sale): Facture
    {
        $tva = config('stock.tva_rate');

        $facture = Facture::create([
            // temporary unique value, replaced once the id is known
            'numero' => 'TMP-'.Str::uuid(),
            'sale_id' => $sale->id,
            'status' => Facture::STATUS_PENDING,
            'montant_total' => round($sale->montant_total * (1 + $tva), 2),
        ]);

        $facture->update([
            'numero' => sprintf('FAC-%s-%06d', now()->format('Ymd'), $facture->id),
        ]);

        return $facture;
    }

    /**
     * Re-read the sale under lock so concurrent requests see the real status.
     */
    private function lockPending(Sale $sale, string $action): Sale
    {
        $locked = Sale::whereKey($sale->id)->lockForUpdate()->firstOrFail();

        if ($locked->status !== Sale::STATUS_EN_ATTENTE) {
            throw new InvalidStatusTransitionException("This sale is {$locked->status} and can not be {$action}.");
        }

        return $locked;
    }

    private function saleAttributes(array $data): array
    {
        return [
            'numero' => $data['numero'],
            'client_id' => $data['client_id'],
            'adresse_livraison' => $data['adresse_livraison'] ?? null,
            'date_livraison' => $data['date_livraison'] ?? null,
            'montant_total' => collect($data['articles'])
                ->sum(fn ($line) => round($line['quantite'] * $line['prix_unitaire'], 2)),
        ];
    }

    /**
     * @return array<int, array{quantite: float, prix_unitaire: float, total: float}>
     */
    private function lines(array $articles): array
    {
        return collect($articles)->mapWithKeys(fn ($line) => [
            $line['id'] => [
                'quantite' => $line['quantite'],
                'prix_unitaire' => $line['prix_unitaire'],
                'total' => round($line['quantite'] * $line['prix_unitaire'], 2),
            ],
        ])->all();
    }
}
