  @extends('form_construction.layout.master')
  @section('style')
      <link rel="stylesheet" href="{{ asset('assets/css/form-responses_styles.css') }}">
  @endsection
  @section('content')
      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-5" id="mainContent" data-page="blogCategory">
          <div class="container-fluid">
              <div class="page-header">
                  <div class="d-flex justify-content-between align-items-center flex-wrap">
                      <div>
                          <h1 class="page-title">
                              <i class="fas fa-envelope-open-text text-primary me-2"></i>
                              پاسخ‌های فرم: <span id="formNameTitle">{{ $form->title }}</span>
                          </h1>

                      </div>
                      <div class="page-actions">
                          <button class="btn btn-outline-primary me-2" onclick="window.history.back()">
                              <i class="fas fa-arrow-right me-2"></i>
                              بازگشت
                          </button>

                      </div>
                  </div>
              </div>

              <div class="card mb-4" id="formInfoCard">
                  <div class="card-body">
                      <div class="row align-items-center">
                          <div class="col-md-8">
                              <div class="d-flex align-items-center">
                                  <div class="form-status-badge me-3">
                                      <span class="badge bg-success fs-6">فعال</span>
                                  </div>
                                  <div>
                                      <h5 class="mb-1" id="formInfoName">{{ $form->title }}</h5>
                                      {{-- <p class="text-muted mb-0" id="formInfoDescription">فرم دریافت پیام‌های کاربران و
                                          مشتریان</p> --}}
                                  </div>
                              </div>
                          </div>

                          <div class="col-md-4 text-md-end">
                              <div class="form-stats">
                                  <div class="stat-item">
                                      <span class="stat-value"
                                          id="totalResponses">{{ convertNumbersToPersian($row_responses->count()) }}</span>
                                      <span class="stat-label">کل پاسخ‌ها</span>
                                  </div>
                                  <div class="stat-item">
                                      <span class="stat-value"
                                          id="newResponses">{{ convertNumbersToPersian($count_today_responses, true) }}</span>
                                      <span class="stat-label">جدید امروز</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>



              <div class="card">
                  <div class="card-header">
                      <div class="d-flex justify-content-between align-items-center">
                          <h5 class="card-title mb-0">
                              <i class="fas fa-table me-2"></i>
                              لیست پاسخ‌ها
                          </h5>
                          <div class="table-actions">
                              <div class="form-check">
                                  <input class="form-check-input" type="checkbox" id="selectAll">
                                  <label class="form-check-label" for="selectAll">
                                      انتخاب همه
                                  </label>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="card-body p-0">
                      <div class="table-responsive">

                          <table class="table table-hover mb-0" id="responsesTable">
                              <thead class="table-light">
                                  <tr>
                                      <th width="40">
                                          <div class="form-check">
                                              <input class="form-check-input" type="checkbox" id="selectAllHeader">
                                          </div>
                                      </th>
                                      <th>وضعیت</th>
                                      {{-- Loading the answer column     --}}
                                      @foreach ($form->inputs as $input)
                                          <th>{{ $input->name_field }}</th>
                                      @endforeach
                                      <th>تاریخ ارسال</th>
                                      <th>عملیات</th>
                                  </tr>
                              </thead>
                              <tbody id="responsesTableBody">
                                  {{-- Show posted responses --}}
                                  @foreach ($row_responses as $row_response)
                                      <tr data-response-id="1" class="">
                                          <td>
                                              <div class="form-check">
                                                  <input class="form-check-input response-checkbox" type="checkbox"
                                                      value="1">
                                              </div>
                                          </td>
                                          <td>
                                              <span class="status-badge status-read">خوانده شده</span>
                                          </td>
                                          @foreach ($single_responses->where('response_group', $row_response->response_group) as $single_response)
                                              <td>
                                                  <span class="text-truncate d-inline-block" style="max-width: 200px;"
                                                      title=" {{ $single_response->content }}">
                                                      {{ $single_response->content }}
                                                  </span>
                                              </td>
                                          @endforeach

                                          <td>
                                              <small class="text-muted">
                                                  {{ convertNumbersToPersian(jalaliDate($row_response->created_at, null, true, '%Y/%m/%d')) }}

                                              </small>
                                          </td>
                                          <td>
                                              <div class="d-flex gap-1">
                                                  <button class="action-btn" onclick="viewResponse(1)"
                                                      title="مشاهده جزئیات">
                                                      <i class="fas fa-eye"></i>
                                                  </button>
                                                  <button class="action-btn" onclick="replyToResponse(1)" title="پاسخ">
                                                      <i class="fas fa-reply"></i>
                                                  </button>
                                                  <button class="action-btn" onclick="archiveResponse(1)" title="بایگانی">
                                                      <i class="fas fa-archive"></i>
                                                  </button>
                                                  <button class="action-btn text-danger" onclick="deleteResponse(1)"
                                                      title="حذف">
                                                      <i class="fas fa-trash"></i>
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  @endforeach
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-4">

                  <nav aria-label="صفحه‌بندی پاسخ‌ها">
                      <ul class="pagination" id="pagination"></ul>
                  </nav>
              </div>


              <div class="modal fade" id="responseDetailsModal" tabindex="-1">
                  <div class="modal-dialog modal-lg">
                      <div class="modal-content">
                          <div class="modal-header">
                              <h5 class="modal-title">
                                  <i class="fas fa-envelope-open text-primary me-2"></i>
                                  جزئیات پاسخ
                              </h5>
                              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                          </div>
                          <div class="modal-body" id="responseDetailsBody">
                              Response details will be loaded here
                          </div>
                          <div class="modal-footer">
                              <button type="button" class="btn btn-outline-danger" id="deleteResponseBtn">
                                  <i class="fas fa-trash me-2"></i>
                                  حذف
                              </button>
                              <button type="button" class="btn btn-outline-warning" id="archiveResponseBtn">
                                  <i class="fas fa-archive me-2"></i>
                                  بایگانی
                              </button>
                              <button type="button" class="btn btn-primary" id="replyResponseBtn">
                                  <i class="fas fa-reply me-2"></i>
                                  پاسخ
                              </button>
                              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </main>
  @endsection
  @section('script')
      <script src="{{ asset('assets/js/form-responses-script.js') }}"></script>
  @endsection
