<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\ClientResource;
use App\Http\Resources\ArticleResource;


class FactureResource extends JsonResource
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
            'numero' => $this->numero,
            'sale_id' => $this->sale_id,
            'client' => new ClientResource($this->sale->client),
            'articles' => ArticleResource::collection($this->sale->articles),
            'status' => $this->status,
            'montant_total' => $this->montant_total,
            'date_payment' => $this->date_payment ? $this->date_payment->format('Y-m-d H:i:s') : null,
            'created_at' => $this->created_at->format('Y-m-d H:i:s')
        ];
    }
}
