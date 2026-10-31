<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Stock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Stock>
 */
class StockFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // ArticleObserver already creates a stock row: build the article without events
            'article_id' => fn () => Article::withoutEvents(fn () => Article::factory()->create())->id,
            'stock_actuel' => fake()->randomFloat(2, 0, 100),
            'seuil_minimun' => fake()->numberBetween(10, 30),
        ];
    }
}
