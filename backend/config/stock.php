<?php

return [

    /*
    | VAT applied to a validated sale to compute the invoice amount.
    */
    'tva_rate' => (float) env('TVA_RATE', 0.20),

];
