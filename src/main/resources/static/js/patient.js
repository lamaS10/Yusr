const caregiverId = sessionStorage.getItem("caregiverId");

const patientForm =
    document.getElementById("patientForm");

const patientMessage =
    document.getElementById("patientMessage");

const patientStep =
    document.getElementById("patientStep");

const chronicQuestionStep =
    document.getElementById("chronicQuestionStep");

const chronicFormStep =
    document.getElementById("chronicFormStep");

const conditionSuccessStep =
    document.getElementById("conditionSuccessStep");

const yesConditionBtn =
    document.getElementById("yesConditionBtn");

const skipConditionBtn =
    document.getElementById("skipConditionBtn");

const chronicConditionForm =
    document.getElementById("chronicConditionForm");

const conditionMessage =
    document.getElementById("conditionMessage");

const addAnotherConditionBtn =
    document.getElementById("addAnotherConditionBtn");

const finishPatientBtn =
    document.getElementById("finishPatientBtn");


let patientId =
    sessionStorage.getItem("patientId");


// إذا ما فيه مستخدم مسجل دخول
if (!caregiverId) {
    window.location.href = "/login";
}


// =========================
// Add Patient
// =========================

patientForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        patientMessage.textContent = "";
        patientMessage.className = "form-message";


        const patient = {

            fullName:
                document
                    .getElementById("fullName")
                    .value
                    .trim(),

            dateOfBirth:
            document
                .getElementById("dateOfBirth")
                .value,

            gender:
            document
                .getElementById("gender")
                .value,

            bloodType:
            document
                .getElementById("bloodType")
                .value,

            emergencyContactName:
                document
                    .getElementById("emergencyContactName")
                    .value
                    .trim(),

            emergencyContactPhone:
                document
                    .getElementById("emergencyContactPhone")
                    .value
                    .trim(),

            allergies:
                document
                    .getElementById("allergies")
                    .value
                    .trim(),

            medicalNotes:
                document
                    .getElementById("medicalNotes")
                    .value
                    .trim()
        };


        try {

            // إضافة المريض وربطه بمقدم الرعاية
            const response = await fetch(
                `/api/v1/patient/add-patient-by-caregiver/${caregiverId}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(patient)
                }
            );


            const result =
                await readResponse(response);


            if (!response.ok) {

                showMessage(
                    patientMessage,
                    result.message,
                    "error"
                );

                return;
            }


            showMessage(
                patientMessage,
                result.message ||
                "تمت إضافة المريض بنجاح",
                "success"
            );


            // نجيب بيانات مقدم الرعاية
            // بعد ربطه بالمريض للحصول على patientId
            const caregiverResponse = await fetch(
                `/api/v1/caregiver/get-caregiver/${caregiverId}`
            );


            const caregiverResult =
                await readResponse(caregiverResponse);


            if (!caregiverResponse.ok) {

                showMessage(
                    patientMessage,
                    caregiverResult.message,
                    "error"
                );

                return;
            }


            const updatedCaregiver =
                caregiverResult.data;


            if (
                !updatedCaregiver ||
                !updatedCaregiver.patientId
            ) {

                showMessage(
                    patientMessage,
                    "تمت إضافة المريض ولكن تعذر جلب رقم المريض",
                    "error"
                );

                return;
            }


            // تحديث بيانات الـSession
            patientId =
                updatedCaregiver.patientId;


            sessionStorage.setItem(
                "patientId",
                patientId
            );


            sessionStorage.setItem(
                "caregiverRole",
                updatedCaregiver.role
            );


            // الانتقال للخطوة الثانية
            setTimeout(function () {

                showStep(
                    chronicQuestionStep
                );

            }, 500);

        } catch (error) {

            showMessage(
                patientMessage,
                "حدث خطأ في الاتصال، حاول مرة أخرى",
                "error"
            );

            console.error(error);
        }
    }
);


// =========================
// Chronic Condition Question
// =========================

yesConditionBtn.addEventListener(
    "click",
    function () {

        showStep(
            chronicFormStep
        );
    }
);


skipConditionBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "/dashboard";
    }
);


// =========================
// Add Chronic Condition
// =========================

chronicConditionForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        conditionMessage.textContent = "";
        conditionMessage.className =
            "form-message";


        if (!patientId) {

            showMessage(
                conditionMessage,
                "لم يتم العثور على المريض",
                "error"
            );

            return;
        }


        const condition = {

            patientId:
                Number(patientId),

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


        try {

            const response = await fetch(
                "/api/v1/chronic-condition/add-chronic-condition",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body:
                        JSON.stringify(condition)
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


            chronicConditionForm.reset();


            showStep(
                conditionSuccessStep
            );

        } catch (error) {

            showMessage(
                conditionMessage,
                "حدث خطأ في الاتصال، حاول مرة أخرى",
                "error"
            );

            console.error(error);
        }
    }
);


// =========================
// Add Another Condition
// =========================

addAnotherConditionBtn.addEventListener(
    "click",
    function () {

        chronicConditionForm.reset();

        conditionMessage.textContent = "";
        conditionMessage.className =
            "form-message";

        showStep(
            chronicFormStep
        );
    }
);


// =========================
// Finish
// =========================

finishPatientBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "/dashboard";
    }
);


// =========================
// Helpers
// =========================

function showStep(step) {

    patientStep.classList.add("hidden");

    chronicQuestionStep
        .classList.add("hidden");

    chronicFormStep
        .classList.add("hidden");

    conditionSuccessStep
        .classList.add("hidden");


    step.classList.remove("hidden");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


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
                data.message || ""
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

    element.textContent =
        message || "حدث خطأ غير متوقع";

    element.className =
        `form-message ${type}`;
}