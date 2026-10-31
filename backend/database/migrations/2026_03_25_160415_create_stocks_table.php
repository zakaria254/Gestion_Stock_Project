<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->unique()->constrained()->onDelete('cascade');
            $table->decimal('stock_actuel', 10, 2)->default(0);
            $table->decimal('seuil_minimun', 8, 2)->default(20);
            $table->string('status')->default('Rupture');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
