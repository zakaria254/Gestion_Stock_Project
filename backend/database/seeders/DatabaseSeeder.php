<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(10)->create();

        // User::create([
        //     'nom' => 'admin1',
        //     'prenom'=>  'admin1',
        //     'email' => 'admin1@test.com',
        //     'access_code' => 'admin123',
        //     'role' => 'admin',
        //     'status' => 'active',
        // ]);
    }
}
