<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $users = $query->latest()->paginate($this->perPage());

        return UserResource::collection($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUpdateUserRequest $request)
    {
        $user = User::create($request->userData());

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateUserRequest $request, User $user)
    {
        $data = $request->userData();

        $losesAdminAccess = $user->isAdmin()
            && (($data['role'] ?? $user->role) !== User::ROLE_ADMIN
                || ($data['status'] ?? $user->status) !== User::STATUS_ACTIVE);

        if ($losesAdminAccess && $this->isLastActiveAdmin($user)) {
            return response()->json([
                'message' => 'The last active admin can not be demoted or deactivated.',
            ], 409);
        }

        $user->update($data);

        // a deactivated account or a new access code must end the existing sessions
        if (! $user->isActive() || $user->wasChanged('access_code')) {
            $user->tokens()->delete();
        }

        return new UserResource($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user)
    {
        if ($user->is($request->user())) {
            return response()->json([
                'message' => 'You can not delete your own account.',
            ], 409);
        }

        if ($user->isAdmin() && $this->isLastActiveAdmin($user)) {
            return response()->json([
                'message' => 'The last active admin can not be deleted.',
            ], 409);
        }

        if ($user->sales()->exists()) {
            return response()->json([
                'message' => 'This user has sales and can not be deleted. Deactivate the account instead.',
            ], 409);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }

    private function isLastActiveAdmin(User $user): bool
    {
        return ! User::where('role', User::ROLE_ADMIN)
            ->where('status', User::STATUS_ACTIVE)
            ->whereKeyNot($user->id)
            ->exists();
    }
}
