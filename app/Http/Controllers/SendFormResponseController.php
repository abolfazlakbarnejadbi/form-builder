<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Models\Form;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\FormInput;
use App\Models\FormResponse;

class SendFormResponseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $forms = Form::orderBy('created_at', 'desc')->get();
        return view('form.index', compact('forms'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('form.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // این قطعه کد از جی پی تی با لینک https://chatgpt.com/share/68b73d03-ca38-8007-81b9-46e42f3bf496 گرتفه شده
        $html = $request->input('html'); // همون رشته کامل HTML که فرستاده میشه

        // لود کردن HTML
        libxml_use_internal_errors(true);
        $dom = new \DOMDocument();
        $dom->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        // پیدا کردن تگ form
        $forms = $dom->getElementsByTagName('form');
        if ($forms->length > 0) {
            $form = $forms->item(0); // اولین فرم پیدا شده

            // گرفتن محتوای داخلی form بدون خود تگ
            $innerHTML = '';
            foreach ($form->childNodes as $child) {
                $innerHTML .= $dom->saveHTML($child);
            }

            if (Str::length($innerHTML) <= 0) {
                return response()->json(['ok' => false, 'message' => 'هنوز هیچ input وارد نشده']);
            }







            try {
                $random = Str::random(8);
                // dd($request->title);
                DB::transaction(function ()  use ($request, $random, $innerHTML) {

                    $generate_form = Form::create(
                        [
                            'title' => $request->title,
                            'unique_code' => $random,
                            'form_structure' =>  $innerHTML,
                            'status' => 1,
                        ]
                    );

                    //validations
                    $send_validations = [];
                    $final_validations = [];

                    $convert_key_validation = [
                        'required'  => 'required',
                        'minlength' => 'min',
                        'maxlength' => 'max',
                        'accept'    => 'mimes'
                    ];

                    foreach ($request->inputs as $key => $input) {
                        $validations  = $input['validation'];
                        $rules = [];

                        foreach ($validations as $validation) {
                            $key_validation = explode(':', $validation);

                            if (!isset($convert_key_validation[$key_validation[0]])) {
                                continue; // ولیدیشن ناشناخته رو رد می‌کنیم
                            }

                            if (count($key_validation) <= 1) {
                                $rules[] = $convert_key_validation[$key_validation[0]];
                            } else {
                                $rules[] = $convert_key_validation[$key_validation[0]] . ':' . $key_validation[1];
                            }
                        }

                        //Each input must be either mandatory or optional
                        if (!isset($rules[0])) {
                            $rules[] = "nullable";
                        } elseif (isset($rules[0]) && !str_contains($rules[0], 'required')) {
                            $rules[] = "nullable";
                        }


                        //Fixed validations determined by input type
                        $type_input_validation = [
                            'text' => 'string|max:225',
                            'textarea' => 'string|max:500',
                            'number' => 'numeric',
                            'file' => 'size:3000',
                            'email' => 'string|email'
                        ];
                        $send_validations[$key] = implode('|', $rules);
                        $final_validations = $send_validations[$key] ? $send_validations[$key] . '|'  .  $type_input_validation[$input['type']] :  $type_input_validation[$input['type']];

                        $add_input_form = FormInput::create(
                            [
                                'name_field' =>  $input['title'],
                                'input_name' =>  $input['name'],
                                'input_type' =>  $input['type'],
                                'input_validations' =>  $final_validations, //پیش نیاز:تبدیل اعتبار سنجی ها به مقدار های قابل خواندن توسط سیستم request validation
                                'form_id' =>  $generate_form->id,
                            ]
                        );
                    }
                });


                return redirect()->route('form.index')->with('success', 'فرم جدید با موفقیت ساخته شد');
            } catch (\Exception $e) {
                Log::warning('خطا ساخت فرم: ' . $e->getMessage());
                return redirect()->route('form.index')->with('error', 'ساخت فرم با خطا مواجه شد ');
            }
        }
    }

    //this section for test
    public function render()
    {
        $form = Form::find(2)->form_structure; //Form::find(ID column)->form_structure;
        return view('form.render', compact('form'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Form $form)
    {

        $single_responses = FormResponse::where('blog_form_id', $form->id)->OrderBy('created_at', 'desc')->get();
        $row_responses = $single_responses->unique('response_group');

        $count_today_responses = FormResponse::where('blog_form_id', $form->id)->whereDate('created_at', Carbon::today())->get()->unique('response_group')->count();

        $chenge_seen_status = FormResponse::where('blog_form_id', $form->id)
            ->update(['seen' => 1]);
        return view('form.form_response', compact('row_responses', 'form', 'count_today_responses', 'single_responses'));
    }
}
