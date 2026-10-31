<?php

use App\Models\Article;
use App\Models\Client;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\User;
use App\Services\SaleService;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('API errors are JSON even without an Accept header', function () {
    $this->actingAs($this->admin)
        ->get('/api/clients/999999')
        ->assertNotFound()
        ->assertHeader('Content-Type', 'application/json');
});

test('unauthenticated requests get a JSON 401', function () {
    $this->get('/api/clients')->assertUnauthorized()->assertJsonStructure(['message']);
});

test('roles are enforced', function () {
    $stock = User::factory()->role(User::ROLE_STOCK)->create();

    $this->actingAs($stock)->getJson('/api/sales')->assertForbidden();
    $this->actingAs($stock)->getJson('/api/stock')->assertOk();
    $this->actingAs($stock)->getJson('/api/dashboard')->assertForbidden();
});

test('show endpoints return the resource', function () {
    $article = Article::factory()->create();
    $client = Client::factory()->create();

    $this->actingAs($this->admin)->getJson("/api/articles/{$article->id}")->assertOk()->assertJsonPath('data.id', $article->id);
    $this->actingAs($this->admin)->getJson("/api/clients/{$client->id}")->assertOk()->assertJsonPath('data.id', $client->id);
});

test('per_page is honoured and capped', function () {
    Client::factory()->count(3)->create();

    $this->actingAs($this->admin)->getJson('/api/clients?per_page=2')->assertJsonCount(2, 'data');
    $this->actingAs($this->admin)->getJson('/api/clients?per_page=5000')->assertJsonPath('meta.per_page', 100);
});

test('the login route is rate limited per IP', function () {
    foreach (range(1, 10) as $i) {
        $this->postJson('/api/login', ['email' => "u{$i}@example.com", 'access_code' => 'Wrong1234']);
    }

    $this->postJson('/api/login', ['email' => 'other@example.com', 'access_code' => 'Wrong1234'])->assertTooManyRequests();
});

test('the dashboard aggregates stock value and validated sales', function () {
    $article = Article::factory()->create(['prix' => 10]);
    StockMovement::create(['stock_id' => $article->stock->id, 'type' => 'in', 'quantite' => 20, 'motif' => 'Init']);

    app(SaleService::class)->create([
        'numero' => 'VNT-00001', 'client_id' => Client::factory()->create()->id, 'status' => Sale::STATUS_VALIDEE,
        'articles' => [['id' => $article->id, 'quantite' => 5, 'prix_unitaire' => 12]],
    ], $this->admin);

    $response = $this->actingAs($this->admin)->getJson('/api/dashboard')->assertOk();

    expect($response->json('data.stockValue'))->toEqual(150)     // 15 left * 10
        ->and($response->json('data.salesValidee'))->toEqual(60)
        ->and($response->json('data.evolutionVentes'))->toHaveCount(7)
        ->and(end($response->json()['data']['evolutionVentes'])['ventes'])->toEqual(60)
        ->and($response->json('data.topArticles.0.quantite'))->toEqual(5);
});
