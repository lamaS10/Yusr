const patientId =
    Number(sessionStorage.getItem("patientId"));

const caregiverId =
    Number(sessionStorage.getItem("caregiverId"));


let readings = [];
let latestReadings = [];
let abnormalReadings = [];

let editingReadingId = null;


// =========================
// Elements
// =========================

const addReadingBtn =
    document.getElementById("addReadingBtn");

const readingsList =
    document.getElementById("readingsList");

const emptyReadings =
    document.getElementById("emptyReadings");

const emptyReadingsTitle =
    document.getElementById("emptyReadingsTitle");

const emptyReadingsText =
    document.getElementById("emptyReadingsText");

const pageMessage =
    document.getElementById("pageMessage");


// Attention

const attentionReadings =
    document.getElementById("attentionReadings");

const emptyAttention =
    document.getElementById("emptyAttention");

const attentionCount =
    document.getElementById("attentionCount");


// Filters

const periodFilter =
    document.getElementById("periodFilter");

const readingFilter =
    document.getElementById("readingFilter");

const statusFilter =
    document.getElementById("statusFilter");

const glucoseFilter =
    document.getElementById("glucoseFilter");

const glucoseFilterGroup =
    document.getElementById("glucoseFilterGroup");

const sortFilter =
    document.getElementById("sortFilter");

const customDateFilters =
    document.getElementById("customDateFilters");

const fromDateFilter =
    document.getElementById("fromDateFilter");

const toDateFilter =
    document.getElementById("toDateFilter");

const resetFiltersBtn =
    document.getElementById("resetFiltersBtn");

const historyResultCount =
    document.getElementById("historyResultCount");


// Modal

const readingModal =
    document.getElementById("readingModal");

const readingForm =
    document.getElementById("readingForm");

const readingModalTitle =
    document.getElementById("readingModalTitle");

const readingModalDescription =
    document.getElementById("readingModalDescription");

const readingType =
    document.getElementById("readingType");

const singleValueGroup =
    document.getElementById("singleValueGroup");

const bloodPressureGroup =
    document.getElementById("bloodPressureGroup");

const glucoseMeasurementGroup =
    document.getElementById("glucoseMeasurementGroup");

const glucoseMeasurementType =
    document.getElementById("glucoseMeasurementType");

const readingValue =
    document.getElementById("readingValue");

const readingValueLabel =
    document.getElementById("readingValueLabel");

const readingUnit =
    document.getElementById("readingUnit");

const systolicValue =
    document.getElementById("systolicValue");

const diastolicValue =
    document.getElementById("diastolicValue");

const measuredAt =
    document.getElementById("measuredAt");

const readingNotes =
    document.getElementById("readingNotes");

const readingFormMessage =
    document.getElementById("readingFormMessage");

const saveReadingBtn =
    document.getElementById("saveReadingBtn");


// =========================
// Start
// =========================

if (!caregiverId) {

    window.location.replace("/login");

} else if (!patientId) {

    window.location.replace("/dashboard");

} else {

    initializePage();
}


async function initializePage() {

    clearPageMessage();

    setMaximumMeasuredTime();

    setMaximumFilterDates();

    await Promise.all([
        loadLatestReadings(),
        loadPatientReadings(),
        loadAbnormalReadings()
    ]);
}


// =========================
// Backend Response
// =========================

async function readResponse(response) {

    const text =
        await response.text();


    if (!text) {

        return {
            data: null,
            message: ""
        };
    }


    try {

        const data =
            JSON.parse(text);


        return {
            data: data,
            message:
                data?.message || text
        };


    } catch (error) {

        return {
            data: null,
            message: text
        };
    }
}


// =========================
// Latest Readings
// =========================

async function loadLatestReadings() {

    try {

        const response = await fetch(
            `/api/v1/health-reading/get-latest-health-readings/${patientId}`
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر تحميل أحدث القراءات",
                "error"
            );

            return;
        }


        latestReadings =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderLatestReadings();


    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// =========================
// Render Latest
// =========================

function renderLatestReadings() {

    resetLatestCards();


    latestReadings.forEach(reading => {

        const value =
            getReadingDisplayValue(reading);


        const time =
            reading.measuredAt
                ? `آخر قياس: ${formatDateTime(reading.measuredAt)}`
                : "لا يوجد وقت للقياس";


        switch (reading.readingType) {

            case "blood_pressure":

                setLatestCard(
                    "latestBloodPressure",
                    "latestBloodPressureTime",
                    "latestBloodPressureStatus",
                    reading,
                    value,
                    time
                );

                break;


            case "glucose":

                setLatestCard(
                    "latestGlucose",
                    "latestGlucoseTime",
                    "latestGlucoseStatus",
                    reading,
                    value,
                    time
                );


                const glucoseContext =
                    document.getElementById(
                        "latestGlucoseContext"
                    );


                if (reading.glucoseMeasurementType) {

                    glucoseContext.textContent =
                        translateGlucoseMeasurementType(
                            reading.glucoseMeasurementType
                        );

                    glucoseContext.classList.remove(
                        "hidden"
                    );
                }

                break;


            case "temperature":

                setLatestCard(
                    "latestTemperature",
                    "latestTemperatureTime",
                    "latestTemperatureStatus",
                    reading,
                    value,
                    time
                );

                break;


            case "weight":

                setLatestCard(
                    "latestWeight",
                    "latestWeightTime",
                    "latestWeightStatus",
                    reading,
                    value,
                    time
                );

                break;


            case "heart_rate":

                setLatestCard(
                    "latestHeartRate",
                    "latestHeartRateTime",
                    "latestHeartRateStatus",
                    reading,
                    value,
                    time
                );

                break;
        }
    });
}


function setLatestCard(
    valueId,
    timeId,
    statusId,
    reading,
    value,
    time
) {

    document.getElementById(
        valueId
    ).textContent = value;


    document.getElementById(
        timeId
    ).textContent = time;


    const statusElement =
        document.getElementById(
            statusId
        );


    setStatusBadge(
        statusElement,
        reading.readingStatus
    );
}


function resetLatestCards() {

    const latestCards = [
        [
            "latestBloodPressure",
            "latestBloodPressureTime",
            "latestBloodPressureStatus"
        ],
        [
            "latestGlucose",
            "latestGlucoseTime",
            "latestGlucoseStatus"
        ],
        [
            "latestTemperature",
            "latestTemperatureTime",
            "latestTemperatureStatus"
        ],
        [
            "latestWeight",
            "latestWeightTime",
            "latestWeightStatus"
        ],
        [
            "latestHeartRate",
            "latestHeartRateTime",
            "latestHeartRateStatus"
        ]
    ];


    latestCards.forEach(ids => {

        document.getElementById(
            ids[0]
        ).textContent = "--";


        document.getElementById(
            ids[1]
        ).textContent =
            "لا توجد قراءة";


        const badge =
            document.getElementById(
                ids[2]
            );


        badge.textContent = "";

        badge.className =
            "status-badge hidden";
    });


    const glucoseContext =
        document.getElementById(
            "latestGlucoseContext"
        );


    glucoseContext.textContent = "";

    glucoseContext.classList.add(
        "hidden"
    );
}


// =========================
// Abnormal Readings
// =========================

async function loadAbnormalReadings() {

    try {

        const response = await fetch(
            `/api/v1/health-reading/get-abnormal-health-readings/${patientId}`
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر تحميل القراءات التي تحتاج الانتباه",
                "error"
            );

            return;
        }


        abnormalReadings =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderAbnormalReadings();


    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


function renderAbnormalReadings() {

    attentionReadings.innerHTML = "";


    const sortedReadings =
        [...abnormalReadings]
            .sort(
                (a, b) =>
                    new Date(b.measuredAt) -
                    new Date(a.measuredAt)
            );


    if (sortedReadings.length === 0) {

        emptyAttention.classList.remove(
            "hidden"
        );

        attentionCount.classList.add(
            "hidden"
        );

        return;
    }


    emptyAttention.classList.add(
        "hidden"
    );


    attentionCount.textContent =
        sortedReadings.length;


    attentionCount.classList.remove(
        "hidden"
    );


    sortedReadings.forEach(reading => {

        attentionReadings.appendChild(
            createAttentionCard(reading)
        );
    });
}


function createAttentionCard(reading) {

    const card =
        document.createElement("article");


    card.className =
        `attention-card status-card-${reading.readingStatus}`;


    const glucoseContext =
        reading.readingType === "glucose" &&
        reading.glucoseMeasurementType
            ? `
                <span>
                    ${translateGlucoseMeasurementType(
                reading.glucoseMeasurementType
            )}
                </span>
              `
            : "";


    card.innerHTML = `

        <div class="attention-icon">

            <span class="material-symbols-rounded">
                ${getAttentionIcon(reading.readingStatus)}
            </span>

        </div>


        <div class="attention-info">

            <div class="attention-top">

                <h3>
                    ${translateReadingType(reading.readingType)}
                </h3>

                <span class="attention-value">
                    ${getReadingDisplayValue(reading)}
                </span>

                ${createStatusBadgeHtml(
        reading.readingStatus
    )}

            </div>


            <div class="attention-meta">

                ${glucoseContext}

                <span>
                    ${formatDateTime(reading.measuredAt)}
                </span>

            </div>

        </div>
    `;


    return card;
}


// =========================
// Patient Reading History
// =========================

async function loadPatientReadings() {

    try {

        const response = await fetch(
            `/api/v1/health-reading/get-patient-health-readings/${patientId}`
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر تحميل سجل القراءات",
                "error"
            );

            return;
        }


        readings =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderReadings();


    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// =========================
// Filters
// =========================

[
    periodFilter,
    readingFilter,
    statusFilter,
    glucoseFilter,
    sortFilter,
    fromDateFilter,
    toDateFilter
].forEach(element => {

    element.addEventListener(
        "change",
        function () {

            updateFilterVisibility();

            renderReadings();
        }
    );
});


resetFiltersBtn.addEventListener(
    "click",
    resetFilters
);


function updateFilterVisibility() {

    if (
        periodFilter.value === "custom"
    ) {

        customDateFilters.classList.remove(
            "hidden"
        );

    } else {

        customDateFilters.classList.add(
            "hidden"
        );
    }


    if (
        readingFilter.value === "glucose"
    ) {

        glucoseFilterGroup.classList.remove(
            "hidden"
        );

    } else {

        glucoseFilterGroup.classList.add(
            "hidden"
        );

        glucoseFilter.value = "all";
    }
}


function resetFilters() {

    periodFilter.value = "all";

    readingFilter.value = "all";

    statusFilter.value = "all";

    glucoseFilter.value = "all";

    sortFilter.value = "newest";

    fromDateFilter.value = "";

    toDateFilter.value = "";


    updateFilterVisibility();

    renderReadings();
}


// =========================
// Render History
// =========================

function renderReadings() {

    readingsList.innerHTML = "";


    let displayedReadings =
        [...readings];


    displayedReadings =
        filterByPeriod(
            displayedReadings
        );


    if (
        readingFilter.value !== "all"
    ) {

        displayedReadings =
            displayedReadings.filter(
                reading =>
                    reading.readingType ===
                    readingFilter.value
            );
    }


    if (
        statusFilter.value !== "all"
    ) {

        displayedReadings =
            displayedReadings.filter(
                reading =>
                    reading.readingStatus ===
                    statusFilter.value
            );
    }


    if (
        readingFilter.value === "glucose" &&
        glucoseFilter.value !== "all"
    ) {

        displayedReadings =
            displayedReadings.filter(
                reading =>
                    reading.glucoseMeasurementType ===
                    glucoseFilter.value
            );
    }


    displayedReadings.sort(
        (a, b) => {

            const first =
                new Date(a.measuredAt);

            const second =
                new Date(b.measuredAt);


            if (
                sortFilter.value ===
                "oldest"
            ) {

                return first - second;
            }


            return second - first;
        }
    );


    updateHistoryResultCount(
        displayedReadings.length
    );


    if (
        displayedReadings.length === 0
    ) {

        emptyReadings.classList.remove(
            "hidden"
        );


        if (readings.length === 0) {

            emptyReadingsTitle.textContent =
                "لا توجد قراءات صحية";

            emptyReadingsText.textContent =
                "عند تسجيل أول قراءة صحية ستظهر هنا.";

        } else {

            emptyReadingsTitle.textContent =
                "لا توجد نتائج مطابقة";

            emptyReadingsText.textContent =
                "لا توجد قراءات تطابق الفلاتر المحددة.";
        }


        return;
    }


    emptyReadings.classList.add(
        "hidden"
    );


    displayedReadings.forEach(
        reading => {

            readingsList.appendChild(
                createReadingCard(reading)
            );
        }
    );


    bindReadingButtons();
}


function filterByPeriod(list) {

    const period =
        periodFilter.value;


    if (period === "all") {

        return list;
    }


    if (period === "custom") {

        return list.filter(reading => {

            const measuredDate =
                getLocalDateOnly(
                    reading.measuredAt
                );


            if (!measuredDate) {
                return false;
            }


            if (
                fromDateFilter.value &&
                measuredDate <
                fromDateFilter.value
            ) {

                return false;
            }


            if (
                toDateFilter.value &&
                measuredDate >
                toDateFilter.value
            ) {

                return false;
            }


            return true;
        });
    }


    const now =
        new Date();


    const todayStart =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    if (period === "today") {

        return list.filter(reading => {

            const date =
                new Date(reading.measuredAt);


            return (
                date >= todayStart &&
                date <= now
            );
        });
    }


    const days =
        Number(period);


    const start =
        new Date(todayStart);


    start.setDate(
        start.getDate() -
        (days - 1)
    );


    return list.filter(reading => {

        const date =
            new Date(reading.measuredAt);


        return (
            date >= start &&
            date <= now
        );
    });
}


function updateHistoryResultCount(
    count
) {

    historyResultCount.textContent =
        `${count} ${getReadingCountLabel(count)}`;
}


function getReadingCountLabel(count) {

    if (count === 1) {
        return "قراءة";
    }

    if (
        count >= 3 &&
        count <= 10
    ) {
        return "قراءات";
    }

    return "قراءة";
}


// =========================
// Reading Card
// =========================

function createReadingCard(reading) {

    const item =
        document.createElement("article");


    item.className =
        "reading-item";


    const glucoseContext =
        reading.readingType === "glucose" &&
        reading.glucoseMeasurementType
            ? `
                <span class="meta-item glucose-context">

                    <span class="material-symbols-rounded">
                        restaurant
                    </span>

                    ${translateGlucoseMeasurementType(
                reading.glucoseMeasurementType
            )}

                </span>
              `
            : "";


    item.innerHTML = `

        <div class="reading-item-icon">

            <span class="material-symbols-rounded">
                ${getReadingIcon(reading.readingType)}
            </span>

        </div>


        <div class="reading-info">

            <div class="reading-top">

                <h3>
                    ${translateReadingType(reading.readingType)}
                </h3>

                <span class="reading-value">
                    ${getReadingDisplayValue(reading)}
                </span>

                ${createStatusBadgeHtml(
        reading.readingStatus
    )}

            </div>


            <div class="reading-meta">

                <span class="meta-item">

                    <span class="material-symbols-rounded">
                        schedule
                    </span>

                    وقت القياس:
                    ${formatDateTime(reading.measuredAt)}

                </span>


                <span class="meta-item">

                    <span class="material-symbols-rounded">
                        edit_calendar
                    </span>

                    سُجلت:
                    ${formatDateTime(reading.recordedAt)}

                </span>


                ${glucoseContext}

            </div>


            ${
        reading.notes
            ? `
                        <p class="reading-notes">
                            ${escapeHtml(reading.notes)}
                        </p>
                      `
            : ""
    }

        </div>


        <div class="reading-actions">

            <button type="button"
                    class="small-btn edit-reading-btn"
                    data-id="${reading.id}"
                    title="تعديل">

                <span class="material-symbols-rounded">
                    edit
                </span>

            </button>


            <button type="button"
                    class="small-btn danger delete-reading-btn"
                    data-id="${reading.id}"
                    title="حذف">

                <span class="material-symbols-rounded">
                    delete
                </span>

            </button>

        </div>
    `;


    return item;
}


// =========================
// Add Reading
// =========================

addReadingBtn.addEventListener(
    "click",
    function () {

        editingReadingId = null;


        readingForm.reset();


        resetReadingFields();


        readingModalTitle.textContent =
            "إضافة قراءة صحية";


        readingModalDescription.textContent =
            "سجلي القياس الصحي للمريض";


        clearModalMessage();


        setMaximumMeasuredTime();


        readingModal.classList.remove(
            "hidden"
        );


        readingType.focus();
    }
);


// =========================
// Reading Type
// =========================

readingType.addEventListener(
    "change",
    updateReadingFields
);


function updateReadingFields() {

    const type =
        readingType.value;


    readingValue.value = "";

    systolicValue.value = "";

    diastolicValue.value = "";

    glucoseMeasurementType.value = "";


    glucoseMeasurementGroup.classList.add(
        "hidden"
    );


    glucoseMeasurementType.required = false;


    if (!type) {

        singleValueGroup.classList.add(
            "hidden"
        );

        bloodPressureGroup.classList.add(
            "hidden"
        );


        readingValue.required = false;

        systolicValue.required = false;

        diastolicValue.required = false;


        return;
    }


    if (
        type === "blood_pressure"
    ) {

        singleValueGroup.classList.add(
            "hidden"
        );

        bloodPressureGroup.classList.remove(
            "hidden"
        );


        readingValue.required = false;

        systolicValue.required = true;

        diastolicValue.required = true;


        return;
    }


    bloodPressureGroup.classList.add(
        "hidden"
    );

    singleValueGroup.classList.remove(
        "hidden"
    );


    readingValue.required = true;

    systolicValue.required = false;

    diastolicValue.required = false;


    if (
        type === "glucose"
    ) {

        glucoseMeasurementGroup.classList.remove(
            "hidden"
        );

        glucoseMeasurementType.required = true;
    }


    const typeDetails = {

        glucose: {
            label: "مستوى سكر الدم",
            unit: "mg/dL"
        },

        temperature: {
            label: "درجة الحرارة",
            unit: "C"
        },

        weight: {
            label: "الوزن",
            unit: "kg"
        },

        heart_rate: {
            label: "معدل نبض القلب",
            unit: "bpm"
        }
    };


    readingValueLabel.textContent =
        typeDetails[type]?.label ||
        "قيمة القراءة";


    readingUnit.textContent =
        typeDetails[type]?.unit ||
        "-";
}


// =========================
// Edit Reading
// =========================

function openEditReading(id) {

    const reading =
        readings.find(
            item =>
                Number(item.id) === id
        );


    if (!reading) {
        return;
    }


    editingReadingId = id;


    readingForm.reset();


    readingModalTitle.textContent =
        "تعديل القراءة الصحية";


    readingModalDescription.textContent =
        "تعديل بيانات القياس المسجل";


    readingType.value =
        reading.readingType;


    updateReadingFields();


    if (
        reading.readingType ===
        "blood_pressure"
    ) {

        systolicValue.value =
            reading.systolicValue ?? "";

        diastolicValue.value =
            reading.diastolicValue ?? "";

    } else {

        readingValue.value =
            reading.readingValue ?? "";
    }


    if (
        reading.readingType ===
        "glucose"
    ) {

        glucoseMeasurementType.value =
            reading.glucoseMeasurementType ||
            "";
    }


    measuredAt.value =
        toDateTimeLocal(
            reading.measuredAt
        );


    readingNotes.value =
        reading.notes || "";


    clearModalMessage();


    setMaximumMeasuredTime();


    readingModal.classList.remove(
        "hidden"
    );
}


// =========================
// Save Add / Update
// =========================

readingForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const oldReading =
            editingReadingId
                ? readings.find(
                    item =>
                        Number(item.id) ===
                        editingReadingId
                )
                : null;


        const type =
            readingType.value;


        if (
            type === "glucose" &&
            !glucoseMeasurementType.value
        ) {

            showModalMessage(
                "حددي إذا كانت قراءة السكر صائم أو بعد الوجبة",
                "error"
            );

            return;
        }


        const healthReading = {

            patientId:
            patientId,

            readingType:
            type,

            readingValue:
                type === "blood_pressure"
                    ? null
                    : getNumberOrNull(
                        readingValue.value
                    ),

            systolicValue:
                type === "blood_pressure"
                    ? getNumberOrNull(
                        systolicValue.value
                    )
                    : null,

            diastolicValue:
                type === "blood_pressure"
                    ? getNumberOrNull(
                        diastolicValue.value
                    )
                    : null,

            unit:
                oldReading?.unit || null,

            recordedAt:
                oldReading?.recordedAt || null,

            measuredAt:
                measuredAt.value
                    ? normalizeDateTime(
                        measuredAt.value
                    )
                    : null,

            notes:
                readingNotes.value.trim() ||
                null,

            readingStatus:
                oldReading?.readingStatus ||
                null,

            glucoseMeasurementType:
                type === "glucose"
                    ? glucoseMeasurementType.value
                    : null
        };


        let url =
            "/api/v1/health-reading/add-health-reading";

        let method =
            "POST";


        if (editingReadingId) {

            url =
                `/api/v1/health-reading/update-health-reading/${editingReadingId}`;

            method =
                "PUT";
        }


        saveReadingBtn.disabled = true;


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
                        JSON.stringify(
                            healthReading
                        )
                }
            );


            const result =
                await readResponse(response);


            if (!response.ok) {

                showModalMessage(
                    translateBackendMessage(
                        result.message
                    ) ||
                    "تعذر حفظ القراءة",
                    "error"
                );

                return;
            }


            const wasEditing =
                editingReadingId !== null;


            closeReadingModal();


            showPageMessage(
                wasEditing
                    ? "تم تحديث القراءة وتصنيفها بنجاح"
                    : "تمت إضافة القراءة وتصنيفها بنجاح",
                "success"
            );


            await refreshHealthReadings();


        } catch (error) {

            console.error(error);


            showModalMessage(
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            saveReadingBtn.disabled = false;
        }
    }
);


// =========================
// Delete
// =========================

async function deleteReading(id) {

    const reading =
        readings.find(
            item =>
                Number(item.id) === id
        );


    if (!reading) {
        return;
    }


    const confirmed =
        confirm(
            `هل تريدين حذف قراءة ${translateReadingType(reading.readingType)}؟`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/api/v1/health-reading/delete-health-reading/${id}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                translateBackendMessage(
                    result.message
                ) ||
                "تعذر حذف القراءة",
                "error"
            );

            return;
        }


        showPageMessage(
            "تم حذف القراءة بنجاح",
            "success"
        );


        await refreshHealthReadings();


    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// =========================
// Refresh
// =========================

async function refreshHealthReadings() {

    await Promise.all([
        loadLatestReadings(),
        loadPatientReadings(),
        loadAbnormalReadings()
    ]);
}


// =========================
// Bind Buttons
// =========================

function bindReadingButtons() {

    document
        .querySelectorAll(
            ".edit-reading-btn"
        )
        .forEach(button => {

            button.onclick = () =>
                openEditReading(
                    Number(
                        button.dataset.id
                    )
                );
        });


    document
        .querySelectorAll(
            ".delete-reading-btn"
        )
        .forEach(button => {

            button.onclick = () =>
                deleteReading(
                    Number(
                        button.dataset.id
                    )
                );
        });
}


// =========================
// Modal
// =========================

document.getElementById(
    "closeReadingModal"
).addEventListener(
    "click",
    closeReadingModal
);


document.getElementById(
    "cancelReadingBtn"
).addEventListener(
    "click",
    closeReadingModal
);


readingModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === readingModal
        ) {

            closeReadingModal();
        }
    }
);


function closeReadingModal() {

    readingModal.classList.add(
        "hidden"
    );


    readingForm.reset();


    resetReadingFields();


    editingReadingId = null;


    clearModalMessage();
}


// =========================
// Field Reset
// =========================

function resetReadingFields() {

    singleValueGroup.classList.add(
        "hidden"
    );

    bloodPressureGroup.classList.add(
        "hidden"
    );

    glucoseMeasurementGroup.classList.add(
        "hidden"
    );


    readingValue.required = false;

    systolicValue.required = false;

    diastolicValue.required = false;

    glucoseMeasurementType.required = false;


    readingValue.value = "";

    systolicValue.value = "";

    diastolicValue.value = "";

    glucoseMeasurementType.value = "";


    readingUnit.textContent = "-";
}


// =========================
// Status
// =========================

function setStatusBadge(
    element,
    status
) {

    if (!status) {

        element.className =
            "status-badge hidden";

        element.textContent = "";

        return;
    }


    element.textContent =
        translateReadingStatus(status);


    element.className =
        `status-badge ${getStatusClass(status)}`;
}


function createStatusBadgeHtml(
    status
) {

    if (!status) {
        return "";
    }


    return `
        <span class="status-badge ${getStatusClass(status)}">
            ${translateReadingStatus(status)}
        </span>
    `;
}


function getStatusClass(status) {

    const classes = {
        normal:
            "status-normal",

        low:
            "status-low",

        elevated:
            "status-elevated",

        high:
            "status-high",

        critical:
            "status-critical",

        not_classified:
            "status-not-classified"
    };


    return (
        classes[status] ||
        "status-not-classified"
    );
}


function getAttentionIcon(status) {

    if (status === "critical") {
        return "error";
    }

    if (status === "high") {
        return "warning";
    }

    if (status === "low") {
        return "arrow_downward";
    }

    return "priority_high";
}


// =========================
// Reading Display
// =========================

function getReadingDisplayValue(
    reading
) {

    if (
        reading.readingType ===
        "blood_pressure"
    ) {

        return (
            `${formatNumber(reading.systolicValue)}` +
            `/` +
            `${formatNumber(reading.diastolicValue)} ` +
            `${reading.unit || "mmHg"}`
        );
    }


    return (
        `${formatNumber(reading.readingValue)} ` +
        `${reading.unit || ""}`
    ).trim();
}


// =========================
// Translation
// =========================

function translateReadingType(type) {

    const types = {

        blood_pressure:
            "ضغط الدم",

        glucose:
            "سكر الدم",

        temperature:
            "درجة الحرارة",

        weight:
            "الوزن",

        heart_rate:
            "معدل نبض القلب"
    };


    return types[type] || type;
}


function translateReadingStatus(status) {

    const statuses = {

        normal:
            "طبيعي",

        low:
            "منخفض",

        elevated:
            "مرتفع قليلًا",

        high:
            "مرتفع",

        critical:
            "شديد الارتفاع",

        not_classified:
            "مسجل"
    };


    return (
        statuses[status] ||
        status
    );
}


function translateGlucoseMeasurementType(
    type
) {

    const types = {

        fasting:
            "صائم",

        after_meal:
            "بعد الوجبة"
    };


    return types[type] || type;
}


function translateBackendMessage(
    message
) {

    const messages = {

        "glucose measurement type is required":
            "حددي إذا كانت قراءة السكر صائم أو بعد الوجبة",

        "blood pressure requires systolic and diastolic values":
            "يجب إدخال الضغط الانقباضي والانبساطي",

        "reading value must be empty for blood pressure":
            "لا يمكن إدخال قيمة قراءة منفصلة لضغط الدم",

        "reading value is required":
            "قيمة القراءة مطلوبة",

        "systolic and diastolic values must be empty":
            "قيم الضغط الانقباضي والانبساطي مخصصة لقراءة ضغط الدم فقط",

        "patient id cannot be changed":
            "لا يمكن تغيير المريض المرتبط بالقراءة",

        "didn't find health reading":
            "لم يتم العثور على القراءة الصحية",

        "didn't find patient":
            "لم يتم العثور على المريض"
    };


    return messages[message] || message;
}


function getReadingIcon(type) {

    const icons = {

        blood_pressure:
            "blood_pressure",

        glucose:
            "glucose",

        temperature:
            "device_thermostat",

        weight:
            "monitor_weight",

        heart_rate:
            "cardiology"
    };


    return icons[type] || "monitoring";
}


// =========================
// Date Helpers
// =========================

function formatDateTime(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;
    }


    return date.toLocaleString(
        "ar-SA",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function toDateTimeLocal(value) {

    if (!value) {
        return "";
    }


    return value.substring(
        0,
        16
    );
}


function normalizeDateTime(value) {

    if (!value) {
        return null;
    }


    return value.length === 16
        ? `${value}:00`
        : value;
}


function setMaximumMeasuredTime() {

    measuredAt.max =
        getDateTimeLocalNow();
}


function setMaximumFilterDates() {

    const today =
        getLocalDateString(
            new Date()
        );


    fromDateFilter.max = today;

    toDateFilter.max = today;
}


function getDateTimeLocalNow() {

    const now =
        new Date();


    return (
        `${now.getFullYear()}-` +
        `${pad(now.getMonth() + 1)}-` +
        `${pad(now.getDate())}T` +
        `${pad(now.getHours())}:` +
        `${pad(now.getMinutes())}`
    );
}


function getLocalDateString(date) {

    return (
        `${date.getFullYear()}-` +
        `${pad(date.getMonth() + 1)}-` +
        `${pad(date.getDate())}`
    );
}


function getLocalDateOnly(value) {

    if (!value) {
        return null;
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;
    }


    return getLocalDateString(
        date
    );
}


function pad(value) {

    return String(value)
        .padStart(2, "0");
}


// =========================
// Value Helpers
// =========================

function getNumberOrNull(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;
    }


    return Number(value);
}


function formatNumber(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "-";
    }


    const number =
        Number(value);


    if (
        Number.isInteger(number)
    ) {

        return number.toString();
    }


    return number.toString();
}


// =========================
// Messages
// =========================

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
    message,
    type
) {

    readingFormMessage.textContent =
        message || "";


    readingFormMessage.className =
        `modal-message ${type}`;
}


function clearModalMessage() {

    readingFormMessage.textContent = "";


    readingFormMessage.className =
        "modal-message";
}


// =========================
// Escape HTML
// =========================

function escapeHtml(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;
}