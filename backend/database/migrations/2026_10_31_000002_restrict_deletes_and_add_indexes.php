<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Foreign keys whose rows are business history: deleting the parent must be refused
     * instead of silently deleting sales, invoices or stock movements.
     *
     * @var array<string, array<int, array{0: string, 1: string}>>
     */
    private array $restricted = [
        'sales' => [['user_id', 'users'], ['client_id', 'clients']],
        'sale_article' => [['article_id', 'articles']],
        'factures' => [['sale_id', 'sales']],
        'stock_movements' => [['stock_id', 'stocks']],
        'production_lots' => [['article_id', 'articles']],
    ];

    public function up(): void
    {
        $this->setOnDelete('restrict');

        Schema::table('sales', function (Blueprint $table) {
            // the old default was the date the migration ran, not the sale date
            $table->dateTime('date_vente')->useCurrent()->change();
            $table->index('status');
            $table->index('created_at');
        });

        Schema::table('factures', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('factures', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
            $table->date('date_vente')->change();
        });

        $this->setOnDelete('cascade');
    }

    private function setOnDelete(string $action): void
    {
        foreach ($this->restricted as $tableName => $keys) {
            Schema::table($tableName, function (Blueprint $table) use ($keys, $action) {
                foreach ($keys as [$column, $parent]) {
                    $table->dropForeign([$column]);
                    $table->foreign($column)->references('id')->on($parent)->onDelete($action);
                }
            });
        }
    }
};
