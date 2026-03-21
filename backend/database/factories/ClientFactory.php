<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->name(),
            'adresse' => fake()->address(),
            'contact' => fake()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'type' => fake()->randomElement(["boutique", "entreprise", "vente_local" ]),
        ];
    }
}
