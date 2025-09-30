<?php

namespace App\Models;

use App\Models\FormInput;
use Illuminate\Database\Eloquent\Model;

class FormResponse extends Model
{
    protected $fillable = ['form_id', 'form_input_id', 'content', 'seen', 'response_group'];


    public function input()
    {
        return $this->belongsTo(FormInput::class, 'form_input_id');
    }
}