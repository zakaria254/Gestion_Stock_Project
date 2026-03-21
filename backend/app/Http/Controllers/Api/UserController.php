<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if (Gate::denies('admin_access')) {
            return response()->json([
                "message" => "you are not authorized !!"
            ], 403);
        }

        $query = User::query();

        if ($request->filled('status')) {
            $query->where('status', $request['status']);
        }

        $users = $query->latest()->paginate(12);

        return UserResource::collection($users);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUpdateUserRequest $request)
    {
        if (Gate::denies('admin_access')) {
            return response()->json([
                "message" => "you are not authorized !!"
            ], 403);
        }

        $validated = $request->validated();
        $user = User::create($validated);
        
        return (new UserResource($user))->response()->setStatusCode(201);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateUserRequest $request, User $user)
    {
        if (Gate::denies('admin_access')) {
            return response()->json([
                "message" => "you are not authorized !!"
            ], 403);
        }

        $validated = $request->validated();
        $user->update($validated);

        return new UserResource($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        if (Gate::denies('admin_access')) {
            return response()->json([
                "message" => "you are not authorized !!"
            ], 403);
        }
        
        $user->delete();

        return response()->json([], 204);
    }
}
