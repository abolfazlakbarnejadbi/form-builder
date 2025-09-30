<?php

use App\Models\Form;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FormController;
use App\Http\Controllers\SendFormResponseController;

// build form
Route::get('/forms', [FormController::class, 'index'])->name('form.index');
Route::get('/form/create', [FormController::class, 'create'])->name('form.create');
Route::post('/form/store', [FormController::class, 'store'])->name('form.store');
Route::get('/form/show_responses/{form:unique_code}', [FormController::class, 'show'])->name('form.show');

//this section for test
Route::get('/render', function () {
    //this section for test
    {
        $form = Form::first()->form_structure; //Form::find(ID column)->form_structure;
        return view('render.show_form', compact('form'));
    }
});




//use form
Route::post('/send_form/{form:unique_code}', [SendFormResponseController::class, 'store'])->name('main.send_form');
