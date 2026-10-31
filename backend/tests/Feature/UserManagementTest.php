<?php

use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('only admins can manage users', function () {
    $this->actingAs(User::factory()->role(User::ROLE_VENTES)->create())
        ->getJson('/api/users')->assertForbidden();

    $this->actingAs($this->admin)->getJson('/api/users')->assertOk();
});

test('the users list never exposes access codes', function () {
    $this->actingAs($this->admin)->getJson('/api/users')
        ->assertOk()
        ->assertJsonMissingPath('data.0.access_code');
});

test('a weak access code is rejected', function () {
    $this->actingAs($this->admin)->postJson('/api/users', [
        'nom' => 'Doe', 'prenom' => 'John', 'email' => 'john@example.com',
        'access_code' => '123456', 'role' => 'ventes',
    ])->assertUnprocessable()->assertJsonValidationErrors('access_code');
});

test('updating a user without an access code keeps the current one', function () {
    $user = User::factory()->create();
    $hash = $user->getAttributes()['access_code'];

    $this->actingAs($this->admin)->putJson("/api/users/{$user->id}", [
        'nom' => 'New', 'prenom' => $user->prenom, 'email' => $user->email,
        'access_code' => '', 'role' => $user->role,
    ])->assertOk()->assertJsonPath('data.nom', 'New');

    expect($user->fresh()->getAttributes()['access_code'])->toBe($hash);
});

test('deactivating a user revokes their tokens', function () {
    $user = User::factory()->create();
    $user->createToken('auth_token');

    $this->actingAs($this->admin)->putJson("/api/users/{$user->id}", [
        'nom' => $user->nom, 'prenom' => $user->prenom, 'email' => $user->email,
        'role' => $user->role, 'status' => 'inactive',
    ])->assertOk();

    expect($user->tokens()->count())->toBe(0);
});

test('an admin can not delete their own account', function () {
    $this->actingAs($this->admin)->deleteJson("/api/users/{$this->admin->id}")->assertConflict();
});

test('the last active admin can not be demoted', function () {
    $this->actingAs($this->admin)->putJson("/api/users/{$this->admin->id}", [
        'nom' => $this->admin->nom, 'prenom' => $this->admin->prenom, 'email' => $this->admin->email,
        'role' => 'ventes',
    ])->assertConflict();
});
