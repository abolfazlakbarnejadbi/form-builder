<?php

namespace App\Models;

use App\Models\FormResponse;
use Illuminate\Database\Eloquent\Model;

class FormInput extends Model
{
    protected $fillable = [
        'name_field',
        'input_name',
        'input_type',
        'input_validations',
        'form_id',
        'input_type'
    ];


    public function responses()
    {
        return $this->hasMany(FormResponse::class, 'form_input_id');
    }
}