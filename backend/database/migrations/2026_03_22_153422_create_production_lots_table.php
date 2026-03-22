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
        Schema::create('production_lots', function (Blueprint $table) {
            $table->id();
            $table->string('numero_lot')->unique();
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->decimal('quantite',10,2);
            $table->enum('status', ['AVAILABLE', 'IN_PROGRESS', 'COMPLETED']);
            $table->date('date_production');
            $table->string('certificat_abattage');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_lots');
    }
};
