<?php

namespace Database\Seeders;

use App\Models\Article;
// use App\Models\ProductionLot;
// use App\Models\Stock;
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

        User::create([
            'nom' => 'ZAKARIA',
            'prenom'=>  'DEV',
            'email' => 'admin1@test.com',
            'access_code' => 'admin123',
            'role' => 'admin',
            'status' => 'active',
        ]);
        

        // 2. Call your existing ArticleSeeder (without changing it)
        $this->call([
            ArticleSeeder::class,
        ]);


        
        // create 2 production lots for each existing article
        // Article::chunk(100, function ($articles) {
        //     foreach ($articles as $article) {
        //         ProductionLot::factory(2)->create([
        //             'article_id' => $article->id,
        //         ]);

        //         Stock::factory()->create([
        //             'article_id' => $article->id,
        //         ]);
        //     }  
        // }); 
    }
}

