<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isUpdate = $this->user !== null;

        return [
            'nom' => 'required|string|max:99',
            'prenom' => 'required|string|max:99',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->user?->id)],
            // on update an empty code means "keep the current one"
            'access_code' => [$isUpdate ? 'nullable' : 'required', 'string', 'max:64', Password::min(8)->letters()->numbers()],
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_VENTES, User::ROLE_STOCK])],
            'status' => ['nullable', Rule::in([User::STATUS_ACTIVE, User::STATUS_INACTIVE])],
        ];
    }

    /**
     * Validated data without empty optional fields, so they are never overwritten by null.
     *
     * @return array<string, mixed>
     */
    public function userData(): array
    {
        return collect($this->validated())
            ->reject(fn ($value, $key) => in_array($key, ['access_code', 'status']) && blank($value))
            ->all();
    }
}
