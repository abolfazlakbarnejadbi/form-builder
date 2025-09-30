<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
    {{-- head_tag --}}
    @include('form_construction.layout.head_tag')
    @yield('style')

</head>

<body>
    <!-- Enhanced Top Navigation -->
    {{-- navbar --}}

    <div class="container-fluid">
        <div class="row">
            <!-- Enhanced Sidebar -->
         
            <!-- Sidebar Overlay for Mobile -->
            <div class="sidebar-overlay" id="sidebarOverlay"></div>

            <!-- Main Content Container -->
            {{-- content --}}
            @yield('content')
        </div>
    </div>
    {{-- script --}}
    @include('form_construction.layout.script')
    @yield('script')
    <script>
        var currentPage = $('#mainContent').data('page');
        console.log(currentPage);

        $('.nav-link').each(function() {
            var section = $(this).data('section');
            if (section === currentPage) {
                $(this).addClass('active');
            } else {
                $(this).removeClass('active'); // اگه پیش‌فرض بعضی لینک‌ها active هستن
            }
        });
    </script>
</body>

</html>
