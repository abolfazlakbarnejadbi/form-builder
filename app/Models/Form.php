<?php

namespace App\Models;

use App\Models\FormResponse;
use Illuminate\Database\Eloquent\Model;

class Form extends Model
{
    protected $fillable = [
        'title',
        'unique_code',
        'status',
        'form_structure'
    ];


 

    public function inputs()
    {
        return $this->hasMany(FormInput::class, 'form_id');
    }

    public function responses(){
        return $this->hasMany(FormResponse::class , 'form_id');
    }
}