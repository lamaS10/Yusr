const patientId =
    Number(sessionStorage.getItem("patientId"));

const caregiverId =
    Number(sessionStorage.getItem("caregiverId"));

let incidents = [];

let editingIncidentId = null;
let resolvingIncidentId = null;


// =========================
// Elements
// =========================

const incidentsList =
    document.getElementById("incidentsList");

const emptyIncidents =
    document.getElementById("emptyIncidents");

const incidentFilter =
    document.getElementById("incidentFilter");

const pageMessage =
    document.getElementById("pageMessage");


// Incident Modal

const incidentModal =
    document.getElementById("incidentModal");

const incidentForm =
    document.getElementById("incidentForm");

const incidentModalTitle =
    document.getElementById("incidentModalTitle");

const incidentModalDescription =
    document.getElementById("incidentModalDescription");

const incidentType =
    document.getElementById("incidentType");

const severity =
    document.getElementById("severity");

const incidentDescription =
    document.getElementById("incidentDescription");

const actionTaken =
    document.getElementById("actionTaken");

const incidentAt =
    document.getElementById("incidentAt");

const incidentTimeGroup =
    document.getElementById("incidentTimeGroup");

const incidentFormMessage =
    document.getElementById("incidentFormMessage");

const saveIncidentBtn =
    document.getElementById("saveIncidentBtn");


// Resolve Modal

const resolveModal =
    document.getElementById("resolveModal");

const resolveForm =
    document.getElementById("resolveForm");

const resolvedAt =
    document.getElementById("resolvedAt");

const resolveMessage =
    document.getElementById("resolveMessage");

const confirmResolveBtn =
    document.getElementById("confirmResolveBtn");


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

    setMaximumDates();

    await loadPatientIncidents();
}


// =========================
// Response
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
// Load Patient Incidents
// =========================

async function loadPatientIncidents() {

    try {

        const response = await fetch(
            `/api/v1/incident/get-patient-incidents/${patientId}`
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر تحميل الحوادث",
                "error"
            );

            return;
        }


        incidents =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderSummary();

        renderIncidents();


    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// =========================
// Summary
// =========================

function renderSummary() {

    document.getElementById(
        "totalIncidents"
    ).textContent =
        incidents.length;


    document.getElementById(
        "openIncidents"
    ).textContent =
        incidents.filter(
            incident =>
                incident.status === "open"
        ).length;


    document.getElementById(
        "monitoringIncidents"
    ).textContent =
        incidents.filter(
            incident =>
                incident.status === "monitoring"
        ).length;


    document.getElementById(
        "resolvedIncidents"
    ).textContent =
        incidents.filter(
            incident =>
                incident.status === "resolved"
        ).length;
}


// =========================
// Filter
// =========================

incidentFilter.addEventListener(
    "change",
    renderIncidents
);


// =========================
// Render Incidents
// =========================

function renderIncidents() {

    incidentsList.innerHTML = "";


    let displayed =
        [...incidents];


    if (
        incidentFilter.value !== "all"
    ) {

        displayed =
            displayed.filter(
                incident =>
                    incident.status ===
                    incidentFilter.value
            );
    }


    displayed.sort(
        (a, b) =>
            new Date(b.incidentAt) -
            new Date(a.incidentAt)
    );


    if (displayed.length === 0) {

        emptyIncidents.classList.remove(
            "hidden"
        );

        return;
    }


    emptyIncidents.classList.add(
        "hidden"
    );


    displayed.forEach(incident => {

        incidentsList.appendChild(
            createIncidentCard(incident)
        );
    });


    bindIncidentButtons();
}


// =========================
// Card
// =========================

function createIncidentCard(incident) {

    const card =
        document.createElement("article");


    card.className =
        "incident-card";


    card.innerHTML = `

        <div class="incident-card-top">

            <div class="incident-title-area">

                <div class="incident-icon">

                    <span class="material-symbols-rounded">
                        ${getIncidentIcon(incident.incidentType)}
                    </span>

                </div>


                <div class="incident-title">

                    <h3>
                        ${translateIncidentType(incident.incidentType)}
                    </h3>


                    <div class="badges">

                        <span class="badge ${getSeverityClass(incident.severity)}">
                            ${translateSeverity(incident.severity)}
                        </span>

                        <span class="badge ${getStatusClass(incident.status)}">
                            ${translateStatus(incident.status)}
                        </span>

                    </div>

                </div>

            </div>

        </div>


        <p class="incident-description">
            ${escapeHtml(incident.description)}
        </p>


        ${
        incident.actionTaken
            ? `
                    <div class="action-taken">

                        <strong>
                            الإجراء المتخذ:
                        </strong>

                        ${escapeHtml(incident.actionTaken)}

                    </div>
                  `
            : ""
    }


        <div class="incident-meta">

            <span class="meta-item">

                <span class="material-symbols-rounded">
                    emergency
                </span>

                وقت الحادث:
                ${formatDateTime(incident.incidentAt)}

            </span>


            <span class="meta-item">

                <span class="material-symbols-rounded">
                    edit_calendar
                </span>

                سُجل:
                ${formatDateTime(incident.recordedAt)}

            </span>


            ${
        incident.resolvedAt
            ? `
                        <span class="meta-item">

                            <span class="material-symbols-rounded">
                                task_alt
                            </span>

                            تم الحل:
                            ${formatDateTime(incident.resolvedAt)}

                        </span>
                      `
            : ""
    }

        </div>


        <div class="incident-actions">

            ${
        incident.status !== "resolved"
            ? `
                        <button type="button"
                                class="action-btn edit-incident-btn"
                                data-id="${incident.id}">

                            <span class="material-symbols-rounded">
                                edit
                            </span>

                            تعديل

                        </button>
                      `
            : ""
    }


            ${
        incident.status === "open"
            ? `
                        <button type="button"
                                class="action-btn monitoring-btn"
                                data-id="${incident.id}">

                            <span class="material-symbols-rounded">
                                visibility
                            </span>

                            بدء المراقبة

                        </button>
                      `
            : ""
    }


            ${
        incident.status !== "resolved"
            ? `
                        <button type="button"
                                class="action-btn primary-action resolve-btn"
                                data-id="${incident.id}">

                            <span class="material-symbols-rounded">
                                check_circle
                            </span>

                            حل الحادث

                        </button>
                      `
            : ""
    }


            <button type="button"
                    class="action-btn danger delete-incident-btn"
                    data-id="${incident.id}">

                <span class="material-symbols-rounded">
                    delete
                </span>

                حذف

            </button>

        </div>
    `;


    return card;
}


// =========================
// Add Incident
// =========================

document.getElementById(
    "addIncidentBtn"
).addEventListener(
    "click",
    function () {

        editingIncidentId = null;


        incidentForm.reset();


        incidentModalTitle.textContent =
            "تسجيل حادث";


        incidentModalDescription.textContent =
            "أدخلي تفاصيل الحادث الذي حدث للمريض";


        /*
         * incidentAt can only be supplied
         * when creating the incident.
         *
         * updateIncident() does not update it.
         */
        incidentTimeGroup.classList.remove(
            "hidden"
        );


        clearIncidentFormMessage();

        setMaximumDates();


        incidentModal.classList.remove(
            "hidden"
        );
    }
);


// =========================
// Edit
// =========================

function openEditIncident(id) {

    const incident =
        incidents.find(
            item =>
                Number(item.id) === id
        );


    if (!incident) {
        return;
    }


    editingIncidentId = id;


    incidentForm.reset();


    incidentModalTitle.textContent =
        "تعديل الحادث";


    incidentModalDescription.textContent =
        "تعديل تفاصيل الحادث المسجل";


    incidentType.value =
        incident.incidentType;


    severity.value =
        incident.severity;


    incidentDescription.value =
        incident.description;


    actionTaken.value =
        incident.actionTaken || "";


    /*
     * Service does not update incidentAt,
     * so don't show an editable field.
     */
    incidentTimeGroup.classList.add(
        "hidden"
    );


    clearIncidentFormMessage();


    incidentModal.classList.remove(
        "hidden"
    );
}


// =========================
// Save Add / Update
// =========================

incidentForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const oldIncident =
            editingIncidentId
                ? incidents.find(
                    item =>
                        Number(item.id) ===
                        editingIncidentId
                )
                : null;


        const incident = {

            patientId:
            patientId,

            incidentType:
            incidentType.value,

            description:
                incidentDescription.value.trim(),

            severity:
            severity.value,

            actionTaken:
                actionTaken.value.trim() || null,

            /*
             * Creation:
             * null means backend uses now.
             *
             * Update:
             * preserve original value even though
             * service does not change it.
             */
            incidentAt:
                editingIncidentId
                    ? oldIncident?.incidentAt
                    : (
                        incidentAt.value
                            ? normalizeDateTime(
                                incidentAt.value
                            )
                            : null
                    ),

            recordedAt:
                oldIncident?.recordedAt || null,

            status:
                oldIncident?.status || null,

            resolvedAt:
                oldIncident?.resolvedAt || null
        };


        let url =
            "/api/v1/incident/add-incident";

        let method =
            "POST";


        if (editingIncidentId) {

            url =
                `/api/v1/incident/update-incident/${editingIncidentId}`;

            method =
                "PUT";
        }


        saveIncidentBtn.disabled = true;


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
                        JSON.stringify(incident)
                }
            );


            const result =
                await readResponse(response);


            if (!response.ok) {

                showIncidentFormMessage(
                    result.message ||
                    "تعذر حفظ الحادث",
                    "error"
                );

                return;
            }


            const wasEditing =
                editingIncidentId !== null;


            closeIncidentModal();


            showPageMessage(
                wasEditing
                    ? "تم تحديث الحادث بنجاح"
                    : getIncidentSuccessMessage(
                        incident.severity
                    ),
                "success"
            );


            await loadPatientIncidents();


        } catch (error) {

            console.error(error);


            showIncidentFormMessage(
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            saveIncidentBtn.disabled = false;
        }
    }
);


// =========================
// Monitoring
// =========================

async function startMonitoring(id) {

    try {

        const response = await fetch(
            `/api/v1/incident/start-monitoring-incident/${id}`,
            {
                method: "PUT"
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر بدء مراقبة الحادث",
                "error"
            );

            return;
        }


        showPageMessage(
            "تم وضع الحادث تحت المراقبة",
            "success"
        );


        await loadPatientIncidents();


    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// =========================
// Resolve
// =========================

function openResolveIncident(id) {

    const incident =
        incidents.find(
            item =>
                Number(item.id) === id
        );


    if (!incident) {
        return;
    }


    resolvingIncidentId = id;


    resolveForm.reset();


    resolvedAt.min =
        toDateTimeLocal(
            incident.incidentAt
        );


    setMaximumDates();


    clearResolveMessage();


    resolveModal.classList.remove(
        "hidden"
    );
}


resolveForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!resolvingIncidentId) {
            return;
        }


        let url =
            `/api/v1/incident/resolve-incident/${resolvingIncidentId}`;


        if (resolvedAt.value) {

            url +=
                `?resolvedAt=${encodeURIComponent(
                    normalizeDateTime(
                        resolvedAt.value
                    )
                )}`;
        }


        confirmResolveBtn.disabled = true;


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

                showResolveMessage(
                    result.message ||
                    "تعذر حل الحادث",
                    "error"
                );

                return;
            }


            const incident =
                incidents.find(
                    item =>
                        Number(item.id) ===
                        resolvingIncidentId
                );


            closeResolveModal();


            if (
                incident &&
                (
                    incident.severity === "high" ||
                    incident.severity === "critical"
                )
            ) {

                showPageMessage(
                    "تم حل الحادث بنجاح، وسيقوم النظام بإرسال تحديث لمقدمي الرعاية",
                    "success"
                );

            } else {

                showPageMessage(
                    "تم حل الحادث بنجاح",
                    "success"
                );
            }


            await loadPatientIncidents();


        } catch (error) {

            console.error(error);


            showResolveMessage(
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            confirmResolveBtn.disabled = false;
        }
    }
);


// =========================
// Delete
// =========================

async function deleteIncident(id) {

    const incident =
        incidents.find(
            item =>
                Number(item.id) === id
        );


    if (!incident) {
        return;
    }


    const confirmed =
        confirm(
            `هل تريدين حذف حادث ${translateIncidentType(incident.incidentType)}؟`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/api/v1/incident/delete-incident/${id}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر حذف الحادث",
                "error"
            );

            return;
        }


        showPageMessage(
            "تم حذف الحادث بنجاح",
            "success"
        );


        await loadPatientIncidents();


    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// =========================
// Button Events
// =========================

function bindIncidentButtons() {

    document
        .querySelectorAll(
            ".edit-incident-btn"
        )
        .forEach(button => {

            button.onclick = () =>
                openEditIncident(
                    Number(
                        button.dataset.id
                    )
                );
        });


    document
        .querySelectorAll(
            ".monitoring-btn"
        )
        .forEach(button => {

            button.onclick = () =>
                startMonitoring(
                    Number(
                        button.dataset.id
                    )
                );
        });


    document
        .querySelectorAll(
            ".resolve-btn"
        )
        .forEach(button => {

            button.onclick = () =>
                openResolveIncident(
                    Number(
                        button.dataset.id
                    )
                );
        });


    document
        .querySelectorAll(
            ".delete-incident-btn"
        )
        .forEach(button => {

            button.onclick = () =>
                deleteIncident(
                    Number(
                        button.dataset.id
                    )
                );
        });
}


// =========================
// Modal Events
// =========================

document.getElementById(
    "closeIncidentModal"
).onclick =
    closeIncidentModal;


document.getElementById(
    "cancelIncidentBtn"
).onclick =
    closeIncidentModal;


document.getElementById(
    "closeResolveModal"
).onclick =
    closeResolveModal;


document.getElementById(
    "cancelResolveBtn"
).onclick =
    closeResolveModal;


incidentModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === incidentModal
        ) {

            closeIncidentModal();
        }
    }
);


resolveModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === resolveModal
        ) {

            closeResolveModal();
        }
    }
);


function closeIncidentModal() {

    incidentModal.classList.add(
        "hidden"
    );


    incidentForm.reset();


    editingIncidentId = null;


    incidentTimeGroup.classList.remove(
        "hidden"
    );


    clearIncidentFormMessage();
}


function closeResolveModal() {

    resolveModal.classList.add(
        "hidden"
    );


    resolveForm.reset();


    resolvingIncidentId = null;


    clearResolveMessage();
}


// =========================
// Business UI Message
// =========================

function getIncidentSuccessMessage(
    incidentSeverity
) {

    if (
        incidentSeverity === "high" ||
        incidentSeverity === "critical"
    ) {

        return "تم تسجيل الحادث بنجاح، وسيقوم النظام بإرسال تنبيه لمقدمي الرعاية";
    }


    return "تم تسجيل الحادث بنجاح";
}


// =========================
// Translation
// =========================

function translateIncidentType(type) {

    const values = {
        fall:
            "سقوط",

        medication_error:
            "خطأ دوائي",

        health_change:
            "تغير في الحالة الصحية",

        injury:
            "إصابة",

        other:
            "أخرى"
    };


    return values[type] || type;
}


function translateSeverity(value) {

    const values = {
        low:
            "خطورة منخفضة",

        medium:
            "خطورة متوسطة",

        high:
            "خطورة عالية",

        critical:
            "حالة حرجة"
    };


    return values[value] || value;
}


function translateStatus(value) {

    const values = {
        open:
            "مفتوح",

        monitoring:
            "تحت المراقبة",

        resolved:
            "تم الحل"
    };


    return values[value] || value;
}


function getStatusClass(status) {

    return `status-${status}`;
}


function getSeverityClass(value) {

    return `severity-${value}`;
}


function getIncidentIcon(type) {

    const icons = {
        fall:
            "personal_injury",

        medication_error:
            "medication",

        health_change:
            "monitor_heart",

        injury:
            "healing",

        other:
            "warning"
    };


    return icons[type] || "warning";
}


// =========================
// Dates
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


function normalizeDateTime(value) {

    if (!value) {
        return null;
    }


    return value.length === 16
        ? `${value}:00`
        : value;
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


function setMaximumDates() {

    const now =
        getDateTimeLocalNow();


    incidentAt.max =
        now;


    resolvedAt.max =
        now;
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


function pad(value) {

    return String(value)
        .padStart(2, "0");
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
        `page-message ${type}`;
}


function showIncidentFormMessage(
    message,
    type
) {

    incidentFormMessage.textContent =
        message || "";


    incidentFormMessage.className =
        `modal-message ${type}`;
}


function clearIncidentFormMessage() {

    incidentFormMessage.textContent = "";


    incidentFormMessage.className =
        "modal-message";
}


function showResolveMessage(
    message,
    type
) {

    resolveMessage.textContent =
        message || "";


    resolveMessage.className =
        `modal-message ${type}`;
}


function clearResolveMessage() {

    resolveMessage.textContent = "";


    resolveMessage.className =
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