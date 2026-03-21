<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// use Illuminate\Support\Facades\Hash;

#[Fillable(['nom', 'prenom', 'email', 'access_code','role', 'status',])]
#[Hidden([ 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;
    
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'access_code' => 'encrypted' //well be decrypted automatically when access it 
        ];
    }

    // public function setAccessCodeAttribute($value)
    // {
    //     $this->attributes['access_code'] = Hash::make($value);
    // }
}
