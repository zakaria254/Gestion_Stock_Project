<?php

namespace Database\Seeders;

use App\Exceptions\InsufficientStockException;
use App\Models\Article;
use App\Models\Client;
use App\Models\Facture;
use App\Models\Sale;
use App\Models\User;
use App\Services\SaleService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SaleSeeder extends Seeder
{
    /**
     * Seed sales, their article lines (sale_article) and invoices (factures).
     *
     * Goes through SaleService so validated sales create their stock "out"
     * movements and invoice exactly like the real app does.
     */
    public function run(SaleService $sales): void
    {
        $sellers = User::whereIn('role', [User::ROLE_VENTES, User::ROLE_ADMIN])->get();
        $clients = Client::all();
        $articles = Article::all();

        if ($sellers->isEmpty() || $clients->isEmpty() || $articles->isEmpty()) {
            $this->command?->warn('SaleSeeder skipped: needs users, clients and articles first.');

            return;
        }

        $next = (int) Sale::max('id') + 1;

        for ($i = 0; $i < 30; $i++) {
            // spread over the last 6 months so the dashboard charts have data
            $date = Carbon::now()->subDays(fake()->numberBetween(0, 180))->startOfDay();
            $client = $clients->random();

            $lines = $articles->random(fake()->numberBetween(1, min(4, $articles->count())))
                ->map(fn (Article $article) => [
                    'id' => $article->id,
                    'quantite' => fake()->numberBetween(1, 30),
                    'prix_unitaire' => $article->prix,
                ])->values()->all();

            $sale = $sales->create([
                'numero' => sprintf('VNT-%s-%04d', $date->format('Ym'), $next++),
                'client_id' => $client->id,
                'adresse_livraison' => $client->adresse ?? fake()->address(),
                'date_livraison' => $date->copy()->addDays(fake()->numberBetween(1, 7))->toDateString(),
                'date_vente' => $date->toDateString(),
                'articles' => $lines,
            ], $sellers->random());

            $sale->forceFill(['created_at' => $date, 'updated_at' => $date])->saveQuietly();

            $roll = fake()->numberBetween(1, 100);

            if ($roll <= 60) {
                $this->validate($sales, $sale, $date);
            } elseif ($roll <= 75) {
                $sales->cancel($sale);
            }
            // remaining ~25% stay "En attente"
        }
    }

    private function validate(SaleService $sales, Sale $sale, Carbon $date): void
    {
        try {
            $sales->validate($sale);
        } catch (InsufficientStockException) {
            return; // not enough stock: leave the sale pending
        }

        $facture = Facture::where('sale_id', $sale->id)->first();
        if (! $facture) {
            return;
        }

        // invoice numbered and dated on the sale day instead of "today"
        $status = fake()->randomElement([
            Facture::STATUS_PAID, Facture::STATUS_PAID,
            Facture::STATUS_PENDING, Facture::STATUS_UNPAID,
        ]);

        $facture->forceFill([
            'numero' => sprintf('FAC-%s-%06d', $date->format('Ymd'), $facture->id),
            'status' => $status,
            'date_payment' => $status === Facture::STATUS_PAID
                ? $date->copy()->addDays(fake()->numberBetween(1, 30))
                : null,
            'created_at' => $date,
            'updated_at' => $date,
        ])->saveQuietly();
    }
}
