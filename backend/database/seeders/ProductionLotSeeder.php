<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\ProductionLot;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductionLotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //create 10 new production lots and 10 new articles linked back to each lot automatically
        // ProductionLot::factory(10)->create();

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
