<?php

namespace Database\Seeders;

use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StockMovementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Stock::chunk(100, function ($stocks) {
            foreach ($stocks as $stock) {
                StockMovement::factory(2)->create([
                    'stock_id' => $stock->id
                ]);
            } 
        });
    }
}
