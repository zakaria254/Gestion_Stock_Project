<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Always creates the first admin from ADMIN_EMAIL / ADMIN_ACCESS_CODE.
     * Demo data (users, articles, stock...) is only seeded outside production.
     */
    public function run(): void
    {
        $this->seedAdmin();

        if (app()->isProduction()) {
            return;
        }

        User::factory(10)->create();

        // articles get their stock row from ArticleObserver, movements update it
        $this->call([
            ArticleSeeder::class,
            SupplierSeeder::class,
            ClientSeeder::class,
            ProductionLotSeeder::class,
            StockMovementSeeder::class,
        ]);
    }

    private function seedAdmin(): void
    {
        $email = env('ADMIN_EMAIL');
        $code = env('ADMIN_ACCESS_CODE');

        if (app()->isProduction() && (! $email || ! $code)) {
            throw new RuntimeException('Set ADMIN_EMAIL and ADMIN_ACCESS_CODE before seeding production.');
        }

        User::firstOrCreate(['email' => $email ?: 'admin@example.com'], [
            'nom' => 'Admin',
            'prenom' => 'Super',
            'access_code' => $code ?: 'Admin1234',
            'role' => User::ROLE_ADMIN,
            'status' => User::STATUS_ACTIVE,
        ]);
    }
}
