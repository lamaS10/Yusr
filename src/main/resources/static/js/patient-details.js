const caregiverId = sessionStorage.getItem("caregiverId");
const patientId = sessionStorage.getItem("patientId");


// Patient
const patientForm =
    document.getElementById("patientDetailsForm");

const editPatientBtn =
    document.getElementById("editPatientBtn");

const cancelPatientBtn =
    document.getElementById("cancelPatientBtn");

const patientEditActions =
    document.getElementById("patientEditActions");

const patientMessage =
    document.getElementById("patientMessage");


// Chronic Conditions
const conditionsList =
    document.getElementById("conditionsList");

const emptyConditions =
    document.getElementById("emptyConditions");

const conditionMessage =
    document.getElementById("conditionMessage");

const addConditionBtn =
    document.getElementById("addConditionBtn");

const conditionModal =
    document.getElementById("conditionModal");

const conditionForm =
    document.getElementById("conditionForm");

const conditionModalTitle =
    document.getElementById("conditionModalTitle");

const conditionFormMessage =
    document.getElementById("conditionFormMessage");

const closeConditionModal =
    document.getElementById("closeConditionModal");

const cancelConditionBtn =
    document.getElementById("cancelConditionBtn");


let originalPatient = null;

let patientConditions = [];

let editingConditionId = null;


const patientFields = [
    "fullName",
    "dateOfBirth",
    "gender",
    "bloodType",
    "emergencyContactName",
    "emergencyContactPhone",
    "allergies",
    "medicalNotes"
];


// ================================
// Protection
// ================================

if (!caregiverId) {
    window.location.href = "/login";
}

if (!patientId) {
    window.location.href = "/dashboard";
}


// ================================
// Initial Load
// ================================

loadPatient();
loadChronicConditions();


// ================================
// PATIENT
// ================================

async function loadPatient() {

    try {

        const response = await fetch(
            `/api/v1/patient/get-patient/${patientId}`
        );

        const result = await readResponse(response);


        if (!response.ok) {
            showMessage(
                patientMessage,
                result.message,
                "error"
            );

            return;
        }


        originalPatient = result.data;

        fillPatient(originalPatient);


    } catch (error) {

        showMessage(
            patientMessage,
            "حدث خطأ في الاتصال، حاول مرة أخرى",
            "error"
        );

        console.error(error);
    }
}


function fillPatient(patient) {

    document.getElementById("headerPatientName").textContent =
        patient.fullName || "-";

    document.getElementById("patientCode").textContent =
        patient.patientCode || "-";

    document.getElementById("patientStatus").textContent =
        patient.status === "active"
            ? "نشط"
            : "غير نشط";


    document.getElementById("fullName").value =
        patient.fullName || "";

    document.getElementById("dateOfBirth").value =
        patient.dateOfBirth || "";

    document.getElementById("gender").value =
        patient.gender || "";

    document.getElementById("bloodType").value =
        patient.bloodType || "";

    document.getElementById("emergencyContactName").value =
        patient.emergencyContactName || "";

    document.getElementById("emergencyContactPhone").value =
        patient.emergencyContactPhone || "";

    document.getElementById("allergies").value =
        patient.allergies || "";

    document.getElementById("medicalNotes").value =
        patient.medicalNotes || "";
}


editPatientBtn.addEventListener("click", function () {

    setPatientEditMode(true);

    clearMessage(patientMessage);
});


cancelPatientBtn.addEventListener("click", function () {

    fillPatient(originalPatient);

    setPatientEditMode(false);

    clearMessage(patientMessage);
});


patientForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const patient = {

        fullName:
            document.getElementById("fullName").value.trim(),

        dateOfBirth:
        document.getElementById("dateOfBirth").value,

        gender:
        document.getElementById("gender").value,

        bloodType:
        document.getElementById("bloodType").value,

        emergencyContactName:
            document.getElementById("emergencyContactName").value.trim(),

        emergencyContactPhone:
            document.getElementById("emergencyContactPhone").value.trim(),

        allergies:
            document.getElementById("allergies").value.trim(),

        medicalNotes:
            document.getElementById("medicalNotes").value.trim()
    };


    try {

        const response = await fetch(
            `/api/v1/patient/update-patient/${patientId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(patient)
            }
        );


        const result = await readResponse(response);


        if (!response.ok) {

            showMessage(
                patientMessage,
                result.message,
                "error"
            );

            return;
        }


        originalPatient = {
            ...originalPatient,
            ...patient
        };


        fillPatient(originalPatient);

        setPatientEditMode(false);


        showMessage(
            patientMessage,
            result.message ||
            "تم تحديث بيانات المريض بنجاح",
            "success"
        );


    } catch (error) {

        showMessage(
            patientMessage,
            "حدث خطأ في الاتصال، حاول مرة أخرى",
            "error"
        );

        console.error(error);
    }
});


function setPatientEditMode(editing) {

    patientFields.forEach(function (field) {

        document.getElementById(field).disabled =
            !editing;

    });


    if (editing) {

        editPatientBtn.classList.add("hidden");

        patientEditActions.classList.remove("hidden");

    } else {

        editPatientBtn.classList.remove("hidden");

        patientEditActions.classList.add("hidden");
    }
}


// ================================
// CHRONIC CONDITIONS
// ================================

async function loadChronicConditions() {

    try {

        const response = await fetch(
            "/api/v1/chronic-condition/get-chronic-conditions"
        );


        const result = await readResponse(response);


        if (!response.ok) {

            showMessage(
                conditionMessage,
                result.message,
                "error"
            );

            return;
        }


        const allConditions =
            Array.isArray(result.data)
                ? result.data
                : [];


        // Backend currently returns all chronic conditions,
        // so filter the current patient's conditions here.
        patientConditions =
            allConditions.filter(function (condition) {

                return Number(condition.patientId) ===
                    Number(patientId);
            });


        renderConditions();


    } catch (error) {

        showMessage(
            conditionMessage,
            "حدث خطأ أثناء تحميل الحالات المزمنة",
            "error"
        );

        console.error(error);
    }
}


function renderConditions() {

    conditionsList.innerHTML = "";


    if (patientConditions.length === 0) {

        emptyConditions.classList.remove("hidden");

        return;
    }


    emptyConditions.classList.add("hidden");


    patientConditions.forEach(function (condition) {

        const card =
            document.createElement("div");

        card.className = "condition-card";


        const main =
            document.createElement("div");

        main.className = "condition-main";


        const title =
            document.createElement("h3");

        title.textContent =
            condition.conditionName;


        const date =
            document.createElement("p");

        date.className = "condition-date";

        date.textContent =
            condition.diagnosisDate
                ? `تاريخ التشخيص: ${condition.diagnosisDate}`
                : "تاريخ التشخيص غير محدد";


        const notes =
            document.createElement("p");

        notes.className = "condition-notes";

        notes.textContent =
            condition.notes ||
            "لا توجد ملاحظات";


        main.appendChild(title);
        main.appendChild(date);
        main.appendChild(notes);


        const actions =
            document.createElement("div");

        actions.className = "condition-actions";


        const editButton =
            document.createElement("button");

        editButton.type = "button";

        editButton.className =
            "small-btn edit-condition-btn";

        editButton.textContent = "تعديل";

        editButton.addEventListener(
            "click",
            function () {

                openEditCondition(condition.id);
            }
        );


        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className =
            "small-btn delete-condition-btn";

        deleteButton.textContent = "حذف";

        deleteButton.addEventListener(
            "click",
            function () {

                deleteCondition(condition.id);
            }
        );


        actions.appendChild(editButton);
        actions.appendChild(deleteButton);


        card.appendChild(main);
        card.appendChild(actions);


        conditionsList.appendChild(card);
    });
}


// ================================
// ADD CONDITION
// ================================

addConditionBtn.addEventListener(
    "click",
    function () {

        editingConditionId = null;

        conditionModalTitle.textContent =
            "إضافة حالة مزمنة";

        conditionForm.reset();

        clearMessage(conditionFormMessage);

        conditionModal.classList.remove("hidden");
    }
);


// ================================
// EDIT CONDITION
// ================================

function openEditCondition(id) {

    const condition =
        patientConditions.find(function (item) {

            return item.id === id;
        });


    if (!condition) {
        return;
    }


    editingConditionId = id;


    conditionModalTitle.textContent =
        "تعديل الحالة المزمنة";


    document.getElementById("conditionName").value =
        condition.conditionName || "";

    document.getElementById("diagnosisDate").value =
        condition.diagnosisDate || "";

    document.getElementById("conditionNotes").value =
        condition.notes || "";


    clearMessage(conditionFormMessage);

    conditionModal.classList.remove("hidden");
}


// ================================
// CONDITION SUBMIT
// ================================

conditionForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const chronicCondition = {

            patientId: Number(patientId),

            conditionName:
                document
                    .getElementById("conditionName")
                    .value
                    .trim(),

            diagnosisDate:
                document
                    .getElementById("diagnosisDate")
                    .value || null,

            notes:
                document
                    .getElementById("conditionNotes")
                    .value
                    .trim()
        };


        if (editingConditionId === null) {

            await addCondition(chronicCondition);

        } else {

            await updateCondition(
                editingConditionId,
                chronicCondition
            );
        }
    }
);


async function addCondition(chronicCondition) {

    try {

        const response = await fetch(
            "/api/v1/chronic-condition/add-chronic-condition",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body:
                    JSON.stringify(chronicCondition)
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showMessage(
                conditionFormMessage,
                result.message,
                "error"
            );

            return;
        }


        closeModal();

        showMessage(
            conditionMessage,
            result.message ||
            "تمت إضافة الحالة المزمنة بنجاح",
            "success"
        );


        await loadChronicConditions();


    } catch (error) {

        showMessage(
            conditionFormMessage,
            "حدث خطأ في الاتصال، حاول مرة أخرى",
            "error"
        );

        console.error(error);
    }
}


async function updateCondition(
    id,
    chronicCondition
) {

    try {

        const response = await fetch(
            `/api/v1/chronic-condition/update-chronic-condition/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body:
                    JSON.stringify(chronicCondition)
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showMessage(
                conditionFormMessage,
                result.message,
                "error"
            );

            return;
        }


        closeModal();

        showMessage(
            conditionMessage,
            result.message ||
            "تم تحديث الحالة المزمنة بنجاح",
            "success"
        );


        await loadChronicConditions();


    } catch (error) {

        showMessage(
            conditionFormMessage,
            "حدث خطأ في الاتصال، حاول مرة أخرى",
            "error"
        );

        console.error(error);
    }
}


// ================================
// DELETE CONDITION
// ================================

async function deleteCondition(id) {

    const confirmed =
        confirm("هل أنت متأكد من حذف الحالة المزمنة؟");


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/api/v1/chronic-condition/delete-chronic-condition/${id}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showMessage(
                conditionMessage,
                result.message,
                "error"
            );

            return;
        }


        showMessage(
            conditionMessage,
            result.message ||
            "تم حذف الحالة المزمنة بنجاح",
            "success"
        );


        await loadChronicConditions();


    } catch (error) {

        showMessage(
            conditionMessage,
            "حدث خطأ في الاتصال، حاول مرة أخرى",
            "error"
        );

        console.error(error);
    }
}


// ================================
// MODAL
// ================================

closeConditionModal.addEventListener(
    "click",
    closeModal
);


cancelConditionBtn.addEventListener(
    "click",
    closeModal
);


conditionModal.addEventListener(
    "click",
    function (event) {

        if (event.target === conditionModal) {
            closeModal();
        }
    }
);


function closeModal() {

    conditionModal.classList.add("hidden");

    conditionForm.reset();

    editingConditionId = null;

    clearMessage(conditionFormMessage);
}


// ================================
// HELPERS
// ================================

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
            message:
                data &&
                typeof data === "object" &&
                !Array.isArray(data) &&
                data.message
                    ? data.message
                    : text
        };


    } catch (error) {

        return {
            data: null,
            message: text
        };
    }
}


function showMessage(
    element,
    message,
    type
) {

    element.textContent = message || "";

    element.className =
        `form-message ${type}`;
}


function clearMessage(element) {

    element.textContent = "";

    element.className = "form-message";
}