<?php

namespace App\Providers;

use App\Models\Stock;
use App\Observers\StockObserver;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
        
        //app abservers
        Stock::observe(StockObserver::class);


        //app gates and permission
        Gate::define('admin_only', function ($user) {
            return $user && $user->role === "admin" ;
        });

        Gate::define('ventes_admin_access', function ($user) {
            return $user && in_array($user->role, ["admin", "ventes"]);
        });

        Gate::define('stock_admin_access', function ($user) {
            return $user && in_array($user->role, ["admin", "stock"]);
        });

        Gate::define('manage_articles', function ($user) {
            return $user && in_array($user->role, ["admin", "ventes", "stock"]);
        });
    }
}
