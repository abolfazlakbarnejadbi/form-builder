  @extends('form_construction.layout.master')
  @section('style')
      <title>مدیریت فرم ها</title>

      <link rel="stylesheet" href="{{ asset('assets/css/created-forms-styles.css') }}">
  @endsection
  @section('content')
      <main class=" ms-sm-auto  px-md-5" id="mainContent" data-page="blogCategory">
          <div
              class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <div>
                  <h1 class="h2">
                      <i class="fas fa-folder-open text-primary me-2"></i>
                      مدیریت فرم ها
                  </h1>
                  <p class="text-muted mb-0">مدیریت فرم های مفالات</p>
              </div>
              <div class="btn-toolbar mb-2 mb-md-0">
                  <a href="{{ route('form.create') }}" class="btn btn-primary">
                      <i class="fas fa-plus me-2"></i>
                      افزودن فرم جدید
                  </a>
              </div>
          </div>

             

          <!-- Categories Table -->
          <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0">
                  <div class="d-flex justify-content-between align-items-center">
                      <h5 class="card-title mb-0">جدول دسته‌بندی‌ها</h5>
                      <div class="d-flex gap-2">
                          <button class="btn btn-sm btn-outline-secondary" id="bulkDelete" disabled="">
                              <i class="fas fa-trash me-1"></i>
                              حذف گروهی
                          </button>
                          <div class="dropdown">
                              <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                  <i class="fas fa-download me-1"></i>
                                  خروجی
                              </button>
                              <ul class="dropdown-menu">
                                  <li><a class="dropdown-item" href="#"><i
                                              class="fas fa-file-excel me-2"></i>Excel</a></li>
                                  <li><a class="dropdown-item" href="#"><i class="fas fa-file-pdf me-2"></i>PDF</a>
                                  </li>
                                  <li><a class="dropdown-item" href="#"><i class="fas fa-file-csv me-2"></i>CSV</a>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="card-body p-0">
                  <div class="table-responsive">
                      <table class="table table-hover mb-0" id="categoriesTable">
                          <thead class="table-light">
                              <tr>
                                  <th width="40">
                                      <div class="form-check">
                                          <input class="form-check-input" type="checkbox" id="selectAll">
                                      </div>
                                  </th>
                                  <th>نام فرم</th>
                                  <th class="d-none d-lg-table-cell">تعداد پاسخ ارسال شده</th>
                                  <th>وضعیت</th>
                                  <th width="120">عملیات</th>
                              </tr>
                          </thead>
                          <tbody id="categoriesTableBody">
                              @foreach ($forms as $key => $form)
                                  <tr>
                                      <td>{{ convertNumbersToPersian( $key + 1) }}</td>
                                      <td>{{ $form->title }}</td>
                                      <td>{{ convertNumbersToPersian($form->responses->unique('response_group')->count()) }}
                                      </td>

                                      <td>

                                          <span
                                              class="stock-status  {{ $form->status == 0 ? 'low' : 'high' }}">{{ $form->status == 0 ? 'غیر فعال' : 'فعال' }}</span>
                                      </td>

                                      <td>
                                          <div class="action-buttons">
                                           
                                              <a href="{{ route('form.show', $form->unique_code) }}"
                                                  class="btn btn-sm btn-outline-info">
                                                  <i class="fas fa-eye"></i>
                                              </a>

                                          </div>
                                      </td>
                                  </tr>
                              @endforeach

                              <!-- Categories will be populated here -->
                          </tbody>
                      </table>
                  </div>
              </div>
              <div class="card-footer bg-white border-0">
                  <div class="d-flex justify-content-between align-items-center">
                      <div class="text-muted small">
                          نمایش ۱ تا ۸ از ۸ دسته‌بندی
                      </div>
                      <nav>
                          <ul class="pagination pagination-sm mb-0">
                              <li class="page-item disabled">
                                  <a class="page-link" href="#"><i class="fas fa-chevron-right"></i></a>
                              </li>
                              <li class="page-item active">
                                  <a class="page-link" href="#">۱</a>
                              </li>
                              <li class="page-item disabled">
                                  <a class="page-link" href="#"><i class="fas fa-chevron-left"></i></a>
                              </li>
                          </ul>
                      </nav>
                  </div>
              </div>
          </div>
      </main>
  @endsection
