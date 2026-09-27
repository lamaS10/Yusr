const caregiverId =
    Number(sessionStorage.getItem("caregiverId"));

const patientId =
    Number(sessionStorage.getItem("patientId"));

let latestSummary = null;
let summaryPreference = null;


// ================================
// Elements
// ================================

// Summary

const summaryLoading =
    document.getElementById("summaryLoading");

const noSummaryState =
    document.getElementById("noSummaryState");

const summaryContent =
    document.getElementById("summaryContent");

const summaryPeriod =
    document.getElementById("summaryPeriod");

const summaryGeneratedAt =
    document.getElementById("summaryGeneratedAt");

const summaryGenerationType =
    document.getElementById("summaryGenerationType");

const summaryText =
    document.getElementById("summaryText");

const summaryMessage =
    document.getElementById("summaryMessage");

const sendEmailBtn =
    document.getElementById("sendEmailBtn");


// Generate

const generateSection =
    document.getElementById("generateSection");

const generateSummaryForm =
    document.getElementById("generateSummaryForm");

const fromDate =
    document.getElementById("fromDate");

const toDate =
    document.getElementById("toDate");

const generateSummaryBtn =
    document.getElementById("generateSummaryBtn");

const generateMessage =
    document.getElementById("generateMessage");


// Preference

const preferenceLoading =
    document.getElementById("preferenceLoading");

const noPreferenceState =
    document.getElementById("noPreferenceState");

const preferenceContent =
    document.getElementById("preferenceContent");

const preferenceFrequency =
    document.getElementById("preferenceFrequency");

const lastGeneratedAt =
    document.getElementById("lastGeneratedAt");

const nextGenerationAt =
    document.getElementById("nextGenerationAt");

const autoStatusText =
    document.getElementById("autoStatusText");

const autoStatusDescription =
    document.getElementById("autoStatusDescription");

const toggleAutoGenerateBtn =
    document.getElementById("toggleAutoGenerateBtn");

const toggleText =
    document.getElementById("toggleText");

const preferenceMessage =
    document.getElementById("preferenceMessage");


// Preference Modal

const preferenceModal =
    document.getElementById("preferenceModal");

const preferenceForm =
    document.getElementById("preferenceForm");

const preferenceModalTitle =
    document.getElementById("preferenceModalTitle");

const frequency =
    document.getElementById("frequency");

const autoGenerate =
    document.getElementById("autoGenerate");

const preferenceModalMessage =
    document.getElementById("preferenceModalMessage");

const savePreferenceBtn =
    document.getElementById("savePreferenceBtn");


// ================================
// Start
// ================================

if (!caregiverId) {

    window.location.replace("/login");

} else if (!patientId) {

    window.location.replace("/dashboard");

} else {

    initializePage();
}


async function initializePage() {

    setDateLimits();

    await Promise.all([
        loadLatestSummary(),
        loadSummaryPreference()
    ]);
}


// ================================
// Response Helper
// ================================

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


// ================================
// Latest Summary
// ================================

async function loadLatestSummary() {

    summaryLoading.classList.remove(
        "hidden"
    );

    noSummaryState.classList.add(
        "hidden"
    );

    summaryContent.classList.add(
        "hidden"
    );

    sendEmailBtn.classList.add(
        "hidden"
    );


    try {

        const response =
            await fetch(
                `/api/v1/care-summary/get-latest-summary/${caregiverId}`
            );


        const result =
            await readResponse(response);


        if (!response.ok) {

            latestSummary = null;

            summaryLoading.classList.add(
                "hidden"
            );

            noSummaryState.classList.remove(
                "hidden"
            );

            return;
        }


        latestSummary =
            result.data;


        renderLatestSummary();

    } catch (error) {

        console.error(error);

        latestSummary = null;

        summaryLoading.classList.add(
            "hidden"
        );

        noSummaryState.classList.remove(
            "hidden"
        );


        showMessage(
            summaryMessage,
            "تعذر تحميل آخر ملخص",
            "error"
        );
    }
}


function renderLatestSummary() {

    if (!latestSummary) {
        return;
    }


    summaryLoading.classList.add(
        "hidden"
    );

    noSummaryState.classList.add(
        "hidden"
    );

    summaryContent.classList.remove(
        "hidden"
    );

    sendEmailBtn.classList.remove(
        "hidden"
    );


    summaryPeriod.textContent =
        `${formatDate(latestSummary.fromDate)} - ${formatDate(latestSummary.toDate)}`;


    summaryGeneratedAt.textContent =
        formatDateTime(
            latestSummary.generatedAt
        );


    summaryGenerationType.textContent =
        translateGenerationType(
            latestSummary.generationType
        );


    summaryText.innerHTML =
        formatSummary(
            latestSummary.summary ||
            "لا يوجد محتوى للملخص."
        );
}


// ================================
// Scroll To Generate
// ================================

document.getElementById(
    "goToGenerateBtn"
).addEventListener(
    "click",
    function () {

        generateSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        fromDate.focus();
    }
);


// ================================
// Generate Summary
// ================================

generateSummaryForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        clearMessage(
            generateMessage
        );


        const selectedFromDate =
            fromDate.value;


        const selectedToDate =
            toDate.value;


        if (
            !selectedFromDate ||
            !selectedToDate
        ) {

            showMessage(
                generateMessage,
                "حددي تاريخ البداية والنهاية",
                "error"
            );

            return;
        }


        if (
            selectedFromDate >
            selectedToDate
        ) {

            showMessage(
                generateMessage,
                "تاريخ البداية لا يمكن أن يكون بعد تاريخ النهاية",
                "error"
            );

            return;
        }


        generateSummaryBtn.disabled =
            true;


        const originalContent =
            generateSummaryBtn.innerHTML;


        generateSummaryBtn.innerHTML = `
            <span class="material-symbols-rounded loading-icon">
                progress_activity
            </span>

            جاري إنشاء الملخص...
        `;


        const params =
            new URLSearchParams({
                fromDate:
                selectedFromDate,

                toDate:
                selectedToDate
            });


        try {

            const response =
                await fetch(
                    `/api/v1/care-summary/generate-on-demand/${caregiverId}?${params.toString()}`,
                    {
                        method: "POST"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            /*
             * Backend saves the summary before
             * attempting to send the email.
             *
             * Therefore a 500 with this exact
             * message still means the summary
             * was generated successfully.
             */
            if (
                response.status === 500 &&
                result.message ===
                "summary generated but email could not be sent"
            ) {

                await loadLatestSummary();


                showMessage(
                    generateMessage,
                    "تم إنشاء الملخص بنجاح، لكن تعذر إرساله إلى البريد الإلكتروني",
                    "warning"
                );


                scrollToLatestSummary();

                return;
            }


            if (!response.ok) {

                showMessage(
                    generateMessage,
                    translateBackendMessage(
                        result.message
                    ),
                    "error"
                );


                return;
            }


            await loadLatestSummary();


            showMessage(
                generateMessage,
                "تم إنشاء الملخص بالذكاء الاصطناعي وإرساله إلى بريدك بنجاح",
                "success"
            );


            scrollToLatestSummary();

        } catch (error) {

            console.error(error);


            showMessage(
                generateMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            generateSummaryBtn.disabled =
                false;


            generateSummaryBtn.innerHTML =
                originalContent;
        }
    }
);


function scrollToLatestSummary() {

    document
        .querySelector(
            ".latest-summary-section"
        )
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}


// ================================
// Send Latest Summary Email
// ================================

sendEmailBtn.addEventListener(
    "click",
    async function () {

        if (!latestSummary) {
            return;
        }


        clearMessage(
            summaryMessage
        );


        sendEmailBtn.disabled =
            true;


        const originalContent =
            sendEmailBtn.innerHTML;


        sendEmailBtn.innerHTML = `
            <span class="material-symbols-rounded loading-icon">
                progress_activity
            </span>

            جاري الإرسال...
        `;


        try {

            const response =
                await fetch(
                    `/api/v1/care-summary/send-latest-summary-email/${caregiverId}`,
                    {
                        method: "POST"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                showMessage(
                    summaryMessage,
                    translateBackendMessage(
                        result.message
                    ),
                    "error"
                );


                return;
            }


            showMessage(
                summaryMessage,
                "تم إرسال آخر ملخص إلى بريدك الإلكتروني بنجاح",
                "success"
            );

        } catch (error) {

            console.error(error);


            showMessage(
                summaryMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            sendEmailBtn.disabled =
                false;


            sendEmailBtn.innerHTML =
                originalContent;
        }
    }
);


// ================================
// Summary Preference
// ================================

async function loadSummaryPreference() {

    preferenceLoading.classList.remove(
        "hidden"
    );

    noPreferenceState.classList.add(
        "hidden"
    );

    preferenceContent.classList.add(
        "hidden"
    );


    try {

        const response =
            await fetch(
                `/api/v1/summary-preference/get-summary-preference/${caregiverId}`
            );


        const result =
            await readResponse(
                response
            );


        preferenceLoading.classList.add(
            "hidden"
        );


        if (!response.ok) {

            summaryPreference = null;


            noPreferenceState.classList.remove(
                "hidden"
            );


            return;
        }


        summaryPreference =
            result.data;


        renderSummaryPreference();

    } catch (error) {

        console.error(error);


        preferenceLoading.classList.add(
            "hidden"
        );


        summaryPreference = null;


        noPreferenceState.classList.remove(
            "hidden"
        );


        showMessage(
            preferenceMessage,
            "تعذر تحميل إعدادات الملخص التلقائي",
            "error"
        );
    }
}


function renderSummaryPreference() {

    if (!summaryPreference) {
        return;
    }


    noPreferenceState.classList.add(
        "hidden"
    );

    preferenceContent.classList.remove(
        "hidden"
    );


    preferenceFrequency.textContent =
        translateFrequency(
            summaryPreference.frequency
        );


    lastGeneratedAt.textContent =
        summaryPreference.lastGeneratedAt
            ? formatDateTime(
                summaryPreference.lastGeneratedAt
            )
            : "لم يتم إنشاء ملخص تلقائي بعد";


    nextGenerationAt.textContent =
        summaryPreference.nextGenerationAt
            ? formatDateTime(
                summaryPreference.nextGenerationAt
            )
            : "غير محدد";


    if (
        summaryPreference.autoGenerate ===
        true
    ) {

        autoStatusText.textContent =
            "مفعّل";


        autoStatusDescription.textContent =
            `سيتم إنشاء الملخص ${translateFrequency(summaryPreference.frequency)} تلقائيًا`;


        toggleText.textContent =
            "إيقاف";


        toggleAutoGenerateBtn.classList.add(
            "active"
        );

    } else {

        autoStatusText.textContent =
            "متوقف";


        autoStatusDescription.textContent =
            "لن يتم إنشاء ملخصات تلقائية حتى يتم تشغيل الميزة";


        toggleText.textContent =
            "تشغيل";


        toggleAutoGenerateBtn.classList.remove(
            "active"
        );
    }
}


// ================================
// Add Preference
// ================================

document.getElementById(
    "setupPreferenceBtn"
).addEventListener(
    "click",
    function () {

        openPreferenceModal(
            false
        );
    }
);


// ================================
// Edit Preference
// ================================

document.getElementById(
    "editPreferenceBtn"
).addEventListener(
    "click",
    function () {

        if (!summaryPreference) {
            return;
        }


        openPreferenceModal(
            true
        );
    }
);


function openPreferenceModal(
    editing
) {

    preferenceForm.reset();


    clearMessage(
        preferenceModalMessage
    );


    if (
        editing &&
        summaryPreference
    ) {

        preferenceModalTitle.textContent =
            "تعديل إعدادات الملخص";


        frequency.value =
            summaryPreference.frequency;


        autoGenerate.checked =
            summaryPreference.autoGenerate ===
            true;

    } else {

        preferenceModalTitle.textContent =
            "إعداد الملخص التلقائي";


        frequency.value =
            "";


        autoGenerate.checked =
            true;
    }


    preferenceModal.classList.remove(
        "hidden"
    );


    frequency.focus();
}


// ================================
// Save Preference
// ================================

preferenceForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        clearMessage(
            preferenceModalMessage
        );


        const body = {

            id:
                summaryPreference?.id ||
                null,

            caregiverId:
            caregiverId,

            frequency:
            frequency.value,

            autoGenerate:
            autoGenerate.checked,

            lastGeneratedAt:
                summaryPreference?.lastGeneratedAt ||
                null,

            nextGenerationAt:
                summaryPreference?.nextGenerationAt ||
                null
        };


        const editing =
            summaryPreference !== null;


        let url =
            "/api/v1/summary-preference/add-summary-preference";


        let method =
            "POST";


        if (editing) {

            url =
                `/api/v1/summary-preference/update-summary-preference/${summaryPreference.id}`;


            method =
                "PUT";
        }


        savePreferenceBtn.disabled =
            true;


        try {

            const response =
                await fetch(
                    url,
                    {
                        method: method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(body)
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                showMessage(
                    preferenceModalMessage,
                    translateBackendMessage(
                        result.message
                    ),
                    "error"
                );


                return;
            }


            closePreferenceModal();


            await loadSummaryPreference();


            showMessage(
                preferenceMessage,
                editing
                    ? "تم تحديث إعدادات الملخص بنجاح"
                    : "تم إعداد الملخص التلقائي بنجاح",
                "success"
            );

        } catch (error) {

            console.error(error);


            showMessage(
                preferenceModalMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            savePreferenceBtn.disabled =
                false;
        }
    }
);


// ================================
// Change Auto Generate
// ================================

toggleAutoGenerateBtn.addEventListener(
    "click",
    async function () {

        if (!summaryPreference) {
            return;
        }


        clearMessage(
            preferenceMessage
        );


        toggleAutoGenerateBtn.disabled =
            true;


        try {

            const response =
                await fetch(
                    `/api/v1/summary-preference/change-auto-generate/${caregiverId}`,
                    {
                        method: "PUT"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                showMessage(
                    preferenceMessage,
                    translateBackendMessage(
                        result.message
                    ),
                    "error"
                );


                return;
            }


            const wasEnabled =
                summaryPreference.autoGenerate ===
                true;


            await loadSummaryPreference();


            showMessage(
                preferenceMessage,
                wasEnabled
                    ? "تم إيقاف إنشاء الملخص التلقائي"
                    : "تم تشغيل إنشاء الملخص التلقائي",
                "success"
            );

        } catch (error) {

            console.error(error);


            showMessage(
                preferenceMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            toggleAutoGenerateBtn.disabled =
                false;
        }
    }
);


// ================================
// Delete Preference
// ================================

document.getElementById(
    "deletePreferenceBtn"
).addEventListener(
    "click",
    async function () {

        if (!summaryPreference) {
            return;
        }


        const confirmed =
            confirm(
                "هل تريدين حذف إعدادات الملخص التلقائي؟ لن يتم حذف الملخص المحفوظ."
            );


        if (!confirmed) {
            return;
        }


        clearMessage(
            preferenceMessage
        );


        try {

            const response =
                await fetch(
                    `/api/v1/summary-preference/delete-summary-preference/${summaryPreference.id}`,
                    {
                        method: "DELETE"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                showMessage(
                    preferenceMessage,
                    translateBackendMessage(
                        result.message
                    ),
                    "error"
                );


                return;
            }


            summaryPreference =
                null;


            preferenceContent.classList.add(
                "hidden"
            );


            noPreferenceState.classList.remove(
                "hidden"
            );


            showMessage(
                preferenceMessage,
                "تم حذف إعدادات الملخص التلقائي",
                "success"
            );

        } catch (error) {

            console.error(error);


            showMessage(
                preferenceMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );
        }
    }
);


// ================================
// Modal
// ================================

document.getElementById(
    "closePreferenceModal"
).addEventListener(
    "click",
    closePreferenceModal
);


document.getElementById(
    "cancelPreferenceBtn"
).addEventListener(
    "click",
    closePreferenceModal
);


preferenceModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            preferenceModal
        ) {

            closePreferenceModal();
        }
    }
);


function closePreferenceModal() {

    preferenceModal.classList.add(
        "hidden"
    );


    preferenceForm.reset();


    clearMessage(
        preferenceModalMessage
    );
}


// ================================
// Dates
// ================================

function setDateLimits() {

    const today =
        getTodayDate();


    fromDate.max =
        today;


    toDate.max =
        today;


    /*
     * Give the user a useful default:
     * today.
     *
     * Backend still validates all dates.
     */
    if (!toDate.value) {

        toDate.value =
            today;
    }


    if (!fromDate.value) {

        fromDate.value =
            today;
    }
}


function getTodayDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


// ================================
// Translation
// ================================

function translateFrequency(value) {

    switch (value) {

        case "daily":
            return "يومي";

        case "weekly":
            return "أسبوعي";

        case "monthly":
            return "شهري";

        default:
            return value || "-";
    }
}


function translateGenerationType(
    value
) {

    switch (value) {

        case "on_demand":
            return "حسب الطلب";

        case "automatic":
            return "تلقائي";

        default:
            return value || "-";
    }
}


function translateBackendMessage(
    message
) {

    switch (message) {

        case "caregiver not found":
            return "لم يتم العثور على مقدم الرعاية";

        case "patient not found":
            return "لم يتم العثور على المريض";

        case "caregiver is not assigned to a patient":
            return "حساب مقدم الرعاية غير مرتبط بمريض";

        case "from date and to date cannot be null":
            return "يجب تحديد تاريخ البداية والنهاية";

        case "from date cannot be after to date":
            return "تاريخ البداية لا يمكن أن يكون بعد تاريخ النهاية";

        case "to date cannot be in the future":
            return "تاريخ النهاية لا يمكن أن يكون في المستقبل";

        case "AI service is temporarily unavailable":
            return "خدمة الذكاء الاصطناعي غير متاحة مؤقتًا، حاولي مرة أخرى لاحقًا";

        case "summary generated but email could not be sent":
            return "تم إنشاء الملخص ولكن تعذر إرساله إلى البريد";

        case "care summary not found":
            return "لا يوجد ملخص محفوظ";

        case "email could not be sent":
            return "تعذر إرسال الملخص إلى البريد الإلكتروني";

        case "summary preference not found":
            return "لم يتم العثور على إعدادات الملخص";

        case "summary preference already exists, you can update it":
            return "إعدادات الملخص موجودة مسبقًا ويمكن تعديلها";

        case "caregiver id cannot be changed":
            return "لا يمكن تغيير مقدم الرعاية المرتبط بهذه الإعدادات";

        default:
            return message ||
                "حدث خطأ أثناء تنفيذ العملية";
    }
}


// ================================
// Formatting
// ================================

function formatDate(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;
    }


    return date.toLocaleDateString(
        "ar-SA",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


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


// ================================
// Messages
// ================================

function showMessage(
    element,
    message,
    type
) {

    element.textContent =
        message || "";


    element.className =
        `form-message ${type}`;
}


function clearMessage(element) {

    element.textContent =
        "";


    if (
        element ===
        preferenceModalMessage
    ) {

        element.className =
            "modal-message";

    } else {

        element.className =
            "form-message";
    }
}
function formatSummary(summary) {

    if (!summary) {
        return "";
    }

    // Escape HTML first
    let safeText = summary
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const lines = safeText.split(/\r?\n/);

    let html = "";
    let listOpen = false;

    for (const rawLine of lines) {

        const line = rawLine.trim();

        if (!line) {

            if (listOpen) {
                html += "</ul>";
                listOpen = false;
            }

            continue;
        }

        // ### Heading
        if (line.startsWith("### ")) {

            if (listOpen) {
                html += "</ul>";
                listOpen = false;
            }

            html += `<h4>${formatInlineMarkdown(line.substring(4))}</h4>`;
            continue;
        }

        // ## Heading
        if (line.startsWith("## ")) {

            if (listOpen) {
                html += "</ul>";
                listOpen = false;
            }

            html += `<h3>${formatInlineMarkdown(line.substring(3))}</h3>`;
            continue;
        }

        // # Heading
        if (line.startsWith("# ")) {

            if (listOpen) {
                html += "</ul>";
                listOpen = false;
            }

            html += `<h2>${formatInlineMarkdown(line.substring(2))}</h2>`;
            continue;
        }

        // Bullet
        if (
            line.startsWith("- ") ||
            line.startsWith("* ")
        ) {

            if (!listOpen) {
                html += "<ul>";
                listOpen = true;
            }

            html += `<li>${formatInlineMarkdown(line.substring(2))}</li>`;
            continue;
        }

        if (listOpen) {
            html += "</ul>";
            listOpen = false;
        }

        html += `<p>${formatInlineMarkdown(line)}</p>`;
    }

    if (listOpen) {
        html += "</ul>";
    }

    return html;
}


function formatInlineMarkdown(text) {

    return text.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );
}