<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * Plain access code given to every factory user (hashed by the model cast).
     */
    public const ACCESS_CODE = 'Code1234';

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->firstName(),
            'prenom' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'access_code' => self::ACCESS_CODE,
            'role' => fake()->randomElement([User::ROLE_VENTES, User::ROLE_STOCK]),
            'status' => User::STATUS_ACTIVE,
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => ['role' => User::ROLE_ADMIN]);
    }

    public function role(string $role): static
    {
        return $this->state(fn (array $attributes) => ['role' => $role]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['status' => User::STATUS_INACTIVE]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
