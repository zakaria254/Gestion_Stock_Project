<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Reject requests made with a token that belongs to a deactivated account.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->isActive()) {
            return response()->json(['message' => 'Account is inactive. Contact admin.'], 403);
        }

        return $next($request);
    }
}
