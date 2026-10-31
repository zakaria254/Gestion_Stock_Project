<?php

namespace App\Providers;

use App\Models\Article;
use App\Models\ProductionLot;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\User;
use App\Observers\ArticleObserver;
use App\Observers\ProductionLotObserver;
use App\Observers\StockMovementObserver;
use App\Observers\StockObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void {}

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // app observers
        Stock::observe(StockObserver::class);
        Article::observe(ArticleObserver::class);
        ProductionLot::observe(ProductionLotObserver::class);
        StockMovement::observe(StockMovementObserver::class);

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        // on top of the per email+IP lockout done in LoginRequest
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // app gates and permission
        Gate::define('admin_only', function (User $user) {
            return $user->role === User::ROLE_ADMIN;
        });

        Gate::define('ventes_admin_access', function (User $user) {
            return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_VENTES]);
        });

        Gate::define('stock_admin_access', function (User $user) {
            return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_STOCK]);
        });

        Gate::define('manage_articles', function (User $user) {
            return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_VENTES, User::ROLE_STOCK]);
        });
    }
}
