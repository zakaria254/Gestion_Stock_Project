<?php

namespace Database\Factories;

use App\Models\Article;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference' => fake()->unique()->bothify('ART-###'),
            'nom' => ucfirst(fake()->words(3, true)),
            'prix' => fake()->randomFloat(2, 1, 499),
            'unite' => fake()->randomElement(['kg', 'piece', 'litre']),
            'categorie' => fake()->randomElement(['Volaille', 'Boeuf', 'Agneau', 'Charcuterie']),
            'seuil_minimum' => fake()->numberBetween(0, 100),
        ];
    }
}
