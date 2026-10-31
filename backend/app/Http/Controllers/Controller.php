<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * Page size from ?per_page=, 12 by default, capped to keep responses small.
     */
    protected function perPage(): int
    {
        return min(max(request()->integer('per_page', 12), 1), 100);
    }
}
