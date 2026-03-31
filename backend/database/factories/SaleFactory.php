<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Client;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantite = fake()->randomFloat(2, 1, 200);
        $prixUnitaire = fake()->randomFloat(2, 10, 300);

        return [
            'numero' => fake()->unique()->bothify('VNT-####'),
            'client_id' => Client::factory(),
            'article_id' => Article::factory(),
            'quantite' => $quantite,
            'prix_unitaire' => $prixUnitaire,
            'montant_total' => round($quantite * $prixUnitaire, 2),
            'status' => fake()->randomElement(['En attente', 'Payee', 'Annulee']),
            'date_vente' => fake()->date(),
        ];
    }
}
