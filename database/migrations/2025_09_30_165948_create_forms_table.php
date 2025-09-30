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
       Schema::create('forms', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('unique_code')->unique();
            $table->text('form_structure');
            $table->tinyInteger('status')->default(1)->comment('0 => unactive , 1 => active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forms');
    }
};
