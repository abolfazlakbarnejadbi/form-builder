<?php
function convertNumbersToPersian($value, $number_format = false, $decimal = 0)
{
    if ($number_format && is_numeric($value)) {
        $value = number_format($value, $decimal);
    }

    $english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
    $persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '٫'];

    return str_replace($english, $persian, $value);
}
