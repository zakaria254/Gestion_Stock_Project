<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
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
            'stock' => new StockResource($this->whenLoaded('stock')),
            'type' => $this->type,
            'quantite' => $this->quantite,
            'motif' => $this->motif,
            'date' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
