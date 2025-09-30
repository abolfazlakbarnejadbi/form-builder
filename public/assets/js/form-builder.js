class FormBuilder {
    constructor() {
        this.formSpec = {
            meta: {
                title: "",
                version: "1.0.0",
                createdAt: new Date().toISOString(),
            },
            layout: {
                rows: [],
            },
            components: {},
            theme: {
                primaryColor: "#FFD700",
                secondaryColor: "#6c757d",
                fontFamily: "Vazirmatn",
            },
        }

        this.selectedElement = null
        this.draggedElement = null
        this.elementCounter = 0

        this.init()
    }

    init() {
        this.setupEventListeners()
        this.setupDragAndDrop()
        this.updateFormTitle()
    }

    setupEventListeners() {
        // Form title input
        document.getElementById("formTitle").addEventListener("input", (e) => {
            this.formSpec.meta.title = e.target.value
        })

        // Preview button
        document.getElementById("previewBtn").addEventListener("click", () => {
            this.showPreview()
        })

        // Save button
        document.getElementById("saveBtn").addEventListener("click", () => {
            this.saveForm()
        })

        // Mobile panel toggles
        document.querySelectorAll('[data-bs-toggle="collapse"]').forEach((btn) => {
            btn.addEventListener("click", (e) => {
                // Remove active class from all buttons
                document.querySelectorAll('[data-bs-toggle="collapse"]').forEach((b) => {
                    b.classList.remove("active")
                })
                // Add active class to clicked button
                e.target.classList.add("active")
            })
        })
    }

    setupDragAndDrop() {
        document.querySelectorAll(".draggable-element, .draggable-layout").forEach((element) => {
            element.draggable = true

            // Mouse events
            element.addEventListener("dragstart", (e) => {
                this.draggedElement = {
                    type: e.target.dataset.type,
                    source: "palette",
                }
                e.target.classList.add("dragging")
            })

            element.addEventListener("dragend", (e) => {
                e.target.classList.remove("dragging")
                this.draggedElement = null
            })

            // Touch events for mobile
            element.addEventListener(
                "touchstart",
                (e) => {
                    this.handleTouchStart(e, element)
                },
                { passive: false },
            )

            element.addEventListener(
                "touchmove",
                (e) => {
                    this.handleTouchMove(e)
                },
                { passive: false },
            )

            element.addEventListener(
                "touchend",
                (e) => {
                    this.handleTouchEnd(e)
                },
                { passive: false },
            )
        })

        // Setup canvas drop zone
        this.setupCanvasDropZone()
    }

    handleTouchStart(e, element) {
        this.touchData = {
            element: element,
            type: element.dataset.type,
            startX: e.touches[0].clientX,
            startY: e.touches[0].clientY,
            isDragging: false,
        }

        element.classList.add("dragging")
    }

    handleTouchMove(e) {
        if (!this.touchData) return

        e.preventDefault()

        const touch = e.touches[0]
        const deltaX = Math.abs(touch.clientX - this.touchData.startX)
        const deltaY = Math.abs(touch.clientY - this.touchData.startY)

        if (!this.touchData.isDragging && (deltaX > 10 || deltaY > 10)) {
            this.touchData.isDragging = true
        }

        if (this.touchData.isDragging) {
            // Find element under touch point
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
            const dropZone = elementBelow?.closest(".form-column, .canvas-content")

            // Visual feedback
            document.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"))
            if (dropZone) {
                dropZone.classList.add("drag-over")
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.touchData) return

        this.touchData.element.classList.remove("dragging")

        if (this.touchData.isDragging) {
            const touch = e.changedTouches[0]
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
            const dropZone = elementBelow?.closest(".form-column, .canvas-content")

            if (dropZone) {
                this.draggedElement = {
                    type: this.touchData.type,
                    source: "palette",
                }

                if (dropZone.classList.contains("form-column")) {
                    this.handleColumnDrop(dropZone)
                } else if (dropZone.id === "formCanvas") {
                    this.handleCanvasDrop()
                }
            }
        }

        // Clean up
        document.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"))
        this.touchData = null
        this.draggedElement = null
    }

    setupCanvasDropZone() {
        const canvas = document.getElementById("formCanvas")

        canvas.addEventListener("dragover", (e) => {
            e.preventDefault()
            this.showDropPlaceholder(e)
        })

        canvas.addEventListener("dragleave", (e) => {
            if (!canvas.contains(e.relatedTarget)) {
                this.hideDropPlaceholder()
            }
        })

        canvas.addEventListener("drop", (e) => {
            e.preventDefault()
            this.handleDrop(e)
            this.hideDropPlaceholder()
        })
    }

    showDropPlaceholder(e) {
        // Remove existing placeholder
        this.hideDropPlaceholder()

        // Create new placeholder
        const placeholder = document.createElement("div")
        placeholder.className = "drag-placeholder active"

        // Find the best position to insert
        const canvas = document.getElementById("formCanvas")
        const rect = canvas.getBoundingClientRect()
        const y = e.clientY - rect.top

        // Find the element to insert before
        const elements = [...canvas.children].filter((el) => !el.classList.contains("drag-placeholder"))
        let insertBefore = null

        for (const element of elements) {
            const elementRect = element.getBoundingClientRect()
            const elementY = elementRect.top - rect.top

            if (y < elementY + elementRect.height / 2) {
                insertBefore = element
                break
            }
        }

        if (insertBefore) {
            canvas.insertBefore(placeholder, insertBefore)
        } else {
            canvas.appendChild(placeholder)
        }
    }

    hideDropPlaceholder() {
        document.querySelectorAll(".drag-placeholder").forEach((el) => el.remove())
    }

    handleDrop(e) {
        if (!this.draggedElement) return

        const canvas = document.getElementById("formCanvas")

        // Remove empty canvas message
        const emptyCanvas = canvas.querySelector(".empty-canvas")
        if (emptyCanvas) {
            emptyCanvas.remove()
        }

        if (this.draggedElement.type === "row") {
            this.addRow()
        } else if (this.draggedElement.type === "column") {
            this.addColumnToLastRow()
        } else {
            this.addFormElement(this.draggedElement.type)
        }
    }

    addRow() {
        const rowId = `row_${++this.elementCounter}`
        const row = document.createElement("div")
        row.className = "form-row row"
        row.dataset.id = rowId
        row.innerHTML = `
            <div class="row-controls">
                <button class="control-btn" onclick="formBuilder.deleteRow('${rowId}')" title="حذف ردیف">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="control-btn" onclick="formBuilder.addColumnToRow('${rowId}')" title="افزودن ستون">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="col-12 form-column" data-col-size="12">
                <div class="column-controls">
                    <button class="control-btn" onclick="formBuilder.deleteColumn(this)" title="حذف ستون">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="text-center text-muted py-3">
                    <i class="fas fa-mouse-pointer"></i>
                    <small>عناصر را اینجا بکشید</small>
                </div>
                <div class="resize-handle right"></div>
            </div>
        `

        // Add to canvas
        const canvas = document.getElementById("formCanvas")
        const placeholder = canvas.querySelector(".drag-placeholder")
        if (placeholder) {
            canvas.insertBefore(row, placeholder)
        } else {
            canvas.appendChild(row)
        }

        // Setup column drop zone
        this.setupColumnDropZone(row.querySelector(".form-column"))

        // Setup resize handles
        this.setupResizeHandles(row)

        // Update form spec
        this.formSpec.layout.rows.push({
            id: rowId,
            columns: [
                {
                    id: `col_${this.elementCounter}`,
                    size: 12,
                    elements: [],
                },
            ],
        })
    }

    addColumnToRow(rowId) {
        const row = document.querySelector(`[data-id="${rowId}"]`)
        if (!row) return

        const columns = row.querySelectorAll(".form-column")
        const newSize = Math.floor(12 / (columns.length + 1))

        // Resize existing columns
        columns.forEach((col) => {
            const currentSize = Number.parseInt(col.dataset.colSize)
            const newColSize = Math.floor((currentSize * columns.length) / (columns.length + 1))
            col.dataset.colSize = newColSize
            col.className = `col-${newColSize} form-column`
        })

        // Create new column
        const colId = `col_${++this.elementCounter}`
        const newColumn = document.createElement("div")
        newColumn.className = `col-${newSize} form-column`
        newColumn.dataset.colSize = newSize
        newColumn.innerHTML = `
            <div class="column-controls">
                <button class="control-btn" onclick="formBuilder.deleteColumn(this)" title="حذف ستون">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="text-center text-muted py-3">
                <i class="fas fa-mouse-pointer"></i>
                <small>عناصر را اینجا بکشید</small>
            </div>
            <div class="resize-handle right"></div>
        `

        row.appendChild(newColumn)

        // Setup column drop zone
        this.setupColumnDropZone(newColumn)

        // Setup resize handles
        this.setupResizeHandles(row)

        // Update form spec
        const rowSpec = this.formSpec.layout.rows.find((r) => r.id === rowId)
        if (rowSpec) {
            // Update existing columns
            rowSpec.columns.forEach((col, index) => {
                col.size = Number.parseInt(columns[index].dataset.colSize)
            })

            // Add new column
            rowSpec.columns.push({
                id: colId,
                size: newSize,
                elements: [],
            })
        }
    }

    addColumnToLastRow() {
        const rows = document.querySelectorAll(".form-row")
        if (rows.length === 0) {
            this.addRow()
            return
        }

        const lastRow = rows[rows.length - 1]
        this.addColumnToRow(lastRow.dataset.id)
    }

    setupColumnDropZone(column) {
        column.addEventListener("dragover", (e) => {
            e.preventDefault()
            e.stopPropagation()
            column.classList.add("drag-over")
        })

        column.addEventListener("dragleave", (e) => {
            if (!column.contains(e.relatedTarget)) {
                column.classList.remove("drag-over")
            }
        })

        column.addEventListener("drop", (e) => {
            e.preventDefault()
            e.stopPropagation()
            column.classList.remove("drag-over")

            if (this.draggedElement && this.draggedElement.source === "palette") {
                // Remove placeholder text
                const placeholder = column.querySelector(".text-center")
                if (placeholder) {
                    placeholder.remove()
                }

                this.addFormElementToColumn(this.draggedElement.type, column)
            }
        })
    }

    setupResizeHandles(row) {
        const handles = row.querySelectorAll(".resize-handle")
        handles.forEach((handle) => {
            handle.addEventListener("mousedown", (e) => {
                this.startResize(e, handle)
            })
        })
    }

    startResize(e, handle) {
        e.preventDefault()
        const column = handle.parentElement
        const row = column.parentElement
        const columns = [...row.querySelectorAll(".form-column")]
        const columnIndex = columns.indexOf(column)

        const startX = e.clientX
        const startSizes = columns.map((col) => Number.parseInt(col.dataset.colSize))

        const onMouseMove = (e) => {
            const deltaX = e.clientX - startX
            const containerWidth = row.offsetWidth
            const deltaColumns = Math.round((deltaX / containerWidth) * 12)

            if (columnIndex < columns.length - 1) {
                const newSize1 = Math.max(1, Math.min(11, startSizes[columnIndex] + deltaColumns))
                const newSize2 = Math.max(1, Math.min(11, startSizes[columnIndex + 1] - deltaColumns))

                if (newSize1 + newSize2 <= 12) {
                    columns[columnIndex].dataset.colSize = newSize1
                    columns[columnIndex].className = `col-${newSize1} form-column`

                    columns[columnIndex + 1].dataset.colSize = newSize2
                    columns[columnIndex + 1].className = `col-${newSize2} form-column`
                }
            }
        }

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)

            // Update form spec
            this.updateRowSpecSizes(row)
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
    }

    updateRowSpecSizes(row) {
        const rowId = row.dataset.id
        const rowSpec = this.formSpec.layout.rows.find((r) => r.id === rowId)
        if (rowSpec) {
            const columns = row.querySelectorAll(".form-column")
            columns.forEach((col, index) => {
                if (rowSpec.columns[index]) {
                    rowSpec.columns[index].size = Number.parseInt(col.dataset.colSize)
                }
            })
        }
    }

    addFormElement(type) {
        // Add to the first available column or create a new row
        let targetColumn = document.querySelector(".form-column")

        if (!targetColumn) {
            this.addRow()
            targetColumn = document.querySelector(".form-column")
        }

        // Remove placeholder text
        const placeholder = targetColumn.querySelector(".text-center")
        if (placeholder) {
            placeholder.remove()
        }

        this.addFormElementToColumn(type, targetColumn)
    }

    addFormElementToColumn(type, column) {
        const elementId = `element_${++this.elementCounter}`
        const element = this.createElement(type, elementId)

        column.appendChild(element)

        // Add to form spec
        const rowId = column.closest(".form-row").dataset.id
        const columnIndex = [...column.parentElement.children].indexOf(column) - 1 // -1 for row-controls

        const rowSpec = this.formSpec.layout.rows.find((r) => r.id === rowId)
        if (rowSpec && rowSpec.columns[columnIndex]) {
            rowSpec.columns[columnIndex].elements.push(elementId)
        }

        // Add component spec
        this.formSpec.components[elementId] = this.getDefaultComponentSpec(type, elementId)

        // Setup element interactions
        this.setupElementInteractions(element)
    }

    createElement(type, id) {
        const element = document.createElement("div")
        element.className = "form-element"
        element.dataset.id = id
        element.dataset.type = type

        element.innerHTML = `
            <div class="element-controls">
                <button class="control-btn" onclick="formBuilder.selectElement('${id}')" title="ویرایش">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="control-btn" onclick="formBuilder.deleteElement('${id}')" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="control-btn" onclick="formBuilder.duplicateElement('${id}')" title="کپی">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            ${this.getElementHTML(type, id)}
        `

        return element
    }

    getElementHTML(type, elementId) {
        const component = this.formSpec.components[elementId]
        if (!component) return ""

        let html = `
      <div class="element-controls">
        <button class="control-btn" onclick="formBuilder.selectElement('${elementId}')" title="انتخاب">
          <i class="fas fa-mouse-pointer"></i>
        </button>
        <button class="control-btn" onclick="formBuilder.deleteElement('${elementId}')" title="حذف">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <div class="element-content">
    `

        // Generate element-specific HTML
        switch (type) {
            case "text":
            case "email":
                html += `
          <label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>
          <input type="${type}" class="form-control" name="${component.name}" 
                 placeholder="${component.placeholder || ""}"
                 ${component.required ? "required" : ""}
                 ${component.disabled ? "disabled" : ""}
                 ${component.readonly ? "readonly" : ""}>
          ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
        `
                break

            case "textarea":
                html += `
          <label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>
          <textarea class="form-control" name="${component.name}" rows="${component.rows || 3}"
                    placeholder="${component.placeholder || ""}"
                    ${component.required ? "required" : ""}
                    ${component.disabled ? "disabled" : ""}
                    ${component.readonly ? "readonly" : ""}></textarea>
          ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
        `
                break

            // Add other cases...
            default:
                html += `<p>نوع عنصر: ${type}</p>`
        }

        html += `</div>`
        return html
    }

    getDefaultComponentSpec(type, id) {
        const defaultSpecs = this.getDefaultComponentSpec(type, id)

        switch (type) {
            case "text":
                return `
                    <label class="form-label">${defaultSpecs.label}</label>
                    <input type="text" class="form-control" name="${defaultSpecs.name}" placeholder="${defaultSpecs.placeholder}">
                `

            case "email":
                return `
                    <label class="form-label">${defaultSpecs.label}</label>
                    <input type="email" class="form-control" name="${defaultSpecs.name}" placeholder="${defaultSpecs.placeholder}">
                `

            case "textarea":
                return `
                    <label class="form-label">${defaultSpecs.label}</label>
                    <textarea class="form-control" name="${defaultSpecs.name}" placeholder="${defaultSpecs.placeholder}" rows="3"></textarea>
                `

            case "number":
                return `
                    <label class="form-label">${defaultSpecs.label}</label>
                    <input type="number" class="form-control" name="${defaultSpecs.name}" placeholder="${defaultSpecs.placeholder}">
                `

            case "date":
                return `
                    <label class="form-label">${defaultSpecs.label}</label>
                    <input type="date" class="form-control" name="${defaultSpecs.name}">
                `

            case "select":
                return `
                    <label class="form-label">${defaultSpecs.label}</label>
                    <select class="form-select" name="${defaultSpecs.name}">
                        <option value="">انتخاب کنید...</option>
                        <option value="option1">گزینه ۱</option>
                        <option value="option2">گزینه ۲</option>
                    </select>
                `

            case "radio":
                return `
                    <label class="form-label">${defaultSpecs.label}</label>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${defaultSpecs.name}" value="option1" id="${id}_1">
                        <label class="form-check-label" for="${id}_1">گزینه ۱</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${defaultSpecs.name}" value="option2" id="${id}_2">
                        <label class="form-check-label" for="${id}_2">گزینه ۲</label>
                    </div>
                `

            case "checkbox":
                return `
                    <label class="form-label">${defaultSpecs.label}</label>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="${defaultSpecs.name}[]" value="option1" id="${id}_1">
                        <label class="form-check-label" for="${id}_1">گزینه ۱</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="${defaultSpecs.name}[]" value="option2" id="${id}_2">
                        <label class="form-check-label" for="${id}_2">گزینه ۲</label>
                    </div>
                `

            case "file":
                return `
                    <label class="form-label">${defaultSpecs.label}</label>
                    <input type="file" class="form-control" name="${defaultSpecs.name}">
                `

            case "switch":
                return `
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="${defaultSpecs.name}" id="${id}">
                        <label class="form-check-label" for="${id}">${defaultSpecs.label}</label>
                    </div>
                `

            case "hidden":
                return `
                    <input type="hidden" name="${defaultSpecs.name}" value="${defaultSpecs.value}">
                    <small class="text-muted">فیلد مخفی: ${defaultSpecs.name}</small>
                `

            case "heading":
                return `<h3>${defaultSpecs.text}</h3>`

            case "paragraph":
                return `<p>${defaultSpecs.text}</p>`

            case "divider":
                return `<hr class="form-divider">`

            case "button":
                return `<button type="${defaultSpecs.buttonType}" class="btn btn-form-element">${defaultSpecs.text}</button>`

            default:
                return `<div class="alert alert-warning">نوع عنصر نامشخص: ${type}</div>`
        }
    }

    getDefaultComponentSpec(type, id) {
        const baseSpec = {
            id: id,
            type: type,
            name: `field_${id}`,
            label: "",
            required: false,
            disabled: false,
            readonly: false,
            helpText: "",
            validation: {},
            layout: {
                labelPosition: "top",
                colWidth: 12,
            },
            styles: {},
        }

        switch (type) {
            case "text":
                return {
                    ...baseSpec,
                    label: "فیلد متنی",
                    placeholder: "متن خود را وارد کنید",
                    validation: {
                        minLength: null,
                        maxLength: null,
                        pattern: null,
                    },
                }

            case "email":
                return {
                    ...baseSpec,
                    label: "ایمیل",
                    placeholder: "example@domain.com",
                    validation: {
                        email: true,
                    },
                }

            case "textarea":
                return {
                    ...baseSpec,
                    label: "متن چندخطی",
                    placeholder: "متن خود را وارد کنید",
                    rows: 3,
                    validation: {
                        minLength: null,
                        maxLength: null,
                    },
                }

            case "number":
                return {
                    ...baseSpec,
                    label: "عدد",
                    placeholder: "0",
                    validation: {
                        min: null,
                        max: null,
                        step: 1,
                    },
                }

            case "date":
                return {
                    ...baseSpec,
                    label: "تاریخ",
                    validation: {
                        min: null,
                        max: null,
                    },
                }

            case "select":
                return {
                    ...baseSpec,
                    label: "لیست کشویی",
                    options: [
                        { value: "option1", label: "گزینه ۱" },
                        { value: "option2", label: "گزینه ۲" },
                    ],
                    multiple: false,
                }

            case "radio":
                return {
                    ...baseSpec,
                    label: "انتخاب یکی",
                    options: [
                        { value: "option1", label: "گزینه ۱" },
                        { value: "option2", label: "گزینه ۲" },
                    ],
                }

            case "checkbox":
                return {
                    ...baseSpec,
                    label: "چندانتخابی",
                    options: [
                        { value: "option1", label: "گزینه ۱" },
                        { value: "option2", label: "گزینه ۲" },
                    ],
                }

            case "file":
                return {
                    ...baseSpec,
                    label: "آپلود فایل",
                    multiple: false,
                    validation: {
                        accept: null,
                        maxSize: null,
                    },
                }

            case "switch":
                return {
                    ...baseSpec,
                    label: "کلید",
                    defaultValue: false,
                }

            case "hidden":
                return {
                    ...baseSpec,
                    value: "",
                }

            case "heading":
                return {
                    ...baseSpec,
                    text: "عنوان",
                    level: 3,
                }

            case "paragraph":
                return {
                    ...baseSpec,
                    text: "این یک پاراگراف نمونه است.",
                }

            case "divider":
                return {
                    ...baseSpec,
                }

            case "button":
                return {
                    ...baseSpec,
                    text: "دکمه",
                    buttonType: "button",
                }

            default:
                return baseSpec
        }
    }

    setupElementInteractions(element) {
        element.addEventListener("click", (e) => {
            e.stopPropagation()
            this.selectElement(element.dataset.id)
        })
    }

    selectElement(elementId) {
        // Remove previous selection
        document.querySelectorAll(".form-element.selected").forEach((el) => {
            el.classList.remove("selected")
        })

        // Select new element
        const element = document.querySelector(`[data-id="${elementId}"]`)
        if (element) {
            element.classList.add("selected")
            this.selectedElement = elementId
            this.showInspector(elementId)
        }
    }

    showInspector(elementId) {
        const component = this.formSpec.components[elementId]
        if (!component) return

        const inspectorContent = document.getElementById("inspectorContent")
        inspectorContent.innerHTML = this.getInspectorHTML(component)

        // Setup inspector event listeners
        this.setupInspectorListeners(elementId)
    }

    getInspectorHTML(component) {
        const commonFields = `
            <div class="mb-3">
                <label class="form-label">برچسب:</label>
                <input type="text" class="form-control" id="inspector-label" value="${component.label || ""}">
            </div>
            <div class="mb-3">
                <label class="form-label">نام فیلد:</label>
                <input type="text" class="form-control" id="inspector-name" value="${component.name || ""}">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="inspector-required" ${component.required ? "checked" : ""}>
                    <label class="form-check-label" for="inspector-required">اجباری</label>
                </div>
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="inspector-disabled" ${component.disabled ? "checked" : ""}>
                    <label class="form-check-label" for="inspector-disabled">غیرفعال</label>
                </div>
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="inspector-readonly" ${component.readonly ? "checked" : ""}>
                    <label class="form-check-label" for="inspector-readonly">فقط خواندنی</label>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">متن راهنما:</label>
                <textarea class="form-control" id="inspector-help" rows="2">${component.helpText || ""}</textarea>
            </div>
        `

        let specificFields = ""

        switch (component.type) {
            case "text":
            case "email":
                specificFields = `
                    <div class="mb-3">
                        <label class="form-label">متن پیش‌فرض:</label>
                        <input type="text" class="form-control" id="inspector-placeholder" value="${component.placeholder || ""}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">حداقل طول:</label>
                        <input type="number" class="form-control" id="inspector-min-length" value="${component.validation?.minLength || ""}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">حداکثر طول:</label>
                        <input type="number" class="form-control" id="inspector-max-length" value="${component.validation?.maxLength || ""}">
                    </div>
                `
                break

            case "textarea":
                specificFields = `
                    <div class="mb-3">
                        <label class="form-label">متن پیش‌فرض:</label>
                        <input type="text" class="form-control" id="inspector-placeholder" value="${component.placeholder || ""}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">تعداد خطوط:</label>
                        <input type="number" class="form-control" id="inspector-rows" value="${component.rows || 3}" min="1">
                    </div>
                `
                break

            case "number":
                specificFields = `
                    <div class="mb-3">
                        <label class="form-label">حداقل مقدار:</label>
                        <input type="number" class="form-control" id="inspector-min" value="${component.validation?.min || ""}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">حداکثر مقدار:</label>
                        <input type="number" class="form-control" id="inspector-max" value="${component.validation?.max || ""}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">گام:</label>
                        <input type="number" class="form-control" id="inspector-step" value="${component.validation?.step || 1}">
                    </div>
                `
                break

            case "select":
            case "radio":
            case "checkbox":
                const optionsHTML =
                    component.options
                        ?.map(
                            (option, index) => `
                    <div class="input-group mb-2">
                        <input type="text" class="form-control" placeholder="مقدار" value="${option.value}" data-option-index="${index}" data-option-field="value">
                        <input type="text" class="form-control" placeholder="برچسب" value="${option.label}" data-option-index="${index}" data-option-field="label">
                        <button class="btn btn-outline-danger" type="button" onclick="formBuilder.removeOption(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `,
                        )
                        .join("") || ""

                specificFields = `
                    <div class="mb-3">
                        <label class="form-label">گزینه‌ها:</label>
                        <div id="options-container">
                            ${optionsHTML}
                        </div>
                        <button class="btn btn-outline-primary btn-sm mt-2" onclick="formBuilder.addOption()">
                            <i class="fas fa-plus me-1"></i>
                            افزودن گزینه
                        </button>
                    </div>
                `

                if (component.type === "select") {
                    specificFields += `
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="inspector-multiple" ${component.multiple ? "checked" : ""}>
                                <label class="form-check-label" for="inspector-multiple">انتخاب چندگانه</label>
                            </div>
                        </div>
                    `
                }
                break

            case "file":
                specificFields = `
                    <div class="mb-3">
                        <label class="form-label">نوع فایل‌های مجاز:</label>
                        <input type="text" class="form-control" id="inspector-accept" value="${component.validation?.accept || ""}" placeholder=".jpg,.png,.pdf">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">حداکثر حجم (MB):</label>
                        <input type="number" class="form-control" id="inspector-max-size" value="${component.validation?.maxSize || ""}" min="1">
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="inspector-multiple" ${component.multiple ? "checked" : ""}>
                            <label class="form-check-label" for="inspector-multiple">چندین فایل</label>
                        </div>
                    </div>
                `
                break

            case "heading":
                specificFields = `
                    <div class="mb-3">
                        <label class="form-label">متن عنوان:</label>
                        <input type="text" class="form-control" id="inspector-text" value="${component.text || ""}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">سطح عنوان:</label>
                        <select class="form-select" id="inspector-level">
                            <option value="1" ${component.level === 1 ? "selected" : ""}>H1</option>
                            <option value="2" ${component.level === 2 ? "selected" : ""}>H2</option>
                            <option value="3" ${component.level === 3 ? "selected" : ""}>H3</option>
                            <option value="4" ${component.level === 4 ? "selected" : ""}>H4</option>
                            <option value="5" ${component.level === 5 ? "selected" : ""}>H5</option>
                            <option value="6" ${component.level === 6 ? "selected" : ""}>H6</option>
                        </select>
                    </div>
                `
                break

            case "paragraph":
                specificFields = `
                    <div class="mb-3">
                        <label class="form-label">متن پاراگراف:</label>
                        <textarea class="form-control" id="inspector-text" rows="3">${component.text || ""}</textarea>
                    </div>
                `
                break

            case "button":
                specificFields = `
                    <div class="mb-3">
                        <label class="form-label">متن دکمه:</label>
                        <input type="text" class="form-control" id="inspector-text" value="${component.text || ""}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">نوع دکمه:</label>
                        <select class="form-select" id="inspector-button-type">
                            <option value="button" ${component.buttonType === "button" ? "selected" : ""}>معمولی</option>
                            <option value="submit" ${component.buttonType === "submit" ? "selected" : ""}>ارسال</option>
                            <option value="reset" ${component.buttonType === "reset" ? "selected" : ""}>بازنشانی</option>
                        </select>
                    </div>
                `
                break

            case "hidden":
                specificFields = `
                    <div class="mb-3">
                        <label class="form-label">مقدار:</label>
                        <input type="text" class="form-control" id="inspector-value" value="${component.value || ""}">
                    </div>
                `
                break
        }

        return `
            <h6 class="mb-3">ویرایش ${this.getElementTypeLabel(component.type)}</h6>
            ${component.type !== "divider" ? commonFields : ""}
            ${specificFields}
            <div class="d-grid gap-2 mt-4">
                <button class="btn btn-primary" onclick="formBuilder.updateElement()">
                    <i class="fas fa-save me-1"></i>
                    اعمال تغییرات
                </button>
                <button class="btn btn-outline-danger" onclick="formBuilder.deleteElement('${component.id}')">
                    <i class="fas fa-trash me-1"></i>
                    حذف عنصر
                </button>
            </div>
        `
    }

    getElementTypeLabel(type) {
        const labels = {
            text: "فیلد متنی",
            email: "ایمیل",
            textarea: "متن چندخطی",
            number: "عدد",
            date: "تاریخ",
            select: "لیست کشویی",
            radio: "انتخاب یکی",
            checkbox: "چندانتخابی",
            file: "آپلود فایل",
            switch: "کلید",
            hidden: "فیلد مخفی",
            heading: "عنوان",
            paragraph: "پاراگراف",
            divider: "جداکننده",
            button: "دکمه",
        }
        return labels[type] || type
    }

    setupInspectorListeners(elementId) {
        // Add event listeners for all inspector inputs
        const inspector = document.getElementById("inspectorContent")
        const inputs = inspector.querySelectorAll("input, textarea, select")

        inputs.forEach((input) => {
            input.addEventListener("input", () => {
                // Auto-save changes
                this.updateElementFromInspector(elementId)
            })
        })

        // Setup option inputs
        const optionInputs = inspector.querySelectorAll("[data-option-index]")
        optionInputs.forEach((input) => {
            input.addEventListener("input", (e) => {
                this.updateOption(Number.parseInt(e.target.dataset.optionIndex), e.target.dataset.optionField, e.target.value)
            })
        })
    }

    updateElementFromInspector(elementId) {
        const component = this.formSpec.components[elementId]
        if (!component) return

        // Update common properties
        const label = document.getElementById("inspector-label")
        if (label) component.label = label.value

        const name = document.getElementById("inspector-name")
        if (name) component.name = name.value

        const required = document.getElementById("inspector-required")
        if (required) component.required = required.checked

        const disabled = document.getElementById("inspector-disabled")
        if (disabled) component.disabled = disabled.checked

        const readonly = document.getElementById("inspector-readonly")
        if (readonly) component.readonly = readonly.checked

        const helpText = document.getElementById("inspector-help")
        if (helpText) component.helpText = helpText.value

        // Update type-specific properties
        this.updateTypeSpecificProperties(component)

        // Re-render the element
        this.rerenderElement(elementId)
    }

    updateTypeSpecificProperties(component) {
        switch (component.type) {
            case "text":
            case "email":
            case "textarea":
                const placeholder = document.getElementById("inspector-placeholder")
                if (placeholder) component.placeholder = placeholder.value

                const minLength = document.getElementById("inspector-min-length")
                if (minLength) component.validation.minLength = minLength.value ? Number.parseInt(minLength.value) : null

                const maxLength = document.getElementById("inspector-max-length")
                if (maxLength) component.validation.maxLength = maxLength.value ? Number.parseInt(maxLength.value) : null

                if (component.type === "textarea") {
                    const rows = document.getElementById("inspector-rows")
                    if (rows) component.rows = Number.parseInt(rows.value)
                }
                break

            case "number":
                const min = document.getElementById("inspector-min")
                if (min) component.validation.min = min.value ? Number.parseFloat(min.value) : null

                const max = document.getElementById("inspector-max")
                if (max) component.validation.max = max.value ? Number.parseFloat(max.value) : null

                const step = document.getElementById("inspector-step")
                if (step) component.validation.step = Number.parseFloat(step.value)
                break

            case "select":
                const multiple = document.getElementById("inspector-multiple")
                if (multiple) component.multiple = multiple.checked
                break

            case "file":
                const accept = document.getElementById("inspector-accept")
                if (accept) component.validation.accept = accept.value

                const maxSize = document.getElementById("inspector-max-size")
                if (maxSize) component.validation.maxSize = maxSize.value ? Number.parseInt(maxSize.value) : null

                const fileMultiple = document.getElementById("inspector-multiple")
                if (fileMultiple) component.multiple = fileMultiple.checked
                break

            case "heading":
                const headingText = document.getElementById("inspector-text")
                if (headingText) component.text = headingText.value

                const level = document.getElementById("inspector-level")
                if (level) component.level = Number.parseInt(level.value)
                break

            case "paragraph":
                const paragraphText = document.getElementById("inspector-text")
                if (paragraphText) component.text = paragraphText.value
                break

            case "button":
                const buttonText = document.getElementById("inspector-text")
                if (buttonText) component.text = buttonText.value

                const buttonType = document.getElementById("inspector-button-type")
                if (buttonType) component.buttonType = buttonType.value
                break

            case "hidden":
                const value = document.getElementById("inspector-value")
                if (value) component.value = value.value
                break
        }
    }

    updateElement() {
        if (!this.selectedElement) return

        const component = this.formSpec.components[this.selectedElement]
        if (!component) return

        // Update component properties from inspector
        this.updateElementFromInspector(this.selectedElement)

        this.showInlineMessage("تغییرات با موفقیت اعمال شد", "success")
    }

    showInlineMessage(message, type = "info") {
        const inspector = document.getElementById("inspectorContent")
        const existingMessage = inspector.querySelector(".inline-message")

        if (existingMessage) {
            existingMessage.remove()
        }

        const messageDiv = document.createElement("div")
        messageDiv.className = `inline-message alert alert-${type === "success" ? "success" : type === "error" ? "danger" : "info"} alert-dismissible fade show`
        messageDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="alert"></button>
    `

        inspector.insertBefore(messageDiv, inspector.firstChild)

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove()
            }
        }, 3000)
    }

    rerenderElement(elementId) {
        const element = document.querySelector(`[data-id="${elementId}"]`)
        if (!element) return

        const component = this.formSpec.components[elementId]
        if (!component) return

        // Find the content container (everything except controls)
        const contentContainer = element.querySelector(".element-content")
        if (contentContainer) {
            contentContainer.innerHTML = this.getElementHTML(component.type, elementId)
                .replace(/<div class="element-controls">.*?<\/div>/s, "")
                .replace(/<div class="element-content">(.*)<\/div>/s, "$1")
        } else {
            // Fallback: replace entire element content except controls
            const controls = element.querySelector(".element-controls")
            const controlsHTML = controls ? controls.outerHTML : ""
            element.innerHTML =
                controlsHTML +
                this.getElementHTML(component.type, elementId).replace(/<div class="element-controls">.*?<\/div>/s, "")
        }
    }

    addOption() {
        if (!this.selectedElement) return

        const component = this.formSpec.components[this.selectedElement]
        if (!component.options) component.options = []

        component.options.push({
            value: `option${component.options.length + 1}`,
            label: `گزینه ${component.options.length + 1}`,
        })

        this.showInspector(this.selectedElement)
        this.rerenderElement(this.selectedElement)
    }

    removeOption(index) {
        if (!this.selectedElement) return

        const component = this.formSpec.components[this.selectedElement]
        if (component.options && component.options.length > index) {
            component.options.splice(index, 1)
            this.showInspector(this.selectedElement)
            this.rerenderElement(this.selectedElement)
        }
    }

    updateOption(index, field, value) {
        if (!this.selectedElement) return

        const component = this.formSpec.components[this.selectedElement]
        if (component.options && component.options[index]) {
            component.options[index][field] = value
            this.rerenderElement(this.selectedElement)
        }
    }

    deleteElement(elementId) {
        if (confirm("آیا از حذف این عنصر اطمینان دارید؟")) {
            const element = document.querySelector(`[data-id="${elementId}"]`)
            if (element) {
                element.remove()

                // Remove from form spec
                delete this.formSpec.components[elementId]

                // Remove from layout
                this.removeElementFromLayout(elementId)

                // Clear inspector if this element was selected
                if (this.selectedElement === elementId) {
                    this.selectedElement = null
                    this.clearInspector()
                }

                this.showToast("عنصر حذف شد", "success")
            }
        }
    }

    duplicateElement(elementId) {
        const component = this.formSpec.components[elementId]
        if (!component) return

        const element = document.querySelector(`[data-id="${elementId}"]`)
        const column = element.closest(".form-column")

        // Create duplicate with new ID
        const newElementId = `element_${++this.elementCounter}`
        const newComponent = JSON.parse(JSON.stringify(component))
        newComponent.id = newElementId
        newComponent.name = `field_${newElementId}`

        // Add to form spec
        this.formSpec.components[newElementId] = newComponent

        // Create and insert element
        const newElement = this.createElement(component.type, newElementId)
        element.parentNode.insertBefore(newElement, element.nextSibling)

        // Setup interactions
        this.setupElementInteractions(newElement)

        // Update layout spec
        const rowId = column.closest(".form-row").dataset.id
        const columnIndex = [...column.parentElement.children].indexOf(column) - 1

        const rowSpec = this.formSpec.layout.rows.find((r) => r.id === rowId)
        if (rowSpec && rowSpec.columns[columnIndex]) {
            const elementIndex = rowSpec.columns[columnIndex].elements.indexOf(elementId)
            rowSpec.columns[columnIndex].elements.splice(elementIndex + 1, 0, newElementId)
        }

        this.showToast("عنصر کپی شد", "success")
    }

    deleteRow(rowId) {
        if (confirm("آیا از حذف این ردیف و تمام عناصر آن اطمینان دارید؟")) {
            const row = document.querySelector(`[data-id="${rowId}"]`)
            if (row) {
                // Delete all elements in this row
                const elements = row.querySelectorAll(".form-element")
                elements.forEach((element) => {
                    const elementId = element.dataset.id
                    delete this.formSpec.components[elementId]
                })

                // Remove row from DOM
                row.remove()

                // Remove from form spec
                this.formSpec.layout.rows = this.formSpec.layout.rows.filter((r) => r.id !== rowId)

                // Clear inspector if selected element was in this row
                if (this.selectedElement && !document.querySelector(`[data-id="${this.selectedElement}"]`)) {
                    this.selectedElement = null
                    this.clearInspector()
                }

                // Show empty canvas message if no rows left
                const canvas = document.getElementById("formCanvas")
                if (canvas.children.length === 0) {
                    canvas.innerHTML = `
                        <div class="empty-canvas text-center text-muted py-5">
                            <i class="fas fa-mouse-pointer fa-3x mb-3"></i>
                            <h4>فرم خود را بسازید</h4>
                            <p>عناصر را از پنل سمت راست به اینجا بکشید</p>
                        </div>
                    `
                }

                this.showToast("ردیف حذف شد", "success")
            }
        }
    }

    deleteColumn(button) {
        const column = button.closest(".form-column")
        const row = column.closest(".form-row")
        const columns = row.querySelectorAll(".form-column")

        if (columns.length === 1) {
            this.deleteRow(row.dataset.id)
            return
        }

        if (confirm("آیا از حذف این ستون و تمام عناصر آن اطمینان دارید؟")) {
            // Delete all elements in this column
            const elements = column.querySelectorAll(".form-element")
            elements.forEach((element) => {
                const elementId = element.dataset.id
                delete this.formSpec.components[elementId]
            })

            // Remove column from DOM
            column.remove()

            // Redistribute remaining columns
            const remainingColumns = row.querySelectorAll(".form-column")
            const newSize = Math.floor(12 / remainingColumns.length)

            remainingColumns.forEach((col) => {
                col.dataset.colSize = newSize
                col.className = `col-${newSize} form-column`
            })

            // Update form spec
            const rowId = row.dataset.id
            const rowSpec = this.formSpec.layout.rows.find((r) => r.id === rowId)
            if (rowSpec) {
                const columnIndex = [...row.children].indexOf(column) - 1 // -1 for row-controls
                rowSpec.columns.splice(columnIndex, 1)

                // Update remaining column sizes
                rowSpec.columns.forEach((col, index) => {
                    col.size = newSize
                })
            }

            this.showToast("ستون حذف شد", "success")
        }
    }

    removeElementFromLayout(elementId) {
        this.formSpec.layout.rows.forEach((row) => {
            row.columns.forEach((column) => {
                const index = column.elements.indexOf(elementId)
                if (index > -1) {
                    column.elements.splice(index, 1)
                }
            })
        })
    }

    clearInspector() {
        const inspectorContent = document.getElementById("inspectorContent")
        inspectorContent.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-mouse-pointer fa-2x mb-3"></i>
                <p>یک عنصر را انتخاب کنید</p>
            </div>
        `
    }

    updateFormTitle() {
        const titleInput = document.getElementById("formTitle")
        titleInput.value = this.formSpec.meta.title
    }

    showPreview() {
        const previewContent = document.getElementById("previewContent")
        previewContent.innerHTML = this.generatePreviewHTML()

        if (window.bootstrap && window.bootstrap.Modal) {
            const modal = new window.bootstrap.Modal(document.getElementById("previewModal"))
            modal.show()
        }
    }

    generatePreviewHTML() {
        if (!this.formSpec.meta.title && this.formSpec.layout.rows.length === 0) {
            return `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h4>فرم خالی است</h4>
                    <p>ابتدا عناصری به فرم اضافه کنید</p>
                </div>
            `
        }

        let html = `
            <form class="form-preview" dir="rtl">
                ${this.formSpec.meta.title ? `<h2 class="mb-4">${this.formSpec.meta.title}</h2>` : ""}
        `

        this.formSpec.layout.rows.forEach((row) => {
            html += `<div class="row mb-3">`

            row.columns.forEach((column) => {
                html += `<div class="col-${column.size}">`

                column.elements.forEach((elementId) => {
                    const component = this.formSpec.components[elementId]
                    if (component) {
                        html += this.generateElementPreviewHTML(component)
                    }
                })

                html += `</div>`
            })

            html += `</div>`
        })

        html += `
                <div class="row mt-4">
                    <div class="col-12">
                        <button type="submit" class="btn btn-warning text-dark">
                            <i class="fas fa-paper-plane me-2"></i>
                            ارسال فرم
                        </button>
                    </div>
                </div>
            </form>
        `

        return html
    }

    generateElementPreviewHTML(component) {
        let html = ""

        switch (component.type) {
            case "text":
                html = `
                    <div class="mb-3">
                        ${component.label ? `<label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>` : ""}
                        <input type="text" class="form-control" name="${component.name}" placeholder="${component.placeholder || ""}" ${component.required ? "required" : ""} ${component.disabled ? "disabled" : ""} ${component.readonly ? "readonly" : ""}>
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                    </div>
                `
                break

            case "email":
                html = `
                    <div class="mb-3">
                        ${component.label ? `<label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>` : ""}
                        <input type="email" class="form-control" name="${component.name}" placeholder="${component.placeholder || ""}" ${component.required ? "required" : ""} ${component.disabled ? "disabled" : ""} ${component.readonly ? "readonly" : ""}>
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                    </div>
                `
                break

            case "textarea":
                html = `
                    <div class="mb-3">
                        ${component.label ? `<label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>` : ""}
                        <textarea class="form-control" name="${component.name}" placeholder="${component.placeholder || ""}" rows="${component.rows || 3}" ${component.required ? "required" : ""} ${component.disabled ? "disabled" : ""} ${component.readonly ? "readonly" : ""}></textarea>
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                    </div>
                `
                break

            case "number":
                html = `
                    <div class="mb-3">
                        ${component.label ? `<label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>` : ""}
                        <input type="number" class="form-control" name="${component.name}" ${component.validation?.min !== null ? `min="${component.validation.min}"` : ""} ${component.validation?.max !== null ? `max="${component.validation.max}"` : ""} step="${component.validation?.step || 1}" ${component.required ? "required" : ""} ${component.disabled ? "disabled" : ""} ${component.readonly ? "readonly" : ""}>
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                    </div>
                `
                break

            case "date":
                html = `
                    <div class="mb-3">
                        ${component.label ? `<label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>` : ""}
                        <input type="date" class="form-control" name="${component.name}" ${component.required ? "required" : ""} ${component.disabled ? "disabled" : ""} ${component.readonly ? "readonly" : ""}>
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                    </div>
                `
                break

            case "select":
                const selectOptions =
                    component.options?.map((option) => `<option value="${option.value}">${option.label}</option>`).join("") || ""

                html = `
                    <div class="mb-3">
                        ${component.label ? `<label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>` : ""}
                        <select class="form-select" name="${component.name}" ${component.multiple ? "multiple" : ""} ${component.required ? "required" : ""} ${component.disabled ? "disabled" : ""}>
                            <option value="">انتخاب کنید...</option>
                            ${selectOptions}
                        </select>
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                    </div>
                `
                break

            case "radio":
                const radioOptions =
                    component.options
                        ?.map(
                            (option, index) =>
                                `<div class="form-check">
                        <input class="form-check-input" type="radio" name="${component.name}" value="${option.value}" id="${component.id}_${index}" ${component.disabled ? "disabled" : ""}>
                        <label class="form-check-label" for="${component.id}_${index}">${option.label}</label>
                    </div>`,
                        )
                        .join("") || ""

                html = `
                    <div class="mb-3">
                        ${component.label ? `<label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>` : ""}
                        ${radioOptions}
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                    </div>
                `
                break

            case "checkbox":
                const checkboxOptions =
                    component.options
                        ?.map(
                            (option, index) =>
                                `<div class="form-check">
                        <input class="form-check-input" type="checkbox" name="${component.name}[]" value="${option.value}" id="${component.id}_${index}" ${component.disabled ? "disabled" : ""}>
                        <label class="form-check-label" for="${component.id}_${index}">${option.label}</label>
                    </div>`,
                        )
                        .join("") || ""

                html = `
                    <div class="mb-3">
                        ${component.label ? `<label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>` : ""}
                        ${checkboxOptions}
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                    </div>
                `
                break

            case "file":
                html = `
                    <div class="mb-3">
                        ${component.label ? `<label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>` : ""}
                        <input type="file" class="form-control" name="${component.name}" ${component.validation?.accept ? `accept="${component.validation.accept}"` : ""} ${component.multiple ? "multiple" : ""} ${component.required ? "required" : ""} ${component.disabled ? "disabled" : ""}>
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                    </div>
                `
                break

            case "switch":
                html = `
                    <div class="mb-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" name="${component.name}" id="${component.id}" ${component.defaultValue ? "checked" : ""} ${component.disabled ? "disabled" : ""}>
                            <label class="form-check-label" for="${component.id}">${component.label}</label>
                        </div>
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                    </div>
                `
                break

            case "hidden":
                html = `<input type="hidden" name="${component.name}" value="${component.value || ""}">`
                break

            case "heading":
                html = `<h${component.level || 3} class="mb-3">${component.text || ""}</h${component.level || 3}>`
                break

            case "paragraph":
                html = `<p class="mb-3">${component.text || ""}</p>`
                break

            case "divider":
                html = `<hr class="form-divider my-4">`
                break

            case "button":
                html = `
                    <div class="mb-3">
                        <button type="${component.buttonType || "button"}" class="btn btn-form-element" ${component.disabled ? "disabled" : ""}>
                            ${component.text || "دکمه"}
                        </button>
                    </div>
                `
                break
        }

        return html
    }
    extractInputsMetadata() {
        const metadata = []

        for (const row of this.formSpec.layout.rows) {
            for (const column of row.columns) {
                for (const elementId of column.elements) {
                    const element = this.formSpec.components[elementId]

                    if (!element) continue

                    // Skip non-input elements
                    if (["heading", "paragraph", "divider", "button"].includes(element.type)) {
                        continue
                    }

                    const fieldMetadata = {
                        title: element.label || element.text || "",
                        name: element.name,
                        type: element.type,
                        validation: [],
                    }

                    // Extract validation rules
                    if (element.required) {
                        fieldMetadata.validation.push("required")
                    }

                    if (element.validation?.minLength) {
                        fieldMetadata.validation.push(`minlength:${element.validation.minLength}`)
                    }

                    if (element.validation?.maxLength) {
                        fieldMetadata.validation.push(`maxlength:${element.validation.maxLength}`)
                    }

                    if (element.validation?.min !== undefined && element.validation?.min !== "") {
                        fieldMetadata.validation.push(`min:${element.validation.min}`)
                    }

                    if (element.validation?.max !== undefined && element.validation?.max !== "") {
                        fieldMetadata.validation.push(`max:${element.validation.max}`)
                    }

                    if (element.validation?.pattern) {
                        fieldMetadata.validation.push(`pattern:${element.validation.pattern}`)
                    }

                    if (element.validation?.accept) {
                        fieldMetadata.validation.push(`accept:${element.validation.accept}`)
                    }

                    // Add additional properties for specific field types
                    if (element.type === "select" || element.type === "radio" || element.type === "checkbox") {
                        fieldMetadata.options = element.options || []
                    }

                    if (element.placeholder) {
                        fieldMetadata.placeholder = element.placeholder
                    }

                    if (element.rows) {
                        fieldMetadata.rows = element.rows
                    }

                    metadata.push(fieldMetadata)
                }
            }
        }

        return metadata
    }

    saveForm() {
        try {
            const payloadString = this.serializeFormSpec()
            const inputsMetadata = this.extractInputsMetadata()

            // Show loading state
            const saveBtn = document.getElementById("saveBtn")
            const originalText = saveBtn.innerHTML
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> در حال ذخیره...'
            saveBtn.disabled = true

            fetch(url_client, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: this.formSpec.meta.title,
                    html: this.generateRuntimeHTML(),
                    inputs: inputsMetadata,
                    payload: payloadString,
                }),
            })

                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`خطا در ساخت فرم: ${response.message}`)
                    }
                    return response.json()
                })
                .then((data) => {
                    console.log(data.status == false);
                    if (data.status == false) {
                        this.showToast(data.message, "error")

                    }
                    if (data.status == true) {
                        {
                            this.showToast(data.message, "success")
                            window.location.href = data.redirect_url
                        }
                    }
                })

                .finally(() => {
                    // Restore button state
                    saveBtn.innerHTML = originalText
                    saveBtn.disabled = false
                })
        } catch (error) {
            console.error("Error serializing form:", error)
            this.showToast("خطا در آماده‌سازی فرم: " + error.message, "error")
        }
    }

    serializeFormSpec() {
        const html = this.generateRuntimeHTML()
        const css = this.getRuntimeCSS()
        const js = this.getRuntimeJS()

        const payload = {
            schema: this.formSpec,
            html: html,
            css: css,
            js: js,
        }

        return JSON.stringify(payload)
    }

    generateRuntimeHTML() {
        let html = `
            &lt;!DOCTYPE html>
            <html lang="fa" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${this.formSpec.meta.title}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    * { font-family: 'Vazirmatn', 'Tahoma', sans-serif; }
                    body { background-color: #f8f9fa; padding: 2rem 0; }
                    .form-container { max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .btn-form-element { background-color: #FFD700; border-color: #FFD700; color: #343a40; font-weight: 500; }
                    .btn-form-element:hover { background-color: #e6c200; border-color: #e6c200; color: #343a40; }
                    .form-divider { border: none; height: 2px; background: linear-gradient(to left, transparent, #6c757d, transparent); margin: 1.5rem 0; }
                    .form-switch .form-check-input:checked { background-color: #FFD700; border-color: #FFD700; }
                    .form-control:focus, .form-select:focus { border-color: #FFD700; box-shadow: 0 0 0 0.2rem rgba(255, 215, 0, 0.25); }
                    .is-invalid { border-color: #dc3545; }
                    .invalid-feedback { display: block; font-size: 0.875rem; color: #dc3545; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="form-container">
                        <form id="dynamicForm" novalidate>
                            ${this.formSpec.meta.title ? `<h2 class="mb-4 text-center">${this.formSpec.meta.title}</h2>` : ""}
        `

        this.formSpec.layout.rows.forEach((row) => {
            html += `<div class="row mb-3">`

            row.columns.forEach((column) => {
                html += `<div class="col-${column.size}">`

                column.elements.forEach((elementId) => {
                    const component = this.formSpec.components[elementId]
                    if (component) {
                        html += this.generateElementRuntimeHTML(component)
                    }
                })

                html += `</div>`
            })

            html += `</div>`
        })

        html += `
                            <div class="row mt-4">
                                <div class="col-12 text-center">
                                    <button type="submit" class="btn btn-form-element btn-lg px-5">
                                        <i class="fas fa-paper-plane me-2"></i>
                                        ارسال فرم
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    // Form validation and submission logic will be inserted here
                </script>
            </body>
            </html>
        `

        return html
    }

    generateElementRuntimeHTML(component) {
        // Similar to generateElementPreviewHTML but with validation attributes
        let html = ""

        switch (component.type) {
            case "text":
                html = `
                    <div class="mb-3">
                        ${component.label ? `<label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>` : ""}
                        <input type="text" class="form-control" name="${component.name}" placeholder="${component.placeholder || ""}" 
                               ${component.required ? "required" : ""} 
                               ${component.disabled ? "disabled" : ""} 
                               ${component.readonly ? "readonly" : ""}
                               ${component.validation?.minLength ? `minlength="${component.validation.minLength}"` : ""}
                               ${component.validation?.maxLength ? `maxlength="${component.validation.maxLength}"` : ""}
                               ${component.validation?.pattern ? `pattern="${component.validation.pattern}"` : ""}>
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                        <div class="invalid-feedback"></div>
                    </div>
                `
                break

            case "email":
                html = `
                    <div class="mb-3">
                        ${component.label ? `<label class="form-label">${component.label}${component.required ? ' <span class="text-danger">*</span>' : ""}</label>` : ""}
                        <input type="email" class="form-control" name="${component.name}" placeholder="${component.placeholder || ""}" 
                               ${component.required ? "required" : ""} 
                               ${component.disabled ? "disabled" : ""} 
                               ${component.readonly ? "readonly" : ""}>
                        ${component.helpText ? `<div class="form-text">${component.helpText}</div>` : ""}
                        <div class="invalid-feedback"></div>
                    </div>
                `
                break

            // Add other cases similar to generateElementPreviewHTML but with validation
            default:
                return this.generateElementPreviewHTML(component)
        }

        return html
    }

    getRuntimeCSS() {
        return `
            /* Runtime CSS for form validation and interactions */
            .form-element-error {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
            }
            
            .loading {
                opacity: 0.6;
                pointer-events: none;
            }
            
            .success-message {
                background-color: #d4edda;
                border-color: #c3e6cb;
                color: #155724;
                padding: 1rem;
                border-radius: 0.375rem;
                margin-bottom: 1rem;
            }
            
            .error-message {
                background-color: #f8d7da;
                border-color: #f5c6cb;
                color: #721c24;
                padding: 1rem;
                border-radius: 0.375rem;
                margin-bottom: 1rem;
            }
        `
    }

    getRuntimeJS() {
        return `
            // Runtime JavaScript for form validation and submission
            document.addEventListener('DOMContentLoaded', function() {
                const form = document.getElementById('dynamicForm');
                
                if (form) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        if (validateForm()) {
                            submitForm();
                        }
                    });
                }
                
                function validateForm() {
                    let isValid = true;
                    const formData = new FormData(form);
                    
                    // Clear previous errors
                    form.querySelectorAll('.is-invalid').forEach(el => {
                        el.classList.remove('is-invalid');
                    });
                    
                    form.querySelectorAll('.invalid-feedback').forEach(el => {
                        el.textContent = '';
                    });
                    
                    // Validate required fields
                    form.querySelectorAll('[required]').forEach(field => {
                        if (!field.value.trim()) {
                            showFieldError(field, 'این فیلد اجباری است');
                            isValid = false;
                        }
                    });
                    
                    // Validate email fields
                    form.querySelectorAll('input[type="email"]').forEach(field => {
                        if (field.value && !isValidEmail(field.value)) {
                            showFieldError(field, 'فرمت ایمیل صحیح نیست');
                            isValid = false;
                        }
                    });
                    
                    // Validate number fields
                    form.querySelectorAll('input[type="number"]').forEach(field => {
                        if (field.value) {
                            const value = parseFloat(field.value);
                            const min = field.getAttribute('min');
                            const max = field.getAttribute('max');
                            
                            if (min && value < parseFloat(min)) {
                                showFieldError(field, 'مقدار نباید کمتر از ' + min + ' باشد');
                                isValid = false;
                            }
                            
                            if (max && value > parseFloat(max)) {
                                showFieldError(field, 'مقدار نباید بیشتر از ' + max + ' باشد');
                                isValid = false;
                            }
                        }
                    });
                    
                    return isValid;
                }
                
                function showFieldError(field, message) {
                    field.classList.add('is-invalid');
                    const feedback = field.parentNode.querySelector('.invalid-feedback');
                    if (feedback) {
                        feedback.textContent = message;
                    }
                }
                
                function isValidEmail(email) {
                    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                    return emailRegex.test(email);
                }
                
                function submitForm() {
                    const formData = new FormData(form);
                    const data = {};
                    
                    for (let [key, value] of formData.entries()) {
                        if (data[key]) {
                            if (Array.isArray(data[key])) {
                                data[key].push(value);
                            } else {
                                data[key] = [data[key], value];
                            }
                        } else {
                            data[key] = value;
                        }
                    }
                    
                    // Show loading state
                    form.classList.add('loading');
                    
                    // Simulate form submission (replace with actual endpoint)
                    setTimeout(() => {
                        form.classList.remove('loading');
                        showMessage('فرم با موفقیت ارسال شد!', 'success');
                        form.reset();
                    }, 2000);
                }
                
                function showMessage(message, type) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
                    messageDiv.textContent = message;
                    
                    form.parentNode.insertBefore(messageDiv, form);
                    
                    setTimeout(() => {
                        messageDiv.remove();
                    }, 5000);
                }
            });
        `
    }

    showToast(message, type = "info") {
        // Create toast element
        const toast = document.createElement("div")
        toast.className = `toast align-items-center text-white bg-${type === "success" ? "success" : type === "error" ? "danger" : "primary"} border-0`
        toast.setAttribute("role", "alert")
        toast.style.position = "fixed"
        toast.style.top = "20px"
        toast.style.right = "20px"
        toast.style.zIndex = "9999"

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-triangle" : "info-circle"} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `

        document.body.appendChild(toast)

        if (window.bootstrap && window.bootstrap.Toast) {
            const bsToast = new window.bootstrap.Toast(toast)
            bsToast.show()
        }

        // Remove from DOM after hiding
        toast.addEventListener("hidden.bs.toast", () => {
            toast.remove()
        })
    }

    generateFormHTML() {
        let html = `
      <form id="dynamicForm" novalidate>
        ${this.formSpec.meta.title ? `<h2 class="mb-4 text-center">${this.formSpec.meta.title}</h2>` : ""}
    `

        this.formSpec.layout.rows.forEach((row) => {
            html += `<div class="row mb-3">`

            row.columns.forEach((column) => {
                const colClass =
                    column.size === 12
                        ? "col-12"
                        : column.size === 6
                            ? "col-md-6"
                            : column.size === 4
                                ? "col-md-4"
                                : column.size === 3
                                    ? "col-md-3"
                                    : `col-md-${column.size}`

                html += `<div class="${colClass}">`

                column.elements.forEach((elementId) => {
                    const component = this.formSpec.components[elementId]
                    if (component) {
                        html += this.generateElementRuntimeHTML(component)
                    }
                })

                html += `</div>`
            })

            html += `</div>`
        })

        html += `
        <div class="row">
          <div class="col-12 text-center">
            <button type="submit" class="btn btn-form-element btn-lg px-4">
              <i class="fas fa-paper-plane me-2"></i>
              ارسال فرم
            </button>
          </div>
        </div>
      </form>
    `

        return html
    }
}

// Initialize Form Builder
const formBuilder = new FormBuilder()

// Global functions for button clicks
window.formBuilder = formBuilder
