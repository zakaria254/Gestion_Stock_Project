<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\ProductionLot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductionLot>
 */
class ProductionLotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'numero_lot' => fake()->unique()->bothify('LOT-'.fake()->date('Y').'-####'),
            // automatically create an article for the lot if no article is passed to it
            'article_id' => Article::factory(),
            'quantite' => fake()->randomFloat(2, 10, 1000),
            'status' => fake()->randomElement(['AVAILABLE', 'IN_PROGRESS', 'COMPLETED']),
            'date_production' => fake()->date(),
            'certificat_abattage' => fake()->bothify('CERT-####'),
        ];
    }
}
