<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>سازنده فرم - Form Builder</title>

    <!-- Bootstrap 5 RTL -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet">

    <!-- Persian Font -->
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">

    <!-- Font Awesome for icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

    <!-- Custom CSS -->
    <link href="{{ asset('assets/css/form-builder.css') }}" rel="stylesheet">
</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-warning">
        <div class="container-fluid">
            <a class="navbar-brand text-dark fw-bold" href="#">
                <i class="fas fa-hammer me-2"></i>
                سازنده فرم
            </a>
            <div class="navbar-nav ms-auto">
                <button class="btn btn-outline-dark me-2" id="previewBtn">
                    <i class="fas fa-eye me-1"></i>
                    پیش‌نمایش
                </button>
                <button class="btn btn-dark" id="saveBtn">
                    <i class="fas fa-save me-1"></i>
                    ذخیره فرم
                </button>
            </div>
        </div>
    </nav>

    <div class="container-fluid h-100">
        <div class="row h-100">
            <div class="d-lg-none col-12 p-2 bg-light border-bottom">
                <div class="btn-group w-100" role="group">
                    <button class="btn btn-outline-secondary active" data-bs-toggle="collapse"
                        data-bs-target="#palettePanel">
                        <i class="fas fa-palette me-1"></i>
                        ابزارها
                    </button>
                    <button class="btn btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#canvasPanel">
                        <i class="fas fa-edit me-1"></i>
                        طراحی
                    </button>
                    <button class="btn btn-outline-secondary" data-bs-toggle="collapse"
                        data-bs-target="#inspectorPanel">
                        <i class="fas fa-cog me-1"></i>
                        تنظیمات
                    </button>
                </div>
            </div>

            <div class="col-lg-3 col-12 p-0 bg-light border-end collapse show" id="palettePanel">
                <div class="p-3">
                    <h5 class="mb-3">
                        <i class="fas fa-palette me-2"></i>
                        ابزارهای فرم
                    </h5>

                    <div class="mb-3">
                        <label class="form-label">عنوان فرم:</label>
                        <input type="text" class="form-control" id="formTitle" placeholder="عنوان فرم را وارد کنید">
                    </div>

                    <div class="mb-4">
                        <h6 class="text-muted mb-2">ابزارهای چیدمان</h6>
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-secondary btn-sm draggable-layout" data-type="row">
                                <i class="fas fa-grip-lines me-2"></i>
                                ردیف جدید
                            </button>
                            <button class="btn btn-outline-secondary btn-sm draggable-layout" data-type="column">
                                <i class="fas fa-columns me-2"></i>
                                ستون جدید
                            </button>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h6 class="text-muted mb-2">عناصر فرم</h6>
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-primary btn-sm draggable-element" data-type="text">
                                <i class="fas fa-font me-2"></i>
                                متن
                            </button>
                            <button class="btn btn-outline-primary btn-sm draggable-element" data-type="email">
                                <i class="fas fa-envelope me-2"></i>
                                ایمیل
                            </button>
                            <button class="btn btn-outline-primary btn-sm draggable-element" data-type="textarea">
                                <i class="fas fa-align-left me-2"></i>
                                متن چندخطی
                            </button>
                            <button class="btn btn-outline-primary btn-sm draggable-element" data-type="number">
                                <i class="fas fa-hashtag me-2"></i>
                                عدد
                            </button>
                            <button class="btn btn-outline-primary btn-sm draggable-element" data-type="date">
                                <i class="fas fa-calendar me-2"></i>
                                تاریخ
                            </button>
                            <button class="btn btn-outline-primary btn-sm draggable-element" data-type="select">
                                <i class="fas fa-list me-2"></i>
                                لیست کشویی
                            </button>
                            <button class="btn btn-outline-primary btn-sm draggable-element" data-type="radio">
                                <i class="fas fa-dot-circle me-2"></i>
                                انتخاب یکی
                            </button>
                            <button class="btn btn-outline-primary btn-sm draggable-element" data-type="checkbox">
                                <i class="fas fa-check-square me-2"></i>
                                چندانتخابی
                            </button>
                            <button class="btn btn-outline-primary btn-sm draggable-element" data-type="file">
                                <i class="fas fa-file-upload me-2"></i>
                                آپلود فایل
                            </button>
                            <button class="btn btn-outline-primary btn-sm draggable-element" data-type="switch">
                                <i class="fas fa-toggle-on me-2"></i>
                                کلید
                            </button>
                            <button class="btn btn-outline-primary btn-sm draggable-element" data-type="hidden">
                                <i class="fas fa-eye-slash me-2"></i>
                                مخفی
                            </button>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h6 class="text-muted mb-2">عناصر محتوا</h6>
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-info btn-sm draggable-element" data-type="heading">
                                <i class="fas fa-heading me-2"></i>
                                عنوان
                            </button>
                            <button class="btn btn-outline-info btn-sm draggable-element" data-type="paragraph">
                                <i class="fas fa-paragraph me-2"></i>
                                پاراگراف
                            </button>
                            <button class="btn btn-outline-info btn-sm draggable-element" data-type="divider">
                                <i class="fas fa-minus me-2"></i>
                                جداکننده
                            </button>
                            <button class="btn btn-outline-success btn-sm draggable-element" data-type="button">
                                <i class="fas fa-mouse-pointer me-2"></i>
                                دکمه
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-6 col-12 p-0 collapse show" id="canvasPanel">
                <div class="canvas-container h-100">
                    <div class="canvas-header p-3 bg-secondary text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-edit me-2"></i>
                            طراحی فرم
                        </h5>
                    </div>
                    <div class="canvas-content p-3" id="formCanvas">
                        <div class="empty-canvas text-center text-muted py-5">
                            <i class="fas fa-mouse-pointer fa-3x mb-3"></i>
                            <h4>فرم خود را بسازید</h4>
                            <p>عناصر را از پنل سمت راست به اینجا بکشید</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-3 col-12 p-0 bg-light border-start collapse show" id="inspectorPanel">
                <div class="inspector-container h-100">
                    <div class="inspector-header p-3 bg-warning text-dark">
                        <h5 class="mb-0">
                            <i class="fas fa-cog me-2"></i>
                            تنظیمات
                        </h5>
                    </div>
                    <div class="inspector-content p-3" id="inspectorContent">
                        <div class="text-center text-muted py-5">
                            <i class="fas fa-mouse-pointer fa-2x mb-3"></i>
                            <p>یک عنصر را انتخاب کنید</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="previewModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-warning text-dark">
                    <h5 class="modal-title">
                        <i class="fas fa-eye me-2"></i>
                        پیش‌نمایش فرم
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="previewContent">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        var url_client = @json(route('form.store') . '?_token=' . csrf_token());
        
    </script>
    <script src="{{ asset('assets/js/form-builder.js') }}"></script>


</body>

</html>