<?php

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Access codes were stored with the reversible "encrypted" cast.
     * Re-store them as one-way hashes so they can't be read back.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // hashes are salted, a unique index on them is meaningless
            $table->dropUnique(['access_code']);
        });

        DB::table('users')->select(['id', 'access_code'])->orderBy('id')->each(function ($user) {
            if (Hash::isHashed($user->access_code)) {
                return;
            }

            try {
                $plain = Crypt::decryptString($user->access_code);
            } catch (DecryptException) {
                // value was stored in clear text before the encrypted cast existed
                $plain = $user->access_code;
            }

            DB::table('users')->where('id', $user->id)->update([
                'access_code' => Hash::make($plain),
            ]);
        });
    }

    /**
     * Hashing is irreversible: only the index is restored.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unique('access_code');
        });
    }
};
