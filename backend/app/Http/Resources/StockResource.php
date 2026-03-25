<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'article' => new ArticleResource($this->whenLoaded('article')),
            'article_id' => $this->article_id,
            'stock_actuel' => $this->stock_actuel,
            'seuil_minimun' => $this->seuil_minimun,
            'status' => $this->status,
            'created_at' => $this->created_at->format('Y-m-d H:i:s')
        ];
    }
}
