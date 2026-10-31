<?php

use App\Models\Article;
use App\Models\Client;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->actingAs($this->admin);
});

test('a client with sales can not be deleted', function () {
    $sale = Sale::factory()->create(['user_id' => $this->admin->id]);

    $this->deleteJson("/api/clients/{$sale->client_id}")->assertConflict();

    expect(Sale::count())->toBe(1);
});

test('a client without sales can be deleted', function () {
    $client = Client::factory()->create();

    $this->deleteJson("/api/clients/{$client->id}")->assertNoContent();
});

test('an article with stock history can not be deleted', function () {
    $article = Article::factory()->create();
    StockMovement::create(['stock_id' => $article->stock->id, 'type' => 'in', 'quantite' => 5, 'motif' => 'Init']);

    $this->deleteJson("/api/articles/{$article->id}")->assertConflict();

    expect(StockMovement::count())->toBe(1);
});

test('an unused article can be deleted with its stock row', function () {
    $article = Article::factory()->create();

    $this->deleteJson("/api/articles/{$article->id}")->assertNoContent();
});

test('a user with sales can not be deleted', function () {
    $seller = User::factory()->create();
    Sale::factory()->create(['user_id' => $seller->id]);

    $this->deleteJson("/api/users/{$seller->id}")
        ->assertConflict()
        ->assertJsonPath('message', fn ($m) => str_contains($m, 'Deactivate'));
});

test('the sale date defaults to the insert time, not the migration time', function () {
    $client = Client::factory()->create();

    $id = DB::table('sales')->insertGetId([
        'numero' => 'VNT-1', 'user_id' => $this->admin->id, 'client_id' => $client->id, 'montant_total' => 0,
    ]);

    expect(Sale::find($id)->date_vente->isToday())->toBeTrue();
});
