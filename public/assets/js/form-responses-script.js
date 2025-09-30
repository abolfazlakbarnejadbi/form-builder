$(document).ready(() => {
  console.log("Form Responses page initializing...")

  // Get current form data from localStorage
  const currentForm = JSON.parse(localStorage.getItem("currentForm") || "{}")

  // Sample responses data
  // const responsesData = [
  //   {
  //     id: 1,
  //     formId: 1,
  //     status: "new",
  //     submittedAt: "2024-01-20T10:30:00",
  //     ipAddress: "192.168.1.100",
  //     data: {
  //       name: "احمد محمدی",
  //       email: "ahmad@example.com",
  //       phone: "09123456789",
  //       subject: "سوال درباره محصولات",
  //       message: "سلام، می‌خواستم درباره محصولات جدید شما اطلاعات بیشتری کسب کنم.",
  //     },
  //   },
  //   {
  //     id: 2,
  //     formId: 1,
  //     status: "read",
  //     submittedAt: "2024-01-20T09:15:00",
  //     ipAddress: "192.168.1.101",
  //     data: {
  //       name: "فاطمه احمدی",
  //       email: "fateme@example.com",
  //       phone: "09987654321",
  //       subject: "شکایت از خدمات",
  //       message: "متأسفانه از کیفیت خدمات ارائه شده راضی نیستم و انتظار بهبود دارم.",
  //     },
  //   },
  //   {
  //     id: 3,
  //     formId: 1,
  //     status: "replied",
  //     submittedAt: "2024-01-19T16:45:00",
  //     ipAddress: "192.168.1.102",
  //     data: {
  //       name: "علی رضایی",
  //       email: "ali@example.com",
  //       phone: "09111111111",
  //       subject: "درخواست همکاری",
  //       message: "سلام، علاقه‌مند به همکاری با شرکت شما هستم. لطفاً راهنمایی کنید.",
  //     },
  //   },
  //   {
  //     id: 4,
  //     formId: 1,
  //     status: "new",
  //     submittedAt: "2024-01-19T14:20:00",
  //     ipAddress: "192.168.1.103",
  //     data: {
  //       name: "مریم کریمی",
  //       email: "maryam@example.com",
  //       phone: "09222222222",
  //       subject: "سوال فنی",
  //       message: "در استفاده از سیستم شما با مشکل مواجه شده‌ام. آیا می‌توانید راهنمایی کنید؟",
  //     },
  //   },
  //   {
  //     id: 5,
  //     formId: 1,
  //     status: "archived",
  //     submittedAt: "2024-01-18T11:30:00",
  //     ipAddress: "192.168.1.104",
  //     data: {
  //       name: "حسن موسوی",
  //       email: "hassan@example.com",
  //       phone: "09333333333",
  //       subject: "پیشنهاد بهبود",
  //       message: "پیشنهاد می‌کنم قابلیت جدیدی به سیستم اضافه کنید که کار را راحت‌تر کند.",
  //     },
  //   },
  // ]

  let currentPage = 1
  const itemsPerPage = 20
  let filteredResponses = [...responsesData]
  const selectedResponses = new Set()

  // Initialize page
  function initializePage() {
    if (currentForm.id) {
      updateFormInfo()
      generateFormPreview()
    }
    renderResponses()
    setupEventListeners()
    updatePagination()
  }

  // Update form info
  function updateFormInfo() {
    $("#formNameTitle").text(currentForm.name || "فرم نامشخص")
    $("#formInfoName").text(currentForm.name || "فرم نامشخص")
    $("#formInfoDescription").text(currentForm.description || "توضیحی موجود نیست")

    const totalResponses = responsesData.filter((r) => r.formId === currentForm.id).length
    const newToday = responsesData.filter((r) => {
      const today = new Date().toDateString()
      const responseDate = new Date(r.submittedAt).toDateString()
      return r.formId === currentForm.id && responseDate === today
    }).length

    $("#totalResponses").text(totalResponses)
    $("#newResponses").text(newToday)
  }

  // Generate form preview
  function generateFormPreview() {
    if (!currentForm.fields) return

    const formPreview = $("#formPreview")
    let previewHtml = '<div class="preview-form"><h5 class="mb-4">پیش‌نمایش فرم: ' + currentForm.name + "</h5>"

    currentForm.fields.forEach((field) => {
      previewHtml += '<div class="form-group">'
      previewHtml += `<label class="form-label">${field.label}`
      if (field.required) {
        previewHtml += ' <span class="text-danger">*</span>'
      }
      previewHtml += "</label>"

      switch (field.type) {
        case "text":
        case "email":
        case "tel":
          previewHtml += `<input type="${field.type}" class="form-control" placeholder="${field.label}" disabled>`
          break
        case "textarea":
          previewHtml += `<textarea class="form-control" rows="4" placeholder="${field.label}" disabled></textarea>`
          break
        case "select":
          previewHtml += '<select class="form-select" disabled>'
          previewHtml += `<option>انتخاب ${field.label}</option>`
          if (field.options) {
            field.options.forEach((option) => {
              previewHtml += `<option>${option}</option>`
            })
          }
          previewHtml += "</select>"
          break
        case "date":
          previewHtml += `<input type="date" class="form-control" disabled>`
          break
      }
      previewHtml += "</div>"
    })

    previewHtml += '<button class="btn btn-primary" disabled>ارسال فرم</button>'
    previewHtml += "</div>"

    formPreview.html(previewHtml)
  }

  // Render responses
  function renderResponses() {
    const tbody = $("#responsesTableBody")
    tbody.empty()

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const responsesToShow = filteredResponses.slice(startIndex, endIndex)

    if (responsesToShow.length === 0) {
      tbody.html(`
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">پاسخی یافت نشد</h5>
                        <p class="text-muted">هنوز پاسخی برای این فرم ثبت نشده است</p>
                    </td>
                </tr>
            `)
      return
    }

    responsesToShow.forEach((response) => {
      const row = createResponseRow(response)
      tbody.append(row)
    })

    updatePaginationInfo()
  }

  // Create response row
  function createResponseRow(response) {
    const statusClass = getStatusClass(response.status)
    const statusText = getStatusText(response.status)
    const formattedDate = formatDateTime(response.submittedAt)
    const isSelected = selectedResponses.has(response.id)

    return $(`
            <tr data-response-id="${response.id}" class="${isSelected ? "table-active" : ""}">
                <td>
                    <div class="form-check">
                        <input class="form-check-input response-checkbox" type="checkbox" 
                               value="${response.id}" ${isSelected ? "checked" : ""}>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <strong>${response.data.name || "نامشخص"}</strong>
                </td>
                <td>
                    <a href="mailto:${response.data.email || ""}" class="text-decoration-none">
                        ${response.data.email || "نامشخص"}
                    </a>
                </td>
                <td>
                    <span class="text-truncate d-inline-block" style="max-width: 200px;" 
                          title="${response.data.subject || response.data.message || "بدون موضوع"}">
                        ${response.data.subject || response.data.message || "بدون موضوع"}
                    </span>
                </td>
                <td>
                    <small class="text-muted">${formattedDate}</small>
                </td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="action-btn" onclick="viewResponse(${response.id})" title="مشاهده جزئیات">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="replyToResponse(${response.id})" title="پاسخ">
                            <i class="fas fa-reply"></i>
                        </button>
                        <button class="action-btn" onclick="archiveResponse(${response.id})" title="بایگانی">
                            <i class="fas fa-archive"></i>
                        </button>
                        <button class="action-btn text-danger" onclick="deleteResponse(${response.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `)
  }

  // Get status class
  function getStatusClass(status) {
    const classes = {
      new: "status-new",
      read: "status-read",
      replied: "status-replied",
      archived: "status-archived",
    }
    return classes[status] || "status-new"
  }

  // Get status text
  function getStatusText(status) {
    const texts = {
      new: "جدید",
      read: "خوانده شده",
      replied: "پاسخ داده شده",
      archived: "بایگانی شده",
    }
    return texts[status] || "نامشخص"
  }

  // Format date time
  function formatDateTime(dateString) {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString("fa-IR") +
      " " +
      date.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }

  // Setup event listeners
  function setupEventListeners() {
    // Search
    $("#responseSearch").on(
      "input",
      debounce(() => {
        filterResponses()
      }, 300),
    )

    // Filters
    $("#statusFilter, #dateFilter").on("change", () => {
      filterResponses()
    })

    // Sort
    $("#sortBy").on("change", () => {
      sortResponses()
    })

    // Select all checkboxes
    $("#selectAll, #selectAllHeader").on("change", function () {
      const isChecked = $(this).is(":checked")
      $(".response-checkbox").prop("checked", isChecked)
      updateSelectedResponses()
      $("#selectAll, #selectAllHeader").prop("checked", isChecked)
    })

    // Individual checkboxes
    $(document).on("change", ".response-checkbox", () => {
      updateSelectedResponses()
    })

    // Bulk actions
    $("#bulkActionsBtn").on("click", () => {
      if (selectedResponses.size === 0) {
        showNotification("لطفاً ابتدا پاسخ‌هایی را انتخاب کنید", "warning")
        return
      }
      $("#selectedCount").text(selectedResponses.size)
      $("#bulkActionsModal").modal("show")
    })

    // Bulk operations
    $("#bulkMarkRead").on("click", () => {
      bulkUpdateStatus("read")
    })

    $("#bulkArchive").on("click", () => {
      bulkUpdateStatus("archived")
    })

    $("#bulkDelete").on("click", () => {
      if (confirm(`آیا از حذف ${selectedResponses.size} پاسخ انتخاب شده اطمینان دارید؟`)) {
        bulkDelete()
      }
    })

    // Export button
    $("#exportBtn").on("click", () => {
      exportToExcel()
    })

    // Refresh button
    $("#refreshBtn").on("click", function () {
      $(this).find("i").addClass("fa-spin")
      setTimeout(() => {
        $(this).find("i").removeClass("fa-spin")
        showNotification("داده‌ها به‌روزرسانی شد", "success")
      }, 1000)
    })
  }

  // Filter responses
  function filterResponses() {
    const searchTerm = $("#responseSearch").val().toLowerCase().trim()
    const statusFilter = $("#statusFilter").val()
    const dateFilter = $("#dateFilter").val()

    filteredResponses = responsesData.filter((response) => {
      // Search filter
      const matchesSearch =
        !searchTerm || Object.values(response.data).some((value) => String(value).toLowerCase().includes(searchTerm))

      // Status filter
      const matchesStatus = !statusFilter || response.status === statusFilter

      // Date filter
      let matchesDate = true
      if (dateFilter) {
        const responseDate = new Date(response.submittedAt)
        const today = new Date()

        switch (dateFilter) {
          case "today":
            matchesDate = responseDate.toDateString() === today.toDateString()
            break
          case "yesterday":
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            matchesDate = responseDate.toDateString() === yesterday.toDateString()
            break
          case "week":
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            matchesDate = responseDate >= weekAgo
            break
          case "month":
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            matchesDate = responseDate >= monthAgo
            break
        }
      }

      return matchesSearch && matchesStatus && matchesDate
    })

    currentPage = 1
    sortResponses()
  }

  // Sort responses
  function sortResponses() {
    const sortBy = $("#sortBy").val()

    filteredResponses.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.submittedAt) - new Date(a.submittedAt)
        case "date_asc":
          return new Date(a.submittedAt) - new Date(b.submittedAt)
        case "name_asc":
          return (a.data.name || "").localeCompare(b.data.name || "", "fa")
        case "name_desc":
          return (b.data.name || "").localeCompare(a.data.name || "", "fa")
        default:
          return 0
      }
    })

    renderResponses()
    updatePagination()
  }

  // Update selected responses
  function updateSelectedResponses() {
    selectedResponses.clear()
    $(".response-checkbox:checked").each(function () {
      selectedResponses.add(Number.parseInt($(this).val()))
    })

    // Update select all checkbox state
    const totalCheckboxes = $(".response-checkbox").length
    const checkedCheckboxes = $(".response-checkbox:checked").length

    $("#selectAll, #selectAllHeader").prop(
      "indeterminate",
      checkedCheckboxes > 0 && checkedCheckboxes < totalCheckboxes,
    )
    $("#selectAll, #selectAllHeader").prop("checked", checkedCheckboxes === totalCheckboxes && totalCheckboxes > 0)

    // Update row highlighting
    $(".response-checkbox").each(function () {
      const row = $(this).closest("tr")
      if ($(this).is(":checked")) {
        row.addClass("table-active")
      } else {
        row.removeClass("table-active")
      }
    })
  }

  // Bulk update status
  function bulkUpdateStatus(newStatus) {
    selectedResponses.forEach((responseId) => {
      const response = responsesData.find((r) => r.id === responseId)
      if (response) {
        response.status = newStatus
      }
    })

    renderResponses()
    selectedResponses.clear()
    $("#bulkActionsModal").modal("hide")
    showNotification(`وضعیت ${selectedResponses.size} پاسخ به‌روزرسانی شد`, "success")
  }

  // Bulk delete
  function bulkDelete() {
    selectedResponses.forEach((responseId) => {
      const index = responsesData.findIndex((r) => r.id === responseId)
      if (index > -1) {
        responsesData.splice(index, 1)
      }
    })

    filterResponses()
    selectedResponses.clear()
    $("#bulkActionsModal").modal("hide")
    showNotification(`${selectedResponses.size} پاسخ حذف شد`, "success")
  }

  // Export to Excel
  function exportToExcel() {
    showNotification("در حال آماده‌سازی فایل Excel...", "info")

    // Simulate export process
    setTimeout(() => {
      showNotification("فایل Excel با موفقیت دانلود شد", "success")
    }, 2000)
  }

  // Update pagination
  function updatePagination() {
    const totalPages = Math.ceil(filteredResponses.length / itemsPerPage)
    const pagination = $("#pagination")
    pagination.empty()

    if (totalPages <= 1) return

    // Previous button
    const prevDisabled = currentPage === 1 ? "disabled" : ""
    pagination.append(`
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `)

    // Page numbers
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, currentPage + 2)

    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === currentPage ? "active" : ""
      pagination.append(`
                <li class="page-item ${activeClass}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `)
    }

    // Next button
    const nextDisabled = currentPage === totalPages ? "disabled" : ""
    pagination.append(`
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `)

    // Pagination click events
    pagination.find(".page-link").on("click", function (e) {
      e.preventDefault()
      const page = Number.parseInt($(this).data("page"))
      if (page && page !== currentPage && page >= 1 && page <= totalPages) {
        currentPage = page
        renderResponses()
        updatePagination()
      }
    })
  }

  // Update pagination info
  function updatePaginationInfo() {
    const startIndex = (currentPage - 1) * itemsPerPage + 1
    const endIndex = Math.min(currentPage * itemsPerPage, filteredResponses.length)

    $("#showingStart").text(startIndex)
    $("#showingEnd").text(endIndex)
    $("#totalResponses").text(filteredResponses.length)
  }

  // Global functions for response actions
  window.viewResponse = (responseId) => {
    const response = responsesData.find((r) => r.id === responseId)
    if (!response) return

    // Mark as read
    if (response.status === "new") {
      response.status = "read"
      renderResponses()
    }

    // Build response details HTML
    let detailsHtml = `
            <div class="response-meta">
                <div>
                    <strong>تاریخ ارسال:</strong> ${formatDateTime(response.submittedAt)}
                </div>
                <div class="response-ip">
                    IP: ${response.ipAddress}
                </div>
            </div>
            <div class="response-details">
        `

    Object.entries(response.data).forEach(([key, value]) => {
      const field = currentForm.fields?.find((f) => f.name === key)
      const label = field ? field.label : key

      detailsHtml += `
                <div class="response-field">
                    <div class="field-label">${label}</div>
                    <div class="field-value">${value || "خالی"}</div>
                </div>
            `
    })

    detailsHtml += "</div>"

    $("#responseDetailsBody").html(detailsHtml)
    $("#responseDetailsModal").modal("show")

    // Set up modal buttons
    $("#deleteResponseBtn")
      .off("click")
      .on("click", () => {
        $("#responseDetailsModal").modal("hide")
        deleteResponse(responseId)
      })

    $("#archiveResponseBtn")
      .off("click")
      .on("click", () => {
        $("#responseDetailsModal").modal("hide")
        archiveResponse(responseId)
      })

    $("#replyResponseBtn")
      .off("click")
      .on("click", () => {
        $("#responseDetailsModal").modal("hide")
        replyToResponse(responseId)
      })
  }

  window.replyToResponse = (responseId) => {
    const response = responsesData.find((r) => r.id === responseId)
    if (response && response.data.email) {
      const subject = `پاسخ به: ${response.data.subject || "پیام شما"}`
      const body = `سلام ${response.data.name || "کاربر گرامی"},\n\nبا تشکر از پیام شما...\n\nبا احترام\nتیم پشتیبانی`

      window.location.href = `mailto:${response.data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      // Mark as replied
      response.status = "replied"
      renderResponses()
    }
  }

  window.archiveResponse = (responseId) => {
    const response = responsesData.find((r) => r.id === responseId)
    if (response) {
      response.status = "archived"
      renderResponses()
      showNotification("پاسخ بایگانی شد", "success")
    }
  }

  window.deleteResponse = (responseId) => {
    const response = responsesData.find((r) => r.id === responseId)
    if (response && confirm("آیا از حذف این پاسخ اطمینان دارید؟")) {
      const index = responsesData.findIndex((r) => r.id === responseId)
      if (index > -1) {
        responsesData.splice(index, 1)
        filterResponses()
        showNotification("پاسخ حذف شد", "success")
      }
    }
  }

  // Utility functions
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  function showNotification(message, type = "info", duration = 5000) {
    const notificationId = "notification-" + Date.now()
    const icons = {
      success: "check-circle",
      danger: "exclamation-triangle",
      warning: "exclamation-circle",
      info: "info-circle",
    }

    const notification = $(`
            <div id="${notificationId}" class="alert alert-${type} alert-dismissible fade show position-fixed" 
                 style="top: 90px; right: 20px; z-index: 9999; min-width: 350px; max-width: 400px;">
                <div class="d-flex align-items-center">
                    <i class="fas fa-${icons[type] || "info-circle"} me-2"></i>
                    <div class="flex-grow-1">${message}</div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            </div>
        `)

    $("body").append(notification)

    setTimeout(() => {
      $("#" + notificationId).alert("close")
    }, duration)
  }

  // Initialize page
  initializePage()

  console.log("Form Responses page initialized successfully")
})
