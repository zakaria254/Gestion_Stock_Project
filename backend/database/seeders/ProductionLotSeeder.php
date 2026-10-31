<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\ProductionLot;
use Illuminate\Database\Seeder;

class ProductionLotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // create 2 production lots for each existing article
        Article::chunk(100, function ($articles) {
            foreach ($articles as $article) {
                ProductionLot::factory(2)->create([
                    'article_id' => $article->id,
                ]);
            }
        });
    }
}
