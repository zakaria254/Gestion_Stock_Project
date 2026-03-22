<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\ProductionLot;
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
        // User::factory(10)->create();

        // User::create([
        //     'nom' => 'admin1',
        //     'prenom'=>  'admin1',
        //     'email' => 'admin1@test.com',
        //     'access_code' => 'admin123',
        //     'role' => 'admin',
        //     'status' => 'active',
        // ]);

        // create 2 production lots for each existing article
        Article::all()->each(function ($article) {
            ProductionLot::factory(2)->create([
                'article_id' => $article->id,
            ]);
        });
    }
}
