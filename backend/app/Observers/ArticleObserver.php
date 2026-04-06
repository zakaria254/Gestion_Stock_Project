<?php

namespace App\Observers;

use App\Models\Article;
use App\Models\Stock;

class ArticleObserver
{
    /**
     * Handle the Article "created" event.
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
        if ($article->wasChanged('seuil_minimum')) {
            $article->stock()->update([
                'seuil_minimun' => $article->seuil_minimum
            ]);
        }
    }

    /**
     * Handle the Article "deleted" event.
     */
    public function deleted(Article $article): void
    {
        //
    }

    /**
     * Handle the Article "restored" event.
     */
    public function restored(Article $article): void
    {
        //
    }

    /**
     * Handle the Article "force deleted" event.
     */
    public function forceDeleted(Article $article): void
    {
        //
    }
}
