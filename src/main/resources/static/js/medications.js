const patientId = Number(
    sessionStorage.getItem("patientId")
);

const caregiverId = Number(
    sessionStorage.getItem("caregiverId")
);

let medications = [];
let schedules = [];
let todaySchedules = [];
let todayLogs = [];

let editingMedicationId = null;
let selectedMedicationId = null;

let editingScheduleId = null;
let selectedScheduleId = null;
let editingLogId = null;


// =============================
// Elements
// =============================

const medicationsList =
    document.getElementById("medicationsList");

const emptyMedications =
    document.getElementById("emptyMedications");

const todayScheduleList =
    document.getElementById("todayScheduleList");

const emptyTodaySchedule =
    document.getElementById("emptyTodaySchedule");

const todayLogsList =
    document.getElementById("todayLogsList");

const emptyLogs =
    document.getElementById("emptyLogs");

const warningsSection =
    document.getElementById("warningsSection");

const warningsList =
    document.getElementById("warningsList");

const pageMessage =
    document.getElementById("pageMessage");


// Medication Modal

const medicationModal =
    document.getElementById("medicationModal");

const medicationForm =
    document.getElementById("medicationForm");

const medicationModalTitle =
    document.getElementById("medicationModalTitle");

const medicationName =
    document.getElementById("medicationName");

const dosageValue =
    document.getElementById("dosageValue");

const dosageUnit =
    document.getElementById("dosageUnit");

const stockQuantity =
    document.getElementById("stockQuantity");

const lowStockLimit =
    document.getElementById("lowStockLimit");

const startDate =
    document.getElementById("startDate");

const endDate =
    document.getElementById("endDate");

const medicationFormMessage =
    document.getElementById("medicationFormMessage");

const saveMedicationBtn =
    document.getElementById("saveMedicationBtn");
// Stock Modal

const stockModal =
    document.getElementById("stockModal");

const stockForm =
    document.getElementById("stockForm");

const stockMedicationName =
    document.getElementById("stockMedicationName");

const stockAmount =
    document.getElementById("stockAmount");

const stockMessage =
    document.getElementById("stockMessage");

const saveStockBtn =
    document.getElementById("saveStockBtn");


// Reactivate Modal

const reactivateModal =
    document.getElementById("reactivateModal");

const reactivateMedicationName =
    document.getElementById("reactivateMedicationName");

const updateMedicationDates =
    document.getElementById("updateMedicationDates");

const reactivateDates =
    document.getElementById("reactivateDates");

const reactivateStartDate =
    document.getElementById("reactivateStartDate");

const reactivateEndDate =
    document.getElementById("reactivateEndDate");

const reactivateMessage =
    document.getElementById("reactivateMessage");

const saveReactivateBtn =
    document.getElementById("saveReactivateBtn");


let stockMedicationId = null;
let reactivateMedicationId = null;

// Schedule Modal

const scheduleModal =
    document.getElementById("scheduleModal");

const scheduleForm =
    document.getElementById("scheduleForm");

const scheduleModalTitle =
    document.getElementById("scheduleModalTitle");

const scheduleMedicationName =
    document.getElementById("scheduleMedicationName");

const scheduleType =
    document.getElementById("scheduleType");

const dayOfWeekGroup =
    document.getElementById("dayOfWeekGroup");

const dayOfWeek =
    document.getElementById("dayOfWeek");

const scheduledTime =
    document.getElementById("scheduledTime");

const scheduleFormMessage =
    document.getElementById("scheduleFormMessage");

const saveScheduleBtn =
    document.getElementById("saveScheduleBtn");


// Dose Modal

const doseModal =
    document.getElementById("doseModal");

const doseMedicationName =
    document.getElementById("doseMedicationName");

const doseScheduledTime =
    document.getElementById("doseScheduledTime");

const doseMessage =
    document.getElementById("doseMessage");


// =============================
// Start
// =============================

if (!caregiverId) {

    window.location.replace("/login");

} else if (!patientId) {

    window.location.replace("/dashboard");

} else {

    initializePage();
}


async function initializePage() {

    clearPageMessage();

    await loadMedications();
    await loadSchedules();

    await Promise.all([
        loadTodaySchedule(),
        loadTodayLogs(),
        loadTodaySummary(),
        loadWarnings()
    ]);
}


// =============================
// Backend Response
// =============================

async function readResponse(response) {

    const text = await response.text();

    if (!text) {
        return {
            data: null,
            message: ""
        };
    }

    try {

        const data = JSON.parse(text);

        return {
            data: data,
            message: data?.message || text
        };

    } catch (error) {

        return {
            data: null,
            message: text
        };
    }
}


// =============================
// Medications
// =============================

async function loadMedications() {

    try {

        const response = await fetch(
            `/api/v1/medication/get-patient-medications/${patientId}`
        );

        const result = await readResponse(response);

        if (!response.ok) {

            showPageMessage(
                result.message || "تعذر تحميل الأدوية",
                "error"
            );

            return;
        }


        medications =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderMedications();

    } catch (error) {

        console.error(error);

        showPageMessage(
            "تعذر تحميل الأدوية",
            "error"
        );
    }
}

function renderMedications() {

    medicationsList.innerHTML = "";

    if (medications.length === 0) {
        emptyMedications.classList.remove("hidden");
        return;
    }

    emptyMedications.classList.add("hidden");


    // الأدوية النشطة أولاً
    const sortedMedications = [...medications].sort((a, b) => {

        if (a.status === "active" && b.status !== "active") {
            return -1;
        }

        if (a.status !== "active" && b.status === "active") {
            return 1;
        }

        return String(a.name).localeCompare(
            String(b.name),
            "ar"
        );
    });


    // رأس الجدول
    const tableHeader = document.createElement("div");

    tableHeader.className = "medications-table-header";

    tableHeader.innerHTML = `
        <span>الدواء</span>
        <span>الجرعة</span>
        <span>المخزون</span>
        <span>حد التنبيه</span>
        <span>المواعيد</span>
        <span>الحالة</span>
        <span>الإجراءات</span>
    `;

    medicationsList.appendChild(tableHeader);


    sortedMedications.forEach(medication => {

        const medicationSchedules = schedules
            .filter(schedule =>
                Number(schedule.medicationId) ===
                Number(medication.id)
            )
            .sort((a, b) =>
                String(a.scheduledTime)
                    .localeCompare(
                        String(b.scheduledTime)
                    )
            );


        const row =
            document.createElement("div");

        row.className =
            "medication-table-row";


        // حالة المخزون
        let stockClass = "";

        if (Number(medication.stockQuantity) <= 0) {

            stockClass = "stock-danger";

        } else if (
            Number(medication.stockQuantity) <=
            Number(medication.lowStockLimit)
        ) {

            stockClass = "stock-warning";
        }


        // المواعيد
        const schedulesHtml =
            medicationSchedules.length > 0

                ? medicationSchedules
                    .map(schedule => `

                        <div class="medication-schedule-item">

                            <div class="medication-schedule-text">

                                <strong>
                                    ${formatTime(
                        schedule.scheduledTime
                    )}
                                </strong>

                                <small>
                                    ${translateSchedule(
                        schedule
                    )}
                                </small>

                            </div>


                            <div class="schedule-actions">

                                <button
                                    type="button"
                                    class="small-btn icon-only edit-schedule-btn"
                                    data-id="${schedule.id}"
                                    title="تعديل الموعد">

                                    <span class="material-symbols-rounded">
                                        edit
                                    </span>

                                </button>


                                <button
                                    type="button"
                                    class="small-btn icon-only danger delete-schedule-btn"
                                    data-id="${schedule.id}"
                                    title="حذف الموعد">

                                    <span class="material-symbols-rounded">
                                        delete
                                    </span>

                                </button>

                            </div>

                        </div>

                    `)
                    .join("")

                : `
                    <span class="no-medication-schedule">
                        لا يوجد موعد
                    </span>
                `;


        row.innerHTML = `

            <!-- اسم الدواء -->
            <div class="medication-table-name">

                <div class="medication-icon">

                    <span class="material-symbols-rounded">
                        medication
                    </span>

                </div>

                <strong>
                    ${escapeHtml(medication.name)}
                </strong>

            </div>


            <!-- الجرعة -->
            <div class="medication-table-dose">

                ${medication.dosageValue}

                ${translateUnit(
            medication.dosageUnit
        )}

            </div>


            <!-- المخزون -->
            <div class="medication-table-stock ${stockClass}">

                <strong>
                    ${medication.stockQuantity}
                </strong>

            </div>


            <!-- حد التنبيه -->
            <div class="medication-table-limit">

                ${medication.lowStockLimit}

            </div>


            <!-- المواعيد -->
            <div class="medication-table-schedules">

                ${schedulesHtml}

                ${
            medication.status === "active"
                ? `
                            <button
                                type="button"
                                class="add-schedule-inline add-schedule-btn"
                                data-id="${medication.id}"
                                title="إضافة موعد">

                                <span class="material-symbols-rounded">
                                    add_alarm
                                </span>

                                إضافة موعد

                            </button>
                        `
                : ""
        }

            </div>


            <!-- الحالة -->
            <div class="medication-table-status">

                <span class="
                    status-badge
                    ${getMedicationStatusClass(
            medication.status
        )}
                ">

                    ${translateMedicationStatus(
            medication.status
        )}

                </span>

            </div>


            <!-- الإجراءات -->
            <div class="medication-table-actions">

            ${
            medication.status === "active"
                ? `

            <button
                type="button"
                class="small-btn icon-only edit-medication-btn"
                data-id="${medication.id}"
                title="تعديل الدواء">

                <span class="material-symbols-rounded">
                    edit
                </span>

            </button>


            <button
                type="button"
                class="small-btn icon-only add-stock-btn"
                data-id="${medication.id}"
                title="إضافة مخزون">

                <span class="material-symbols-rounded">
                    inventory_2
                </span>

            </button>


            <button
                type="button"
                class="small-btn icon-only discontinue-btn"
                data-id="${medication.id}"
                title="إيقاف الدواء">

                <span class="material-symbols-rounded">
                    block
                </span>

            </button>

        `
                : `

            <button
                type="button"
                class="small-btn reactivate-btn"
                data-id="${medication.id}"
                title="إعادة تنشيط الدواء">

                <span class="material-symbols-rounded">
                    restart_alt
                </span>

                إعادة تنشيط

            </button>

        `
        }


                <button
                    type="button"
                    class="small-btn icon-only danger delete-medication-btn"
                    data-id="${medication.id}"
                    title="حذف الدواء">

                    <span class="material-symbols-rounded">
                        delete
                    </span>

                </button>

            </div>

        `;


        medicationsList.appendChild(row);
    });


    bindMedicationButtons();
}

// =============================
// Add Medication
// =============================

document.getElementById(
    "addMedicationBtn"
).addEventListener(
    "click",
    function () {

        editingMedicationId = null;

        medicationForm.reset();

        medicationModalTitle.textContent =
            "إضافة دواء";

        clearModalMessage(
            medicationFormMessage
        );

        medicationModal.classList.remove(
            "hidden"
        );

        medicationName.focus();
    }
);


// =============================
// Edit Medication
// =============================

function openEditMedication(id) {

    const medication =
        medications.find(
            item => Number(item.id) === id
        );


    if (!medication) {
        return;
    }


    editingMedicationId = id;


    medicationModalTitle.textContent =
        "تعديل الدواء";


    medicationName.value =
        medication.name;

    dosageValue.value =
        medication.dosageValue;

    dosageUnit.value =
        medication.dosageUnit;

    stockQuantity.value =
        medication.stockQuantity;

    lowStockLimit.value =
        medication.lowStockLimit;

    startDate.value =
        medication.startDate;

    endDate.value =
        medication.endDate || "";


    clearModalMessage(
        medicationFormMessage
    );


    medicationModal.classList.remove(
        "hidden"
    );
}


// =============================
// Save Medication
// =============================

medicationForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (
            endDate.value &&
            endDate.value < startDate.value
        ) {

            showModalMessage(
                medicationFormMessage,
                "تاريخ النهاية لا يمكن أن يكون قبل تاريخ البداية",
                "error"
            );

            return;
        }


        const existingMedication =
            editingMedicationId
                ? medications.find(
                    item =>
                        Number(item.id) ===
                        editingMedicationId
                )
                : null;


        const medication = {

            patientId: patientId,

            name:
                medicationName.value.trim(),

            dosageValue:
                Number(dosageValue.value),

            dosageUnit:
            dosageUnit.value,

            stockQuantity:
                Number(stockQuantity.value),

            lowStockLimit:
                Number(lowStockLimit.value),

            startDate:
            startDate.value,

            endDate:
                endDate.value || null,

            status:
                existingMedication
                    ? existingMedication.status
                    : "active"
        };


        let url =
            "/api/v1/medication/add-medication";

        let method =
            "POST";


        if (editingMedicationId) {

            url =
                `/api/v1/medication/update-medication/${editingMedicationId}`;

            method =
                "PUT";
        }


        saveMedicationBtn.disabled = true;


        try {

            const response = await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(medication)
                }
            );


            const result =
                await readResponse(response);


            if (!response.ok) {

                showModalMessage(
                    medicationFormMessage,
                    result.message ||
                    "تعذر حفظ الدواء",
                    "error"
                );

                return;
            }


            closeMedicationModal();


            showPageMessage(
                editingMedicationId
                    ? "تم تحديث الدواء بنجاح"
                    : "تمت إضافة الدواء بنجاح",
                "success"
            );


            editingMedicationId = null;


            await refreshMedicationPage();


        } catch (error) {

            console.error(error);

            showModalMessage(
                medicationFormMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            saveMedicationBtn.disabled = false;
        }
    }
);


// =============================
// Delete Medication
// =============================

async function deleteMedication(id) {

    const medication =
        medications.find(
            item => Number(item.id) === id
        );


    if (!medication) {
        return;
    }


    if (!confirm(
        `هل تريدين حذف دواء ${medication.name}؟`
    )) {
        return;
    }


    try {

        const response = await fetch(
            `/api/v1/medication/delete-medication/${id}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر حذف الدواء",
                "error"
            );

            return;
        }


        showPageMessage(
            "تم حذف الدواء بنجاح",
            "success"
        );


        await refreshMedicationPage();


    } catch (error) {

        console.error(error);

        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// =============================
// Discontinue
// =============================

async function discontinueMedication(id) {

    const medication =
        medications.find(
            item => Number(item.id) === id
        );


    if (!medication) {
        return;
    }


    if (!confirm(
        `هل تريدين إيقاف دواء ${medication.name}؟`
    )) {
        return;
    }


    try {

        const response = await fetch(
            `/api/v1/medication/discontinue-medication/${id}`,
            {
                method: "PUT"
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر إيقاف الدواء",
                "error"
            );

            return;
        }


        showPageMessage(
            "تم إيقاف الدواء بنجاح",
            "success"
        );


        await refreshMedicationPage();


    } catch (error) {

        console.error(error);

        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}

// =============================
// Add Medication Stock
// =============================

function openStockModal(id) {

    const medication =
        medications.find(
            item => Number(item.id) === Number(id)
        );

    if (!medication) {
        return;
    }

    stockMedicationId = id;

    stockMedicationName.textContent =
        medication.name;

    stockAmount.value = "";

    clearModalMessage(stockMessage);

    stockModal.classList.remove("hidden");

    stockAmount.focus();
}


stockForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const quantity =
            Number(stockAmount.value);

        if (quantity <= 0) {

            showModalMessage(
                stockMessage,
                "الكمية يجب أن تكون أكبر من صفر",
                "error"
            );

            return;
        }

        saveStockBtn.disabled = true;

        try {

            const response = await fetch(
                `/api/v1/medication/add-medication-stock/${stockMedicationId}?quantity=${quantity}`,
                {
                    method: "PUT"
                }
            );

            const result =
                await readResponse(response);

            if (!response.ok) {

                showModalMessage(
                    stockMessage,
                    result.message ||
                    "تعذر إضافة المخزون",
                    "error"
                );

                return;
            }

            closeStockModal();

            showPageMessage(
                "تمت إضافة الكمية إلى المخزون بنجاح",
                "success"
            );

            await refreshMedicationPage();

        } catch (error) {

            console.error(error);

            showModalMessage(
                stockMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            saveStockBtn.disabled = false;
        }
    }
);


// =============================
// Reactivate Medication
// =============================

function openReactivateModal(id) {

    const medication =
        medications.find(
            item => Number(item.id) === Number(id)
        );

    if (!medication) {
        return;
    }

    reactivateMedicationId = id;

    reactivateMedicationName.textContent =
        medication.name;

    updateMedicationDates.checked = false;

    reactivateDates.classList.add("hidden");

    reactivateStartDate.value = "";
    reactivateEndDate.value = "";

    reactivateStartDate.required = false;

    clearModalMessage(reactivateMessage);

    reactivateModal.classList.remove("hidden");
}


updateMedicationDates.addEventListener(
    "change",
    function () {

        if (updateMedicationDates.checked) {

            reactivateDates.classList.remove("hidden");

            reactivateStartDate.required = true;

            reactivateStartDate.focus();

        } else {

            reactivateDates.classList.add("hidden");

            reactivateStartDate.required = false;

            reactivateStartDate.value = "";
            reactivateEndDate.value = "";
        }
    }
);


saveReactivateBtn.addEventListener(
    "click",
    async function () {

        let url =
            `/api/v1/medication/reactivate-medication/${reactivateMedicationId}`;

        if (updateMedicationDates.checked) {

            if (!reactivateStartDate.value) {

                showModalMessage(
                    reactivateMessage,
                    "أدخلي تاريخ البداية الجديد",
                    "error"
                );

                return;
            }

            if (
                reactivateEndDate.value &&
                reactivateEndDate.value <
                reactivateStartDate.value
            ) {

                showModalMessage(
                    reactivateMessage,
                    "تاريخ النهاية لا يمكن أن يكون قبل تاريخ البداية",
                    "error"
                );

                return;
            }

            const params =
                new URLSearchParams();

            params.append(
                "startDate",
                reactivateStartDate.value
            );

            if (reactivateEndDate.value) {

                params.append(
                    "endDate",
                    reactivateEndDate.value
                );
            }

            url += `?${params.toString()}`;
        }

        saveReactivateBtn.disabled = true;

        try {

            const response = await fetch(
                url,
                {
                    method: "PUT"
                }
            );

            const result =
                await readResponse(response);

            if (!response.ok) {

                showModalMessage(
                    reactivateMessage,
                    result.message ||
                    "تعذر إعادة تنشيط الدواء",
                    "error"
                );

                return;
            }

            closeReactivateModal();

            showPageMessage(
                "تمت إعادة تنشيط الدواء بنجاح",
                "success"
            );

            await refreshMedicationPage();

        } catch (error) {

            console.error(error);

            showModalMessage(
                reactivateMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            saveReactivateBtn.disabled = false;
        }
    }
);
// =============================
// Medication Buttons
// =============================

function bindMedicationButtons() {

    document
        .querySelectorAll(".edit-medication-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openEditMedication(
                        Number(button.dataset.id)
                    )
            );
        });


    document
        .querySelectorAll(".delete-medication-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    deleteMedication(
                        Number(button.dataset.id)
                    )
            );
        });


    document
        .querySelectorAll(".discontinue-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    discontinueMedication(
                        Number(button.dataset.id)
                    )
            );
        });
    document
        .querySelectorAll(".add-stock-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openStockModal(
                        Number(button.dataset.id)
                    )
            );
        });


    document
        .querySelectorAll(".reactivate-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openReactivateModal(
                        Number(button.dataset.id)
                    )
            );
        });


    document
        .querySelectorAll(".add-schedule-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openAddSchedule(
                        Number(button.dataset.id)
                    )
            );
        });


    document
        .querySelectorAll(".edit-schedule-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openEditSchedule(
                        Number(button.dataset.id)
                    )
            );
        });


    document
        .querySelectorAll(".delete-schedule-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    deleteSchedule(
                        Number(button.dataset.id)
                    )
            );
        });
}


// =============================
// Load All Schedules
// =============================

async function loadSchedules() {

    try {

        const response = await fetch(
            "/api/v1/medication-schedule/get-medication-schedules"
        );


        const result =
            await readResponse(response);


        schedules =
            response.ok &&
            Array.isArray(result.data)
                ? result.data.filter(schedule =>
                    medications.some(
                        medication =>
                            Number(medication.id) ===
                            Number(schedule.medicationId)
                    )
                )
                : [];


        renderMedications();


    } catch (error) {

        console.error(error);

        schedules = [];
    }
}


// =============================
// Add Schedule
// =============================

function openAddSchedule(medicationId) {

    const medication =
        medications.find(
            item =>
                Number(item.id) ===
                medicationId
        );


    if (!medication) {
        return;
    }


    editingScheduleId = null;

    selectedMedicationId =
        medicationId;


    scheduleForm.reset();


    scheduleModalTitle.textContent =
        "إضافة موعد جرعة";


    scheduleMedicationName.textContent =
        medication.name;


    dayOfWeekGroup.classList.add(
        "hidden"
    );


    dayOfWeek.required = false;


    clearModalMessage(
        scheduleFormMessage
    );


    scheduleModal.classList.remove(
        "hidden"
    );
}


// =============================
// Schedule Type
// =============================

scheduleType.addEventListener(
    "change",
    function () {

        if (scheduleType.value === "weekly") {

            dayOfWeekGroup.classList.remove(
                "hidden"
            );

            dayOfWeek.required = true;

        } else {

            dayOfWeekGroup.classList.add(
                "hidden"
            );

            dayOfWeek.required = false;

            dayOfWeek.value = "";
        }
    }
);


// =============================
// Edit Schedule
// =============================

function openEditSchedule(id) {

    const schedule =
        schedules.find(
            item => Number(item.id) === id
        );


    if (!schedule) {
        return;
    }


    const medication =
        medications.find(
            item =>
                Number(item.id) ===
                Number(schedule.medicationId)
        );


    editingScheduleId = id;

    selectedMedicationId =
        schedule.medicationId;


    scheduleModalTitle.textContent =
        "تعديل موعد الجرعة";


    scheduleMedicationName.textContent =
        medication?.name || "الدواء";


    scheduleType.value =
        schedule.scheduleType;


    scheduledTime.value =
        schedule.scheduledTime;


    if (schedule.scheduleType === "weekly") {

        dayOfWeekGroup.classList.remove(
            "hidden"
        );

        dayOfWeek.required = true;

        dayOfWeek.value =
            schedule.dayOfWeek;

    } else {

        dayOfWeekGroup.classList.add(
            "hidden"
        );

        dayOfWeek.required = false;

        dayOfWeek.value = "";
    }


    clearModalMessage(
        scheduleFormMessage
    );


    scheduleModal.classList.remove(
        "hidden"
    );
}


// =============================
// Save Schedule
// =============================

scheduleForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const schedule = {

            medicationId:
                Number(selectedMedicationId),

            scheduleType:
            scheduleType.value,

            dayOfWeek:
                scheduleType.value === "weekly"
                    ? dayOfWeek.value
                    : null,

            scheduledTime:
            scheduledTime.value
        };


        let url =
            "/api/v1/medication-schedule/add-medication-schedule";

        let method =
            "POST";


        if (editingScheduleId) {

            url =
                `/api/v1/medication-schedule/update-medication-schedule/${editingScheduleId}`;

            method =
                "PUT";
        }


        saveScheduleBtn.disabled = true;


        try {

            const response = await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(schedule)
                }
            );


            const result =
                await readResponse(response);


            if (!response.ok) {

                showModalMessage(
                    scheduleFormMessage,
                    result.message ||
                    "تعذر حفظ موعد الجرعة",
                    "error"
                );

                return;
            }


            closeScheduleModal();


            showPageMessage(
                editingScheduleId
                    ? "تم تحديث موعد الجرعة"
                    : "تمت إضافة موعد الجرعة",
                "success"
            );


            editingScheduleId = null;


            await refreshMedicationPage();


        } catch (error) {

            console.error(error);

            showModalMessage(
                scheduleFormMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            saveScheduleBtn.disabled = false;
        }
    }
);


// =============================
// Delete Schedule
// =============================

async function deleteSchedule(id) {

    if (!confirm(
        "هل تريدين حذف موعد الجرعة؟"
    )) {
        return;
    }


    try {

        const response = await fetch(
            `/api/v1/medication-schedule/delete-medication-schedule/${id}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر حذف موعد الجرعة",
                "error"
            );

            return;
        }


        showPageMessage(
            "تم حذف موعد الجرعة",
            "success"
        );


        await refreshMedicationPage();


    } catch (error) {

        console.error(error);
    }
}


// =============================
// Today Schedule
// =============================

async function loadTodaySchedule() {

    try {

        const response = await fetch(
            `/api/v1/medication-schedule/get-today-medication-schedule/${patientId}`
        );


        const result =
            await readResponse(response);


        todaySchedules =
            response.ok &&
            Array.isArray(result.data)
                ? result.data
                : [];


        renderTodaySchedule();


    } catch (error) {

        console.error(error);

        todaySchedules = [];

        renderTodaySchedule();
    }
}


function renderTodaySchedule() {

    todayScheduleList.innerHTML = "";


    if (todaySchedules.length === 0) {

        emptyTodaySchedule.classList.remove(
            "hidden"
        );

        return;
    }


    emptyTodaySchedule.classList.add(
        "hidden"
    );


    todaySchedules
        .sort((a, b) =>
            a.scheduledTime.localeCompare(
                b.scheduledTime
            )
        )
        .forEach(schedule => {

            const medication =
                medications.find(
                    item =>
                        Number(item.id) ===
                        Number(schedule.medicationId)
                );


            const existingLog =
                todayLogs.find(
                    log =>
                        Number(log.scheduleId) ===
                        Number(schedule.id)
                );


            const item =
                document.createElement("div");


            item.className =
                "today-dose";


            item.innerHTML = `

                <div class="dose-time">
                    ${formatTime(schedule.scheduledTime)}
                </div>

                <div class="dose-details">

                    <strong>
                        ${escapeHtml(
                medication?.name || "دواء"
            )}
                    </strong>

                    <span>
                        ${
                medication
                    ? `${medication.dosageValue} ${translateUnit(medication.dosageUnit)}`
                    : ""
            }
                    </span>

                </div>

                ${
                existingLog
                    ? `
                            <span class="status-badge
                                ${getLogStatusClass(existingLog.status)}">

                                ${translateLogStatus(existingLog.status)}

                            </span>
                          `
                    : `
                            <button type="button"
                                    class="primary-btn record-dose-btn"
                                    data-id="${schedule.id}">
                                تسجيل الجرعة
                            </button>
                          `
            }
            `;


            todayScheduleList.appendChild(
                item
            );
        });


    document
        .querySelectorAll(".record-dose-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openDoseModal(
                        Number(button.dataset.id)
                    )
            );
        });
}


// =============================
// Dose Modal
// =============================

function openDoseModal(scheduleId) {

    const schedule =
        todaySchedules.find(
            item =>
                Number(item.id) ===
                scheduleId
        );


    if (!schedule) {
        return;
    }


    const medication =
        medications.find(
            item =>
                Number(item.id) ===
                Number(schedule.medicationId)
        );


    selectedScheduleId =
        scheduleId;


    doseMedicationName.textContent =
        medication?.name || "الدواء";


    doseScheduledTime.textContent =
        formatTime(schedule.scheduledTime);


    clearModalMessage(
        doseMessage
    );


    doseModal.classList.remove(
        "hidden"
    );
}


// =============================
// Record Dose
// =============================

document
    .querySelectorAll(".dose-status-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const status =
                    button.dataset.status;

                if (editingLogId) {

                    saveUpdatedLogStatus(status);

                } else {

                    recordDose(status);
                }
            }
        );
    });


async function recordDose(status) {

    const schedule =
        todaySchedules.find(
            item =>
                Number(item.id) ===
                Number(selectedScheduleId)
        );


    if (!schedule) {
        return;
    }


    const scheduledDateTime =
        buildTodayDateTime(
            schedule.scheduledTime
        );


    const log = {

        scheduleId:
        schedule.id,

        scheduledDateTime:
        scheduledDateTime,

        takenAt:
            status === "missed"
                ? null
                : getCurrentLocalDateTime(),

        recordedAt:
            null,

        status:
        status
    };


    const buttons =
        document.querySelectorAll(
            ".dose-status-btn"
        );


    buttons.forEach(button =>
        button.disabled = true
    );


    try {

        const response = await fetch(
            "/api/v1/medication-log/add-medication-log",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(log)
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showModalMessage(
                doseMessage,
                result.message ||
                "تعذر تسجيل الجرعة",
                "error"
            );

            return;
        }


        closeDoseModal();


        showPageMessage(
            "تم تسجيل حالة الجرعة بنجاح",
            "success"
        );


        await refreshMedicationPage();


    } catch (error) {

        console.error(error);

        showModalMessage(
            doseMessage,
            "تعذر الاتصال بالخادم",
            "error"
        );

    } finally {

        buttons.forEach(button =>
            button.disabled = false
        );
    }
}


// =============================
// Today Logs
// =============================

async function loadTodayLogs() {

    try {

        const response = await fetch(
            `/api/v1/medication-log/get-today-medication-logs/${patientId}`
        );


        const result =
            await readResponse(response);


        todayLogs =
            response.ok &&
            Array.isArray(result.data)
                ? result.data
                : [];


        renderTodayLogs();
        renderTodaySchedule();


    } catch (error) {

        console.error(error);

        todayLogs = [];

        renderTodayLogs();
    }
}


function renderTodayLogs() {

    todayLogsList.innerHTML = "";


    if (todayLogs.length === 0) {

        emptyLogs.classList.remove(
            "hidden"
        );

        return;
    }


    emptyLogs.classList.add(
        "hidden"
    );


    todayLogs.forEach(log => {

        const schedule =
            schedules.find(
                item =>
                    Number(item.id) ===
                    Number(log.scheduleId)
            );


        const medication =
            medications.find(
                item =>
                    Number(item.id) ===
                    Number(schedule?.medicationId)
            );


        const item =
            document.createElement("div");


        item.className =
            "log-item";


        item.innerHTML = `

            <div class="log-icon
                ${getLogStatusClass(log.status)}">

                <span class="material-symbols-rounded">
                    ${getLogIcon(log.status)}
                </span>

            </div>

            <div class="log-content">

                <strong>
                    ${escapeHtml(
            medication?.name || "دواء"
        )}
                </strong>

                <span>
                    ${translateLogStatus(log.status)}
                    •
                    ${formatDateTime(log.scheduledDateTime)}
                </span>

            </div>

            <button type="button"
                    class="small-btn edit-log-btn"
                    data-id="${log.id}">
                تعديل الحالة
            </button>

            <button type="button"
                    class="small-btn danger delete-log-btn"
                    data-id="${log.id}">

                <span class="material-symbols-rounded">
                    delete
                </span>
            </button>
        `;


        todayLogsList.appendChild(
            item
        );
    });


    bindLogButtons();
}


// =============================
// Update Log
// =============================

function bindLogButtons() {

    document
        .querySelectorAll(".edit-log-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    updateLogStatus(
                        Number(button.dataset.id)
                    )
            );
        });


    document
        .querySelectorAll(".delete-log-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    deleteLog(
                        Number(button.dataset.id)
                    )
            );
        });
}

function updateLogStatus(id) {

    const log = todayLogs.find(
        item => Number(item.id) === Number(id)
    );

    if (!log) {
        return;
    }

    const schedule = todaySchedules.find(
        item => Number(item.id) === Number(log.scheduleId)
    );

    if (!schedule) {
        showPageMessage(
            "تعذر العثور على موعد الجرعة",
            "error"
        );
        return;
    }

    const medication = medications.find(
        item => Number(item.id) === Number(schedule.medicationId)
    );

    editingLogId = Number(id);
    selectedScheduleId = Number(log.scheduleId);

    doseMedicationName.textContent =
        medication?.name || "الدواء";

    doseScheduledTime.textContent =
        formatTime(schedule.scheduledTime);

    clearModalMessage(doseMessage);

    doseModal.classList.remove("hidden");
}

async function saveUpdatedLogStatus(status) {

    const log = todayLogs.find(
        item =>
            Number(item.id) ===
            Number(editingLogId)
    );

    if (!log) {
        return;
    }


    const updatedLog = {

        scheduleId:
        log.scheduleId,

        scheduledDateTime:
        log.scheduledDateTime,

        takenAt:
            status === "missed"
                ? null
                : (
                    log.takenAt ||
                    getCurrentLocalDateTime()
                ),

        recordedAt:
        log.recordedAt,

        status:
        status
    };


    const buttons =
        document.querySelectorAll(
            ".dose-status-btn"
        );


    buttons.forEach(button =>
        button.disabled = true
    );


    try {

        const response = await fetch(
            `/api/v1/medication-log/update-medication-log/${editingLogId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(updatedLog)
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showModalMessage(
                doseMessage,
                result.message ||
                "تعذر تحديث حالة الجرعة",
                "error"
            );

            return;
        }


        closeDoseModal();


        showPageMessage(
            "تم تحديث حالة الجرعة بنجاح",
            "success"
        );


        await refreshMedicationPage();


    } catch (error) {

        console.error(error);

        showModalMessage(
            doseMessage,
            "تعذر الاتصال بالخادم",
            "error"
        );


    } finally {

        buttons.forEach(button =>
            button.disabled = false
        );
    }
}
// =============================
// Delete Log
// =============================

async function deleteLog(id) {

    if (!confirm(
        "هل تريدين حذف تسجيل هذه الجرعة؟"
    )) {
        return;
    }


    try {

        const response = await fetch(
            `/api/v1/medication-log/delete-medication-log/${id}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر حذف تسجيل الجرعة",
                "error"
            );

            return;
        }


        showPageMessage(
            "تم حذف تسجيل الجرعة وإعادة المخزون عند الحاجة",
            "success"
        );


        await refreshMedicationPage();


    } catch (error) {

        console.error(error);
    }
}


// =============================
// Summary
// =============================

async function loadTodaySummary() {

    try {

        const response = await fetch(
            `/api/v1/medication-log/get-today-medication-summary/${patientId}`
        );


        const result =
            await readResponse(response);


        if (!response.ok) {
            return;
        }


        const summary =
            result.data?.message ||
            result.message ||
            "";


        const numbers =
            summary.match(/\d+/g) || [];


        document.getElementById(
            "totalDoses"
        ).textContent =
            numbers[0] || "0";


        document.getElementById(
            "completedDoses"
        ).textContent =
            numbers[1] || "0";


        document.getElementById(
            "missedDoses"
        ).textContent =
            numbers[2] || "0";


        document.getElementById(
            "remainingDoses"
        ).textContent =
            numbers[3] || "0";


    } catch (error) {

        console.error(error);
    }
}


// =============================
// Warnings
// =============================

async function loadWarnings() {

    try {

        const response = await fetch(
            `/api/v1/medication/get-medication-Warnings/${patientId}`
        );


        const result =
            await readResponse(response);


        const warnings =
            response.ok &&
            Array.isArray(result.data)
                ? result.data
                : [];


        warningsList.innerHTML = "";


        if (warnings.length === 0) {

            warningsSection.classList.add(
                "hidden"
            );

            return;
        }


        warningsSection.classList.remove(
            "hidden"
        );


        warnings.forEach(medication => {

            const item =
                document.createElement("div");


            item.className =
                "warning-item";


            let warningText =
                `المخزون الحالي: ${medication.stockQuantity}`;


            if (
                medication.stockQuantity <=
                medication.lowStockLimit
            ) {

                warningText =
                    `المخزون منخفض — المتبقي ${medication.stockQuantity}`;
            }


            item.innerHTML = `

                <span class="material-symbols-rounded">
                    warning
                </span>

                <div>
                    <strong>
                        ${escapeHtml(medication.name)}
                    </strong>

                    <p>
                        ${warningText}
                    </p>
                </div>
            `;


            warningsList.appendChild(
                item
            );
        });


    } catch (error) {

        console.error(error);
    }
}


// =============================
// Refresh
// =============================

async function refreshMedicationPage() {

    await loadMedications();
    await loadSchedules();

    await Promise.all([
        loadTodayLogs(),
        loadTodaySchedule(),
        loadTodaySummary(),
        loadWarnings()
    ]);
}


// =============================
// Close Modals
// =============================

document.getElementById(
    "closeMedicationModal"
).addEventListener(
    "click",
    closeMedicationModal
);


document.getElementById(
    "cancelMedicationBtn"
).addEventListener(
    "click",
    closeMedicationModal
);


function closeMedicationModal() {

    medicationModal.classList.add(
        "hidden"
    );

    medicationForm.reset();

    editingMedicationId = null;

    clearModalMessage(
        medicationFormMessage
    );
}


document.getElementById(
    "closeScheduleModal"
).addEventListener(
    "click",
    closeScheduleModal
);


document.getElementById(
    "cancelScheduleBtn"
).addEventListener(
    "click",
    closeScheduleModal
);


function closeScheduleModal() {

    scheduleModal.classList.add(
        "hidden"
    );

    scheduleForm.reset();

    editingScheduleId = null;
    selectedMedicationId = null;

    dayOfWeekGroup.classList.add(
        "hidden"
    );

    clearModalMessage(
        scheduleFormMessage
    );
}


document.getElementById(
    "closeDoseModal"
).addEventListener(
    "click",
    closeDoseModal
);


function closeDoseModal() {

    doseModal.classList.add(
        "hidden"
    );

    selectedScheduleId = null;
    editingLogId = null;

    clearModalMessage(
        doseMessage
    );
}
[
    medicationModal,
    scheduleModal,
    doseModal,
    stockModal,
    reactivateModal
].forEach(modal => {

    modal.addEventListener(
        "click",
        event => {

            if (event.target !== modal) {
                return;
            }

            if (modal === medicationModal) {
                closeMedicationModal();
            }

            if (modal === scheduleModal) {
                closeScheduleModal();
            }

            if (modal === doseModal) {
                closeDoseModal();
            }

            if (modal === stockModal) {
                closeStockModal();
            }

            if (modal === reactivateModal) {
                closeReactivateModal();
            }
        }
    );
});


// =============================
// Helpers
// =============================

function translateUnit(unit) {

    const units = {
        mg: "mg",
        g: "g",
        mcg: "mcg",
        ml: "ml",
        tablet: "قرص",
        capsule: "كبسولة"
    };

    return units[unit] || unit;
}


function translateMedicationStatus(status) {

    const statuses = {
        active: "نشط",
        completed: "مكتمل",
        discontinued: "متوقف"
    };

    return statuses[status] || status;
}


function getMedicationStatusClass(status) {

    if (status === "active") {
        return "status-active";
    }

    if (status === "completed") {
        return "status-completed";
    }

    return "status-discontinued";
}


function translateSchedule(schedule) {

    if (schedule.scheduleType === "daily") {
        return "يوميًا";
    }

    return `أسبوعيًا - ${translateDay(schedule.dayOfWeek)}`;
}


function translateDay(day) {

    const days = {
        sunday: "الأحد",
        monday: "الاثنين",
        tuesday: "الثلاثاء",
        wednesday: "الأربعاء",
        thursday: "الخميس",
        friday: "الجمعة",
        saturday: "السبت"
    };

    return days[day] || day;
}


function translateLogStatus(status) {

    const statuses = {
        taken: "تم أخذ الجرعة",
        missed: "لم يتم أخذ الجرعة",
        late: "تم أخذ الجرعة متأخرًا"
    };

    return statuses[status] || status;
}


function getLogStatusClass(status) {

    if (status === "taken") {
        return "log-taken";
    }

    if (status === "late") {
        return "log-late";
    }

    return "log-missed";
}


function getLogIcon(status) {

    if (status === "taken") {
        return "check";
    }

    if (status === "late") {
        return "schedule";
    }

    return "close";
}


function formatDate(value) {

    if (!value) {
        return "-";
    }

    return new Date(
        `${value}T00:00:00`
    ).toLocaleDateString(
        "ar-SA",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


function formatTime(value) {

    if (!value) {
        return "-";
    }

    const parts =
        value.split(":");

    const date =
        new Date();

    date.setHours(
        Number(parts[0]),
        Number(parts[1]),
        0
    );

    return date.toLocaleTimeString(
        "ar-SA",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatDateTime(value) {

    if (!value) {
        return "-";
    }

    return new Date(value)
        .toLocaleString(
            "ar-SA",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


function buildTodayDateTime(time) {

    const now =
        new Date();

    const date =
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const normalizedTime =
        time.length === 5
            ? `${time}:00`
            : time;

    return `${date}T${normalizedTime}`;
}


function getCurrentLocalDateTime() {

    const now =
        new Date();

    return (
        `${now.getFullYear()}-` +
        `${pad(now.getMonth() + 1)}-` +
        `${pad(now.getDate())}T` +
        `${pad(now.getHours())}:` +
        `${pad(now.getMinutes())}:` +
        `${pad(now.getSeconds())}`
    );
}


function pad(value) {

    return String(value).padStart(
        2,
        "0"
    );
}


function showPageMessage(
    message,
    type
) {

    pageMessage.textContent =
        message || "";

    pageMessage.className =
        `form-message ${type}`;
}


function clearPageMessage() {

    pageMessage.textContent = "";

    pageMessage.className =
        "form-message";
}


function showModalMessage(
    element,
    message,
    type
) {

    element.textContent =
        message || "";

    element.className =
        `modal-message ${type}`;
}


function clearModalMessage(element) {

    element.textContent = "";

    element.className =
        "modal-message";
}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}
function closeStockModal() {

    stockModal.classList.add("hidden");

    stockForm.reset();

    stockMedicationId = null;

    clearModalMessage(stockMessage);
}


function closeReactivateModal() {

    reactivateModal.classList.add("hidden");

    reactivateMedicationId = null;

    updateMedicationDates.checked = false;

    reactivateDates.classList.add("hidden");

    reactivateStartDate.required = false;

    reactivateStartDate.value = "";
    reactivateEndDate.value = "";

    clearModalMessage(reactivateMessage);
}


document
    .getElementById("closeStockModal")
    .addEventListener(
        "click",
        closeStockModal
    );

document
    .getElementById("cancelStockBtn")
    .addEventListener(
        "click",
        closeStockModal
    );


document
    .getElementById("closeReactivateModal")
    .addEventListener(
        "click",
        closeReactivateModal
    );

document
    .getElementById("cancelReactivateBtn")
    .addEventListener(
        "click",
        closeReactivateModal
    );