<?php

namespace Database\Factories;

use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'stock_id' => Stock::factory(),
            // "out" could exceed the generated stock and be refused
            'type' => 'in',
            'quantite' => fake()->numberBetween(40, 700),
            'motif' => fake()->randomElement(['Production', 'Vente', 'Perte', 'Annulation Vente']),
        ];
    }
}
