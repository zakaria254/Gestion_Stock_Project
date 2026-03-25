<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Stock;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Article::chunk(100, function ($articles) {
            foreach ($articles as $article) {
                Stock::factory()->create([
                    'article_id' => $article->id,
                ]);
            }  
        });
    }
}
