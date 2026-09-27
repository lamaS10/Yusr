const caregiverId = sessionStorage.getItem("caregiverId");

const profileForm = document.getElementById("profileForm");
const profileView = document.getElementById("profileView");
const profileMessage = document.getElementById("profileMessage");

const editProfileBtn = document.getElementById("editProfileBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const deletePatientSection =
    document.getElementById("deletePatientSection");

const deletePatientBtn =
    document.getElementById("deletePatientBtn");
const leavePatientSection =
    document.getElementById("leavePatientSection");

const leavePatientBtn =
    document.getElementById("leavePatientBtn");

let patientCaregivers = [];

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phoneNumber");

const changePasswordCheckbox =
    document.getElementById("changePasswordCheckbox");

const passwordSection =
    document.getElementById("passwordSection");

const newPasswordInput =
    document.getElementById("newPassword");

const togglePasswordBtn =
    document.getElementById("togglePasswordBtn");

let originalCaregiver = null;


// ================================
// Start
// ================================

if (!caregiverId) {
    window.location.replace("/login");
} else {
    loadCaregiver();
}


// ================================
// Read Backend Response
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
            message: data?.message || text
        };

    } catch (error) {

        return {
            data: null,
            message: text
        };
    }
}


// ================================
// Load Caregiver
// ================================

async function loadCaregiver() {

    try {

        const response = await fetch(
            `/api/v1/caregiver/get-caregiver/${caregiverId}`
        );

        const result = await readResponse(response);

        if (!response.ok) {

            showMessage(
                result.message || "تعذر تحميل بيانات الحساب",
                "error"
            );

            editProfileBtn.disabled = true;

            return;
        }

        originalCaregiver = result.data;

        fillProfile(originalCaregiver);

    } catch (error) {

        showMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );

        console.error(error);
    }
}


// ================================
// Fill Profile
// ================================

function fillProfile(caregiver) {

    document.getElementById("profileName").textContent =
        caregiver.fullName || "-";

    document.getElementById("profileEmail").textContent =
        caregiver.email || "-";

    document.getElementById("profileRole").textContent =
        translateRole(caregiver.role);

    document.getElementById("profileStatus").textContent =
        caregiver.status === "active"
            ? "نشط"
            : "غير نشط";


    document.getElementById("viewFullName").textContent =
        caregiver.fullName || "-";

    document.getElementById("viewEmail").textContent =
        caregiver.email || "-";

    document.getElementById("viewPhone").textContent =
        caregiver.phoneNumber || "-";


    document.getElementById("careRole").textContent =
        translateRole(caregiver.role);

    if (caregiver.patientId) {
        loadLinkedPatient(caregiver.patientId);
    } else {
        document.getElementById("linkedPatient").textContent =
            "غير مرتبط بمريض";
    }

    document.getElementById("assignedAt").textContent =
        formatDate(caregiver.assignedAt);

    document.getElementById("currentCaregiver").textContent =
        caregiver.isCurrentCaregiver
            ? "نعم"
            : "لا";

    if (caregiver.patientId) {

        leavePatientSection.classList.remove("hidden");

        loadPatientCaregivers(caregiver.patientId);

    } else {

        leavePatientSection.classList.add("hidden");
        deletePatientSection.classList.add("hidden");

        patientCaregivers = [];
    }
}


// ================================
// Edit Mode
// ================================

editProfileBtn.addEventListener("click", function () {

    if (!originalCaregiver) {
        return;
    }

    fullNameInput.value =
        originalCaregiver.fullName || "";

    emailInput.value =
        originalCaregiver.email || "";

    phoneInput.value =
        originalCaregiver.phoneNumber || "";

    resetPasswordSection();

    profileView.classList.add("hidden");
    profileForm.classList.remove("hidden");
    editProfileBtn.classList.add("hidden");

    clearMessage();

    fullNameInput.focus();
});


// ================================
// Cancel Edit
// ================================

cancelEditBtn.addEventListener("click", function () {

    closeEditMode();
    clearMessage();
});


function closeEditMode() {

    profileForm.reset();

    resetPasswordSection();

    profileForm.classList.add("hidden");
    profileView.classList.remove("hidden");
    editProfileBtn.classList.remove("hidden");
}


// ================================
// Change Password Option
// ================================

changePasswordCheckbox.addEventListener(
    "change",
    function () {

        if (changePasswordCheckbox.checked) {

            passwordSection.classList.remove("hidden");

            newPasswordInput.required = true;

            newPasswordInput.focus();

        } else {

            passwordSection.classList.add("hidden");

            newPasswordInput.required = false;
            newPasswordInput.value = "";

            resetPasswordVisibility();
        }
    }
);


function resetPasswordSection() {

    changePasswordCheckbox.checked = false;

    passwordSection.classList.add("hidden");

    newPasswordInput.required = false;
    newPasswordInput.value = "";

    resetPasswordVisibility();
}


// ================================
// Password Visibility
// ================================

togglePasswordBtn.addEventListener(
    "click",
    function () {

        const icon =
            togglePasswordBtn.querySelector(
                ".material-symbols-rounded"
            );

        if (newPasswordInput.type === "password") {

            newPasswordInput.type = "text";

            icon.textContent = "visibility_off";

            togglePasswordBtn.setAttribute(
                "aria-label",
                "إخفاء كلمة المرور"
            );

        } else {

            newPasswordInput.type = "password";

            icon.textContent = "visibility";

            togglePasswordBtn.setAttribute(
                "aria-label",
                "إظهار كلمة المرور"
            );
        }
    }
);


function resetPasswordVisibility() {

    newPasswordInput.type = "password";

    const icon =
        togglePasswordBtn.querySelector(
            ".material-symbols-rounded"
        );

    icon.textContent = "visibility";

    togglePasswordBtn.setAttribute(
        "aria-label",
        "إظهار كلمة المرور"
    );
}


// ================================
// Update Caregiver
// ================================

profileForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        if (!originalCaregiver) {
            return;
        }


        // ----------------------------
        // Decide Which Password To Send
        // ----------------------------

        let passwordToSend =
            originalCaregiver.password;


        if (changePasswordCheckbox.checked) {

            const newPassword =
                newPasswordInput.value;

            const passwordPattern =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,30}$/;


            if (!passwordPattern.test(newPassword)) {

                showMessage(
                    "كلمة المرور يجب أن تكون من 8 إلى 30 حرفًا وتشمل حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا خاصًا",
                    "error"
                );

                newPasswordInput.focus();

                return;
            }

            passwordToSend = newPassword;
        }


        // ----------------------------
        // Request Body
        // ----------------------------

        const caregiver = {

            fullName:
                fullNameInput.value.trim(),

            email:
                emailInput.value.trim(),

            password:
            passwordToSend,

            phoneNumber:
                phoneInput.value.trim(),

            patientId:
            originalCaregiver.patientId,

            role:
            originalCaregiver.role,

            assignedAt:
            originalCaregiver.assignedAt,

            status:
            originalCaregiver.status,

            isCurrentCaregiver:
            originalCaregiver.isCurrentCaregiver
        };


        saveProfileBtn.disabled = true;

        clearMessage();


        try {

            const response = await fetch(
                `/api/v1/caregiver/update-caregiver/${caregiverId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(caregiver)
                }
            );


            const result =
                await readResponse(response);


            if (!response.ok) {

                showMessage(
                    result.message ||
                    "تعذر تحديث بيانات الحساب",
                    "error"
                );

                return;
            }


            // ----------------------------
            // Reload Saved Caregiver
            // ----------------------------

            const reloadResponse = await fetch(
                `/api/v1/caregiver/get-caregiver/${caregiverId}`
            );

            const reloadResult =
                await readResponse(reloadResponse);


            if (!reloadResponse.ok) {

                throw new Error(
                    "Could not reload caregiver"
                );
            }


            originalCaregiver =
                reloadResult.data;


            fillProfile(originalCaregiver);


            // Update values used by dashboard
            sessionStorage.setItem(
                "caregiverName",
                originalCaregiver.fullName
            );

            sessionStorage.setItem(
                "caregiverRole",
                originalCaregiver.role
            );


            closeEditMode();


            showMessage(
                "تم تحديث بيانات الحساب بنجاح",
                "success"
            );


        } catch (error) {

            showMessage(
                "تعذر إكمال العملية، حاولي مرة أخرى",
                "error"
            );

            console.error(error);

        } finally {

            saveProfileBtn.disabled = false;
        }
    }
);

async function loadPatientCaregivers(patientId) {

    try {

        const response = await fetch(
            `/api/v1/caregiver/get-patient-caregivers/${patientId}`
        );

        const result = await readResponse(response);

        if (!response.ok) {
            patientCaregivers = [];
            deletePatientSection.classList.add("hidden");
            return;
        }

        patientCaregivers =
            Array.isArray(result.data)
                ? result.data
                : [];

        const isOnlyCaregiver =
            patientCaregivers.length === 1;

        if (
            originalCaregiver?.role === "primary" &&
            isOnlyCaregiver
        ) {
            deletePatientSection.classList.remove("hidden");
        } else {
            deletePatientSection.classList.add("hidden");
        }

    } catch (error) {

        console.error(error);

        patientCaregivers = [];
        deletePatientSection.classList.add("hidden");
    }
}
leavePatientBtn.addEventListener(
    "click",
    async function () {

        if (
            !originalCaregiver ||
            !originalCaregiver.patientId
        ) {
            return;
        }

        let newPrimaryCaregiverId = null;

        const otherCaregivers =
            patientCaregivers.filter(
                caregiver =>
                    Number(caregiver.id) !== Number(caregiverId)
            );

        // Primary caregiver cannot leave while others remain
        // without transferring the primary role.
        if (
            originalCaregiver.role === "primary" &&
            otherCaregivers.length > 0
        ) {

            const options =
                otherCaregivers
                    .map(caregiver =>
                        `${caregiver.id} - ${caregiver.fullName}`
                    )
                    .join("\n");

            const selectedId = prompt(
                "اختاري مقدم الرعاية الذي سيصبح مقدم الرعاية الأساسي:\n\n" +
                options +
                "\n\nأدخلي رقم مقدم الرعاية:"
            );

            if (selectedId === null) {
                return;
            }

            newPrimaryCaregiverId =
                Number(selectedId);

            const validCaregiver =
                otherCaregivers.some(
                    caregiver =>
                        Number(caregiver.id) ===
                        newPrimaryCaregiverId
                );

            if (!validCaregiver) {

                showMessage(
                    "يرجى اختيار مقدم رعاية صحيح",
                    "error"
                );

                return;
            }
        }

        let confirmationMessage =
            "هل أنت متأكدة من مغادرة رعاية هذا المريض؟ سيتم فك ارتباط حسابك بالمريض.";

        if (otherCaregivers.length === 0) {

            confirmationMessage =
                "أنت مقدم الرعاية الوحيد. بعد مغادرتك سيصبح المريض غير نشط مع الاحتفاظ بسجله وبياناته. هل تريدين المتابعة؟";
        }

        if (!confirm(confirmationMessage)) {
            return;
        }

        leavePatientBtn.disabled = true;
        clearMessage();

        try {

            let url =
                `/api/v1/caregiver/leave-patient/${caregiverId}`;

            if (newPrimaryCaregiverId) {

                url +=
                    `?newPrimaryCaregiverId=${newPrimaryCaregiverId}`;
            }

            const response = await fetch(
                url,
                {
                    method: "PUT"
                }
            );

            const result =
                await readResponse(response);

            if (!response.ok) {

                showMessage(
                    result.message ||
                    "تعذر مغادرة رعاية المريض",
                    "error"
                );

                return;
            }

            sessionStorage.removeItem("patientId");
            sessionStorage.setItem(
                "caregiverRole",
                "unassigned"
            );

            await loadCaregiver();

            showMessage(
                "تمت مغادرة رعاية المريض بنجاح",
                "success"
            );

        } catch (error) {

            console.error(error);

            showMessage(
                "حدث خطأ أثناء مغادرة رعاية المريض",
                "error"
            );

        } finally {

            leavePatientBtn.disabled = false;
        }
    }
);
// ================================
// Delete Patient Record
// ================================

deletePatientBtn.addEventListener(
    "click",
    async function () {

        if (
            !originalCaregiver ||
            !originalCaregiver.patientId ||
            originalCaregiver.role !== "primary"
        ) {
            return;
        }

        const confirmed = confirm(
            "هل أنت متأكدة من حذف سجل المريض وجميع بياناته نهائيًا؟ لا يمكن التراجع عن هذا الإجراء."
        );

        if (!confirmed) {
            return;
        }

        deletePatientBtn.disabled = true;
        clearMessage();

        try {

            const patientId =
                originalCaregiver.patientId;

            const response = await fetch(
                `/api/v1/patient/delete-patient/${patientId}/${caregiverId}`,
                {
                    method: "DELETE"
                }
            );

            const result =
                await readResponse(response);

            if (!response.ok) {

                showMessage(
                    result.message ||
                    "تعذر حذف سجل المريض",
                    "error"
                );

                return;
            }

            // Reload caregiver because deleting the patient
            // unlinks the primary caregiver.
            const caregiverResponse = await fetch(
                `/api/v1/caregiver/get-caregiver/${caregiverId}`
            );

            const caregiverResult =
                await readResponse(caregiverResponse);

            if (!caregiverResponse.ok) {
                throw new Error(
                    "Could not reload caregiver"
                );
            }

            originalCaregiver =
                caregiverResult.data;

            fillProfile(originalCaregiver);

            sessionStorage.removeItem("patientId");

            sessionStorage.setItem(
                "caregiverRole",
                originalCaregiver.role
            );

            showMessage(
                "تم حذف سجل المريض وجميع البيانات المرتبطة به نهائيًا",
                "success"
            );

        } catch (error) {

            console.error(error);

            showMessage(
                "حدث خطأ أثناء حذف سجل المريض",
                "error"
            );

        } finally {

            deletePatientBtn.disabled = false;
        }
    }
);

// ================================
// Delete Account
// ================================

deleteAccountBtn.addEventListener(
    "click",
    async function () {

        if (!originalCaregiver) {
            return;
        }


        if (originalCaregiver.patientId != null) {

            showMessage(
                "لا يمكنك حذف الحساب أثناء ارتباطك بمريض",
                "error"
            );

            return;
        }


        const confirmed = confirm(
            "هل أنت متأكدة من حذف الحساب نهائيًا؟ لا يمكن التراجع عن هذا الإجراء."
        );


        if (!confirmed) {
            return;
        }


        deleteAccountBtn.disabled = true;


        try {

            const response = await fetch(
                `/api/v1/caregiver/delete-caregiver/${caregiverId}`,
                {
                    method: "DELETE"
                }
            );


            const result =
                await readResponse(response);


            if (!response.ok) {

                showMessage(
                    result.message ||
                    "تعذر حذف الحساب",
                    "error"
                );

                return;
            }


            sessionStorage.clear();

            window.location.replace("/");


        } catch (error) {

            showMessage(
                "حدث خطأ أثناء حذف الحساب",
                "error"
            );

            console.error(error);

        } finally {

            deleteAccountBtn.disabled = false;
        }
    }
);
// ================================
// Load Linked Patient
// ================================

async function loadLinkedPatient(patientId) {

    const linkedPatient =
        document.getElementById("linkedPatient");

    linkedPatient.textContent = "جاري التحميل...";

    try {

        const response = await fetch(
            `/api/v1/patient/get-patient/${patientId}`
        );

        const result = await readResponse(response);

        if (!response.ok || !result.data) {

            linkedPatient.textContent =
                "تعذر تحميل بيانات المريض";

            return;
        }

        linkedPatient.textContent =
            result.data.fullName || "-";

    } catch (error) {

        linkedPatient.textContent =
            "تعذر تحميل بيانات المريض";

        console.error(error);
    }
}

// ================================
// Helpers
// ================================

function translateRole(role) {
    switch (role) {
        case "primary":
            return "مقدم الرعاية الأساسي";

        case "secondary":
            return "مقدم رعاية مساعد";

        case "backup":
            return "مقدم رعاية بديل";

        case "unassigned":
            return "غير معيّن";

        default:
            return role || "-";
    }
}


function formatDate(value) {

    if (!value) {
        return "غير محدد";
    }


    const date = new Date(value);


    if (Number.isNaN(date.getTime())) {
        return value;
    }


    return date.toLocaleDateString(
        "ar-SA",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


function showMessage(message, type) {

    profileMessage.textContent =
        message || "";

    profileMessage.className =
        `form-message ${type}`;
}


function clearMessage() {

    profileMessage.textContent = "";

    profileMessage.className =
        "form-message";
}