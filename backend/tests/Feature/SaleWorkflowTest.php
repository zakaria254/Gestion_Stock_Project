<?php

use App\Models\Article;
use App\Models\Client;
use App\Models\Facture;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\User;

beforeEach(function () {
    $this->seller = User::factory()->role(User::ROLE_VENTES)->create();
    $this->actingAs($this->seller);
    $this->client = Client::factory()->create();
    $this->article = Article::factory()->create(['seuil_minimum' => 0]);
    // put 100 units in stock
    StockMovement::create(['stock_id' => $this->article->stock->id, 'type' => 'in', 'quantite' => 100, 'motif' => 'Init']);
});

function salePayload(array $overrides = []): array
{
    return array_merge([
        'numero' => 'VNT-'.fake()->unique()->numerify('######'),
        'client_id' => test()->client->id,
        'articles' => [['id' => test()->article->id, 'quantite' => 10, 'prix_unitaire' => 5]],
    ], $overrides);
}

test('a sale is created pending without touching stock', function () {
    $this->postJson('/api/sales', salePayload())
        ->assertCreated()
        ->assertJsonPath('data.status', Sale::STATUS_EN_ATTENTE)
        ->assertJsonPath('data.montant_total', '50.00');

    expect($this->article->stock->fresh()->stock_actuel)->toEqual(100);
});

test('validating a sale moves stock out and creates one invoice with VAT', function () {
    $sale = Sale::find($this->postJson('/api/sales', salePayload())->json('data.id'));

    $this->postJson("/api/sales/{$sale->id}/validate")->assertOk()->assertJsonPath('data.status', Sale::STATUS_VALIDEE);
    $this->postJson("/api/sales/{$sale->id}/validate")->assertConflict();

    expect($this->article->stock->fresh()->stock_actuel)->toEqual(90)
        ->and($sale->facture()->count())->toBe(1)
        ->and((float) $sale->facture->montant_total)->toBe(60.0)
        ->and($sale->facture->numero)->toStartWith('FAC-');
});

test('a sale created as Validee also gets its invoice and stock movement', function () {
    $id = $this->postJson('/api/sales', salePayload(['status' => Sale::STATUS_VALIDEE]))
        ->assertCreated()
        ->assertJsonPath('data.status', Sale::STATUS_VALIDEE)
        ->json('data.id');

    expect(Facture::where('sale_id', $id)->count())->toBe(1)
        ->and($this->article->stock->fresh()->stock_actuel)->toEqual(90);
});

test('validating a sale with insufficient stock fails and changes nothing', function () {
    $id = $this->postJson('/api/sales', salePayload([
        'articles' => [['id' => $this->article->id, 'quantite' => 500, 'prix_unitaire' => 5]],
    ]))->json('data.id');

    $this->postJson("/api/sales/{$id}/validate")->assertUnprocessable();

    expect(Sale::find($id)->status)->toBe(Sale::STATUS_EN_ATTENTE)
        ->and(Facture::count())->toBe(0)
        ->and($this->article->stock->fresh()->stock_actuel)->toEqual(100);
});

test('a sale without status in the payload is created pending', function () {
    $this->postJson('/api/sales', salePayload())->assertCreated();
});

test('update can not change the status nor the creator', function () {
    $id = $this->postJson('/api/sales', salePayload())->json('data.id');

    $this->actingAs(User::factory()->admin()->create())
        ->putJson("/api/sales/{$id}", salePayload(['status' => Sale::STATUS_VALIDEE]))
        ->assertOk()
        ->assertJsonPath('data.status', Sale::STATUS_EN_ATTENTE);

    expect(Sale::find($id)->user_id)->toBe($this->seller->id);
});

test('update replaces the lines and the total', function () {
    $other = Article::factory()->create();
    $id = $this->postJson('/api/sales', salePayload())->json('data.id');

    $this->putJson("/api/sales/{$id}", salePayload([
        'articles' => [['id' => $other->id, 'quantite' => 2, 'prix_unitaire' => 3]],
    ]))->assertOk()->assertJsonPath('data.montant_total', '6.00')->assertJsonCount(1, 'data.articles');
});

test('a validated sale can not be updated, canceled or deleted', function () {
    $id = $this->postJson('/api/sales', salePayload(['status' => Sale::STATUS_VALIDEE]))->json('data.id');

    $this->putJson("/api/sales/{$id}", salePayload())->assertConflict();
    $this->postJson("/api/sales/{$id}/cancel")->assertConflict();
    $this->deleteJson("/api/sales/{$id}")->assertConflict();
});

test('the same article can not appear twice in a sale', function () {
    $line = ['id' => $this->article->id, 'quantite' => 1, 'prix_unitaire' => 1];

    $this->postJson('/api/sales', salePayload(['articles' => [$line, $line]]))
        ->assertUnprocessable()->assertJsonValidationErrors('articles.0.id');
});

test('a canceled sale can be deleted', function () {
    $id = $this->postJson('/api/sales', salePayload())->json('data.id');

    $this->postJson("/api/sales/{$id}/cancel")->assertOk()->assertJsonPath('data.status', Sale::STATUS_ANNULEE);
    $this->deleteJson("/api/sales/{$id}")->assertNoContent();
});

test('state changes are not reachable with GET', function () {
    $id = $this->postJson('/api/sales', salePayload())->json('data.id');

    $this->getJson("/api/sales/validate/{$id}")->assertNotFound();
    $this->getJson("/api/sales/{$id}/validate")->assertMethodNotAllowed();
});

test('invoice payment workflow', function () {
    $id = $this->postJson('/api/sales', salePayload(['status' => Sale::STATUS_VALIDEE]))->json('data.id');
    $facture = Facture::where('sale_id', $id)->first();

    $this->getJson("/api/factures/{$facture->id}")->assertOk()->assertJsonPath('data.status', Facture::STATUS_PENDING);
    $this->postJson("/api/factures/{$facture->id}/unpaid")->assertOk()->assertJsonPath('data.status', Facture::STATUS_UNPAID);
    $this->postJson("/api/factures/{$facture->id}/unpaid")->assertConflict();
    $this->postJson("/api/factures/{$facture->id}/paid")->assertOk()->assertJsonPath('data.status', Facture::STATUS_PAID);
    $this->postJson("/api/factures/{$facture->id}/paid")->assertConflict();
});
