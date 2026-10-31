<?php

use App\Http\Middleware\EnsureUserIsActive;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // token-only API: no Sanctum stateful (cookie + CSRF) middleware
        $middleware->throttleApi();

        // no login page to redirect to: unauthenticated API calls get a JSON 401
        $middleware->redirectGuestsTo(fn (Request $request) => $request->is('api/*') ? null : '/');

        $middleware->alias([
            'active' => EnsureUserIsActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // API errors are always JSON, whatever the Accept header
        $exceptions->shouldRenderJsonWhen(fn (Request $request) => $request->is('api/*') || $request->expectsJson());

        // a parent row still referenced by sales, invoices or movements (restricted foreign keys)
        $exceptions->render(function (QueryException $e, Request $request) {
            $isConstraintViolation = in_array($e->getCode(), ['23000', '23503'], true);

            if ($request->is('api/*') && $isConstraintViolation && $request->isMethod('DELETE')) {
                return response()->json([
                    'message' => 'This record is used by other records (sales, invoices, stock movements) and can not be deleted.',
                ], 409);
            }
        });
    })->create();
