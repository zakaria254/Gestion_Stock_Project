<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// expired API tokens are refused by Sanctum, this only cleans the table
Schedule::command('sanctum:prune-expired --hours=24')->daily();
