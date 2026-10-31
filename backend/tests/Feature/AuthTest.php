<?php

use App\Models\User;
use Database\Factories\UserFactory;
use Illuminate\Support\Facades\Hash;

test('a user can log in with email and access code', function () {
    $user = User::factory()->create();

    $this->postJson('/api/login', [
        'email' => $user->email,
        'access_code' => UserFactory::ACCESS_CODE,
    ])->assertOk()->assertJsonStructure(['token']);
});

test('a wrong access code is rejected', function () {
    $user = User::factory()->create();

    $this->postJson('/api/login', [
        'email' => $user->email,
        'access_code' => 'Wrong1234',
    ])->assertUnprocessable()->assertJsonValidationErrors('email');
});

test('login is locked after 5 failed attempts', function () {
    $user = User::factory()->create();

    foreach (range(1, 5) as $i) {
        $this->postJson('/api/login', ['email' => $user->email, 'access_code' => 'Wrong1234']);
    }

    $this->postJson('/api/login', [
        'email' => $user->email,
        'access_code' => UserFactory::ACCESS_CODE,
    ])->assertUnprocessable();
});

test('an inactive user can not log in', function () {
    $user = User::factory()->inactive()->create();

    $this->postJson('/api/login', [
        'email' => $user->email,
        'access_code' => UserFactory::ACCESS_CODE,
    ])->assertForbidden();
});

test('a token of a deactivated user is rejected', function () {
    $user = User::factory()->create();
    $token = $user->createToken('auth_token')->plainTextToken;

    $user->update(['status' => User::STATUS_INACTIVE]);

    $this->withToken($token)->getJson('/api/user')->assertForbidden();
});

test('the access code is stored hashed and never returned', function () {
    $user = User::factory()->create();

    expect(Hash::isHashed($user->getAttributes()['access_code']))->toBeTrue();

    $this->actingAs($user)->getJson('/api/user')
        ->assertOk()
        ->assertJsonMissingPath('access_code')
        ->assertJsonPath('nom', $user->nom)
        ->assertJsonPath('prenom', $user->prenom);
});

test('logout revokes the current token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('auth_token')->plainTextToken;

    $this->withToken($token)->postJson('/api/logout')->assertNoContent();

    expect($user->tokens()->count())->toBe(0);
});

test('the leftover session auth routes are gone', function () {
    $this->postJson('/register')->assertNotFound();
    $this->postJson('/forgot-password')->assertNotFound();
});
