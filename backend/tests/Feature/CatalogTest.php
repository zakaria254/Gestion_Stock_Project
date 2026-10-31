<?php

use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->admin()->create());
});

test('the health check is up', function () {
    $this->get('/up')->assertOk();
});

test('creating an article creates its stock', function () {
    $this->postJson('/api/articles', [
        'reference' => 'ART-001', 'nom' => 'Poulet', 'prix' => 35, 'unite' => 'kg',
        'categorie' => 'Volaille', 'seuil_minimum' => 10,
    ])->assertCreated();

    expect(Stock::count())->toBe(1)
        ->and((float) Stock::first()->seuil_minimun)->toBe(10.0);
});

test('article validation', function () {
    $this->postJson('/api/articles', ['categorie' => 'Poisson', 'prix' => -1])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['reference', 'nom', 'prix', 'unite', 'categorie', 'seuil_minimum']);
});

test('client email and contact are unique', function () {
    $payload = ['nom' => 'Boutique', 'adresse' => 'Agadir', 'email' => 'shop@example.com', 'contact' => '0600000000'];

    $this->postJson('/api/clients', $payload)->assertCreated();
    $this->postJson('/api/clients', $payload)->assertUnprocessable()->assertJsonValidationErrors(['email', 'contact']);
});

test('suppliers CRUD', function () {
    $id = $this->postJson('/api/suppliers', ['nom' => 'Ferme', 'adresse' => 'Taroudant'])->assertCreated()->json('data.id');

    $this->putJson("/api/suppliers/{$id}", ['nom' => 'Ferme bio', 'adresse' => 'Taroudant'])
        ->assertOk()->assertJsonPath('data.nom', 'Ferme bio');
    $this->deleteJson("/api/suppliers/{$id}")->assertNoContent();

    expect(Supplier::count())->toBe(0);
});

test('stock and movement factories produce consistent data', function () {
    $movement = StockMovement::factory()->create(['quantite' => 15]);

    expect($movement->stock->fresh()->stock_actuel)->toBeGreaterThanOrEqual(15);
});
