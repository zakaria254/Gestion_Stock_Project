<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Issue an API token for valid credentials.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $user = $request->authenticate();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
        ]);
    }

    /**
     * Return the authenticated user.
     */
    public function show(Request $request): array
    {
        return (new UserResource($request->user()))->resolve($request);
    }

    /**
     * Revoke the token used for the current request.
     */
    public function destroy(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
