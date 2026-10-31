<?php

namespace App\Observers;

use App\Models\Article;
use App\Models\Stock;

class ArticleObserver
{
    /**
     * Every article gets its stock row.
     */
    public function created(Article $article): void
    {
        Stock::create([
            'article_id' => $article->id,
            'stock_actuel' => 0,
            'seuil_minimun' => $article->seuil_minimum,
        ]);
    }

    /**
     * Handle the Article "updated" event.
     */
    public function updated(Article $article): void
    {
        // model update (not a query update) so StockObserver recomputes the status
        if ($article->wasChanged('seuil_minimum')) {
            $article->stock()->first()?->update([
                'seuil_minimun' => $article->seuil_minimum,
            ]);
        }
    }
}
