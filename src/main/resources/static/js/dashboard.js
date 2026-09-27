const caregiverId = sessionStorage.getItem("caregiverId");
let hasPendingInvitation = false;

const patientSection =
    document.getElementById("patientSection");

const noPatientSection =
    document.getElementById("noPatientSection");

const dashboardMessage =
    document.getElementById("dashboardMessage");


// إذا ما فيه مستخدم مسجل دخول
if (!caregiverId) {

    window.location.href = "/login";

} else {

    initializeDashboard();
}


// =========================
// Initialize Dashboard
// =========================

async function initializeDashboard() {

    dashboardMessage.textContent = "";

    try {

        // نجيب أحدث بيانات مقدم الرعاية من الـBackend
        const response = await fetch(
            `/api/v1/caregiver/get-caregiver/${caregiverId}`
        );

        const result =
            await readResponse(response);


        if (!response.ok) {

            dashboardMessage.textContent =
                result.message;

            return;
        }


        const caregiver = result.data;
        await Promise.all([
            loadPendingInvitation(),
            loadPendingHandover()
        ]);


        // تحديث الـSession بأحدث البيانات
        sessionStorage.setItem(
            "caregiverName",
            caregiver.fullName
        );

        sessionStorage.setItem(
            "caregiverRole",
            caregiver.role
        );


        document
            .getElementById("caregiverName")
            .textContent =
            "مرحباً، " + caregiver.fullName;


        document
            .getElementById("caregiverRole")
            .textContent =
            translateRole(caregiver.role);


        // إذا مقدم الرعاية مرتبط بمريض
        if (caregiver.patientId) {

            sessionStorage.setItem(
                "patientId",
                caregiver.patientId
            );

            await loadPatient(
                caregiver.patientId
            );

        } else {

            // إزالة patientId القديم من الـSession
            sessionStorage.removeItem(
                "patientId"
            );

            showNoPatient();
        }


    } catch (error) {

        dashboardMessage.textContent =
            "حدث خطأ في الاتصال، حاول مرة أخرى";

        console.error(error);
    }
}


// =========================
// Get Patient
// =========================

async function loadPatient(id) {

    try {

        const response = await fetch(
            `/api/v1/patient/get-patient/${id}`
        );

        const result =
            await readResponse(response);


        if (!response.ok) {

            // لو الـSession فيه patientId قديم
            // والمريض لم يعد موجودًا
            sessionStorage.removeItem(
                "patientId"
            );

            showNoPatient();

            return;
        }


        const data =
            result.data;


        document
            .getElementById("patientName")
            .textContent =
            data.fullName;


        document
            .getElementById("patientCode")
            .textContent =
            data.patientCode;


        document
            .getElementById("patientGender")
            .textContent =
            translateGender(data.gender);


        document
            .getElementById("bloodType")
            .textContent =
            data.bloodType || "-";


        document
            .getElementById("dateOfBirth")
            .textContent =
            data.dateOfBirth || "-";


        document
            .getElementById("patientStatus")
            .textContent =
            data.status === "active"
                ? "نشط"
                : "غير نشط";


        noPatientSection
            .classList
            .add("hidden");

        patientSection
            .classList
            .remove("hidden");


    } catch (error) {

        dashboardMessage.textContent =
            "حدث خطأ في الاتصال، حاول مرة أخرى";

        console.error(error);
    }
}


// =========================
// No Patient
// =========================

function showNoPatient() {

    document.getElementById("noPatientSection").classList.remove("hidden");

    const actions = document.getElementById("noPatientActions");
    const pendingNotice = document.getElementById("pendingPatientNotice");
    const linkBox = document.getElementById("linkPatientBox");

    if (hasPendingInvitation) {

        actions.classList.add("hidden");
        linkBox.classList.add("hidden");
        pendingNotice.classList.remove("hidden");

    } else {

        actions.classList.remove("hidden");
        pendingNotice.classList.add("hidden");
    }
}


// =========================
// Logout
// =========================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        function () {

            sessionStorage.clear();

            window.location.href = "/";
        }
    );


// =========================
// Add Patient
// =========================

document
    .getElementById("addPatientBtn")
    .addEventListener(
        "click",
        function () {

            window.location.href =
                "/patient";
        }
    );


// =========================
// Read Backend Response
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
                data.message || ""
        };

    } catch (error) {

        return {
            data: null,
            message: text
        };
    }
}

// =========================
// Pending Invitation
// =========================
async function loadPendingInvitation() {

    try {

        const response = await fetch(
            `/api/v1/caregiver/get-pending-caregiver-invitation/${caregiverId}`
        );

        const result = await readResponse(response);

        const invitationAlert =
            document.getElementById("invitationAlert");

        if (!response.ok || !result.data) {

            hasPendingInvitation = false;
            invitationAlert.classList.add("hidden");

            return false;
        }

        const invitation = result.data;

        let patientName = "المريض";

        if (invitation.patientId) {

            const patientResponse = await fetch(
                `/api/v1/patient/get-patient/${invitation.patientId}`
            );

            const patientResult =
                await readResponse(patientResponse);

            if (
                patientResponse.ok &&
                patientResult.data
            ) {

                patientName =
                    patientResult.data.fullName;
            }
        }

        document
            .getElementById("invitationPatientName")
            .textContent =
            patientName;

        document
            .getElementById("invitationRoleName")
            .textContent =
            translateRole(invitation.role);

        invitationAlert.classList.remove("hidden");

        hasPendingInvitation = true;

        return true;

    } catch (error) {

        console.error(error);

        hasPendingInvitation = false;

        document
            .getElementById("invitationAlert")
            .classList
            .add("hidden");

        return false;
    }
}
// =========================
// Pending Handover
// =========================

async function loadPendingHandover() {

    const handoverAlert =
        document.getElementById("handoverAlert");

    try {

        const response = await fetch(
            `/api/v1/handover/get-pending-handover/${caregiverId}`
        );

        const result =
            await readResponse(response);


        // لا يوجد طلب تسليم معلق
        if (response.status === 404) {

            handoverAlert.classList.add("hidden");
            return;
        }


        if (!response.ok || !result.data) {

            handoverAlert.classList.add("hidden");
            return;
        }


        const handover = result.data;

        let senderName = "مقدم الرعاية";


        // نجيب أعضاء فريق الرعاية لمعرفة اسم المرسل
        if (handover.patientId) {

            const teamResponse = await fetch(
                `/api/v1/caregiver/get-patient-caregivers/${handover.patientId}`
            );

            const teamResult =
                await readResponse(teamResponse);


            if (
                teamResponse.ok &&
                Array.isArray(teamResult.data)
            ) {

                const sender =
                    teamResult.data.find(
                        caregiver =>
                            Number(caregiver.id) ===
                            Number(handover.fromCaregiverId)
                    );


                if (sender) {
                    senderName =
                        sender.fullName;
                }
            }
        }


        document
            .getElementById("handoverSenderName")
            .textContent =
            senderName;


        handoverAlert.classList.remove("hidden");


    } catch (error) {

        console.error(error);

        handoverAlert.classList.add("hidden");
    }
}
// =========================
// Translations
// =========================

function translateRole(role) {

    if (role === "primary")
        return "مقدم الرعاية الأساسي";

    if (role === "secondary")
        return "مقدم رعاية مساعد";

    if (role === "backup")
        return "مقدم رعاية بديل";

    return "غير مرتبط";
}


function translateGender(gender) {

    if (gender === "male")
        return "ذكر";

    if (gender === "female")
        return "أنثى";

    return "-";
}
const openLinkPatientBtn = document.getElementById("openLinkPatientBtn");
const cancelLinkPatientBtn = document.getElementById("cancelLinkPatientBtn");
const linkPatientBtn = document.getElementById("linkPatientBtn");
const linkPatientBox = document.getElementById("linkPatientBox");
const linkPatientCode = document.getElementById("linkPatientCode");
const linkPatientMessage = document.getElementById("linkPatientMessage");


openLinkPatientBtn?.addEventListener("click", () => {

    linkPatientBox.classList.remove("hidden");

    linkPatientCode.value = "";
    linkPatientMessage.textContent = "";

    linkPatientCode.focus();
});


cancelLinkPatientBtn?.addEventListener("click", () => {

    linkPatientBox.classList.add("hidden");

    linkPatientCode.value = "";
    linkPatientMessage.textContent = "";
});


linkPatientBtn?.addEventListener("click", async () => {

    const patientCode = linkPatientCode.value.trim().toUpperCase();

    linkPatientMessage.textContent = "";

    if (!patientCode) {
        linkPatientMessage.textContent = "أدخل رقم المريض.";
        return;
    }

    linkPatientBtn.disabled = true;

    const originalContent = linkPatientBtn.innerHTML;

    linkPatientBtn.innerHTML = `
        <span class="material-symbols-rounded">hourglass_top</span>
        جاري الربط...
    `;

    try {

        const response = await fetch(
            `/api/v1/patient/link-existing-patient/${caregiverId}?patientCode=${encodeURIComponent(patientCode)}`,
            {
                method: "POST"
            }
        );

        const result = await readResponse(response);

        if (!response.ok) {

            const message = result.message || result.data || "";

            if (message.includes("patient not found")) {

                linkPatientMessage.textContent =
                    "لم يتم العثور على مريض بهذا الرقم.";

            } else if (message.includes("patient is already active")) {

                linkPatientMessage.textContent =
                    "هذا المريض مرتبط بالفعل بفريق رعاية. للانضمام إليه يجب أن يرسل لك مقدم الرعاية الأساسي دعوة.";

            } else if (message.includes("caregiver already has patient")) {

                linkPatientMessage.textContent =
                    "حسابك مرتبط بمريض بالفعل.";

            } else {

                linkPatientMessage.textContent =
                    message || "تعذر ربط المريض.";
            }

            return;
        }

        linkPatientMessage.textContent =
            "تم ربط المريض بنجاح.";

        const caregiverResponse = await fetch(
            `/api/v1/caregiver/get-caregiver/${caregiverId}`
        );

        if (caregiverResponse.ok) {

            const caregiver = await caregiverResponse.json();

            sessionStorage.setItem("patientId", caregiver.patientId);
            sessionStorage.setItem("caregiverRole", caregiver.role);
        }

        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 600);

    } catch (error) {

        console.error(error);

        linkPatientMessage.textContent =
            "حدث خطأ أثناء ربط المريض.";

    } finally {

        linkPatientBtn.disabled = false;
        linkPatientBtn.innerHTML = originalContent;
    }
});