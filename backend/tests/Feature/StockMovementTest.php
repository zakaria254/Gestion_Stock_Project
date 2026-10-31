<?php

use App\Models\Article;
use App\Models\ProductionLot;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->role(User::ROLE_STOCK)->create());
    $this->article = Article::factory()->create(['seuil_minimum' => 10]);
    $this->stock = $this->article->stock;
});

function move(Stock $stock, string $type, float $quantite)
{
    return test()->postJson('/api/movements', [
        'stock_id' => $stock->id, 'type' => $type, 'quantite' => $quantite, 'motif' => 'Test',
    ]);
}

test('an article gets an empty stock in Rupture', function () {
    expect((float) $this->stock->stock_actuel)->toBe(0.0)
        ->and($this->stock->status)->toBe(Stock::STATUS_RUPTURE);
});

test('movements update the quantity and the status', function () {
    move($this->stock, 'in', 50)->assertCreated();
    expect($this->stock->fresh())
        ->stock_actuel->toEqual(50)
        ->status->toBe(Stock::STATUS_DISPONIBLE);

    move($this->stock, 'out', 45)->assertCreated();
    expect($this->stock->fresh())
        ->stock_actuel->toEqual(5)
        ->status->toBe(Stock::STATUS_FAIBLE);
});

test('an out movement larger than the stock is refused with 422 and nothing is saved', function () {
    move($this->stock, 'in', 5);

    move($this->stock, 'out', 6)->assertUnprocessable()->assertJsonValidationErrors('quantite');

    expect($this->stock->fresh()->stock_actuel)->toEqual(5)
        ->and(StockMovement::count())->toBe(1);
});

test('updating a movement applies only the difference', function () {
    move($this->stock, 'in', 20);
    $movement = StockMovement::latest('id')->first();
    move($this->stock, 'out', 8);   // stock = 12

    $this->putJson("/api/movements/{$movement->id}", [
        'stock_id' => $this->stock->id, 'type' => 'in', 'quantite' => 30, 'motif' => 'Fix',
    ])->assertOk();

    expect($this->stock->fresh()->stock_actuel)->toEqual(22);
});

test('moving a movement to another stock restores the old one', function () {
    $other = Article::factory()->create()->stock;
    move($this->stock, 'in', 20);
    $movement = StockMovement::latest('id')->first();

    $this->putJson("/api/movements/{$movement->id}", [
        'stock_id' => $other->id, 'type' => 'in', 'quantite' => 20, 'motif' => 'Wrong article',
    ])->assertOk();

    expect($this->stock->fresh()->stock_actuel)->toEqual(0)
        ->and($other->fresh()->stock_actuel)->toEqual(20);
});

test('deleting a movement reverses it', function () {
    move($this->stock, 'in', 20);
    $movement = StockMovement::latest('id')->first();

    $this->deleteJson("/api/movements/{$movement->id}")->assertNoContent();

    expect($this->stock->fresh()->stock_actuel)->toEqual(0);
});

test('generated movements can not be edited or deleted', function () {
    $movement = StockMovement::create([
        'stock_id' => $this->stock->id, 'type' => 'in', 'quantite' => 10, 'motif' => 'Production', 'is_generated' => true,
    ]);

    $this->deleteJson("/api/movements/{$movement->id}")->assertConflict();
    $this->putJson("/api/movements/{$movement->id}", [
        'stock_id' => $this->stock->id, 'type' => 'in', 'quantite' => 99, 'motif' => 'x',
    ])->assertConflict();

    expect($this->stock->fresh()->stock_actuel)->toEqual(10);
});

test('changing the article threshold recomputes the stock status', function () {
    move($this->stock, 'in', 15);   // Disponible with threshold 10

    $this->article->update(['seuil_minimum' => 20]);

    expect($this->stock->fresh()->status)->toBe(Stock::STATUS_FAIBLE);
});

test('completing a production lot adds it to stock exactly once', function () {
    $this->actingAs(User::factory()->admin()->create());
    $lot = ProductionLot::factory()->create([
        'article_id' => $this->article->id, 'quantite' => 40, 'status' => ProductionLot::STATUS_IN_PROGRESS,
    ]);

    $this->postJson("/api/production_lots/{$lot->id}/complete")->assertOk();
    $this->postJson("/api/production_lots/{$lot->id}/complete")->assertConflict();

    expect($this->stock->fresh()->stock_actuel)->toEqual(40);
});

test('a completed production lot can not be deleted', function () {
    $this->actingAs(User::factory()->admin()->create());
    $lot = ProductionLot::factory()->create([
        'article_id' => $this->article->id, 'status' => ProductionLot::STATUS_COMPLETED,
    ]);

    $this->deleteJson("/api/production_lots/{$lot->id}")->assertConflict();
});
