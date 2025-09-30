<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('form_inputs', function (Blueprint $table) {
            $table->id();
            $table->string('name_field');
            $table->foreignId('form_id')->constrained('forms')->onUpdate('cascade')->onDelete('cascade');
            $table->string('input_type');
            $table->string('input_name');
            $table->text('input_validations')->nullable();
            $table->timestamps();
        });
    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_inputs');
    }
};
