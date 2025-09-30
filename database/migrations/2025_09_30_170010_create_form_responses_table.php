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
        Schema::create('form_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('forms');
            $table->foreignId('form_input_id')->constrained('form_inputs');
            $table->text('content')->nullable()->comment('Receive response sent from user');
            $table->tinyInteger('seen')->default(0)->comment('0 => unseen , 1 => seen');
            $table->unsignedBigInteger('response_group');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_responses');
    }
};
