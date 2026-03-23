<?php

namespace Database\Seeders;

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
        ProductionLot::factory(2)->create();
    }
}
