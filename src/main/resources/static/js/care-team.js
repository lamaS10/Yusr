const caregiverId =
    Number(sessionStorage.getItem("caregiverId"));

let patientId =
    Number(sessionStorage.getItem("patientId"));

let currentCaregiver = null;
let caregivers = [];
let pendingInvitation = null;
let transferTargetId = null;

let pendingHandover = null;
let sentHandovers = [];
let editingHandoverId = null;
let outgoingInvitations = [];

// ================================
// Elements
// ================================

const inviteCaregiverBtn =
    document.getElementById("inviteCaregiverBtn");

const pendingInvitationSection =
    document.getElementById("pendingInvitationSection");

const teamSummary =
    document.getElementById("teamSummary");

const teamSection =
    document.getElementById("teamSection");

const leaveSection =
    document.getElementById("leaveSection");

const noPatientSection =
    document.getElementById("noPatientSection");

const caregiversList =
    document.getElementById("caregiversList");

const emptyTeam =
    document.getElementById("emptyTeam");

const careTeamMessage =
    document.getElementById("careTeamMessage");

const outgoingInvitationsSection =
    document.getElementById(
        "outgoingInvitationsSection"
    );

const outgoingInvitationsList =
    document.getElementById(
        "outgoingInvitationsList"
    );

const emptyOutgoingInvitations =
    document.getElementById(
        "emptyOutgoingInvitations"
    );
// Invite Modal

const inviteModal =
    document.getElementById("inviteModal");

const inviteForm =
    document.getElementById("inviteForm");

const inviteEmail =
    document.getElementById("inviteEmail");

const invitePhone =
    document.getElementById("invitePhone");



const inviteMessage =
    document.getElementById("inviteMessage");

const sendInvitationBtn =
    document.getElementById("sendInvitationBtn");


// Transfer Modal

const transferModal =
    document.getElementById("transferModal");

const transferCaregiverName =
    document.getElementById("transferCaregiverName");

const transferMessage =
    document.getElementById("transferMessage");

const confirmTransferBtn =
    document.getElementById("confirmTransferBtn");


// Leave Modal

const leaveModal =
    document.getElementById("leaveModal");

const newPrimarySection =
    document.getElementById("newPrimarySection");

const newPrimaryCaregiver =
    document.getElementById("newPrimaryCaregiver");

const leaveWarningText =
    document.getElementById("leaveWarningText");

const leaveModalMessage =
    document.getElementById("leaveModalMessage");

const confirmLeaveBtn =
    document.getElementById("confirmLeaveBtn");


// Handover

const handoverSection =
    document.getElementById("handoverSection");

const createHandoverBtn =
    document.getElementById("createHandoverBtn");

const currentCaregiverName =
    document.getElementById("currentCaregiverName");

const incomingHandoverSection =
    document.getElementById("incomingHandoverSection");

const incomingFromName =
    document.getElementById("incomingFromName");

const incomingCreatedAt =
    document.getElementById("incomingCreatedAt");

const incomingExpectedAt =
    document.getElementById("incomingExpectedAt");

const incomingSummary =
    document.getElementById("incomingSummary");

const acceptHandoverBtn =
    document.getElementById("acceptHandoverBtn");

const rejectHandoverBtn =
    document.getElementById("rejectHandoverBtn");

const sentHandoversList =
    document.getElementById("sentHandoversList");

const emptySentHandovers =
    document.getElementById("emptySentHandovers");


// Handover Modal

const handoverModal =
    document.getElementById("handoverModal");

const handoverForm =
    document.getElementById("handoverForm");

const handoverModalTitle =
    document.getElementById("handoverModalTitle");

const handoverModalDescription =
    document.getElementById("handoverModalDescription");

const handoverReceiverGroup =
    document.getElementById("handoverReceiverGroup");

const handoverReceiver =
    document.getElementById("handoverReceiver");

const fixedReceiverBox =
    document.getElementById("fixedReceiverBox");

const fixedReceiverName =
    document.getElementById("fixedReceiverName");

const handoverSummary =
    document.getElementById("handoverSummary");

const expectedAcceptanceAt =
    document.getElementById("expectedAcceptanceAt");

const handoverModalMessage =
    document.getElementById("handoverModalMessage");

const saveHandoverBtn =
    document.getElementById("saveHandoverBtn");


// ================================
// Start
// ================================

if (!caregiverId) {

    window.location.replace("/login");

} else {

    initializePage();
}


async function initializePage() {

    clearPageMessage();

    const loaded =
        await loadCurrentCaregiver();

    if (!loaded) {
        return;
    }


    // Invitation can exist before caregiver
    // is linked to a patient.
    await loadPendingInvitation();


    if (currentCaregiver.patientId) {

        patientId =
            currentCaregiver.patientId;

        sessionStorage.setItem(
            "patientId",
            patientId
        );


        await Promise.all([
            loadPatient(),
            loadCaregivers(),
            loadOutgoingInvitations()
        ]);

        showTeamPage();


        await Promise.all([
            loadPendingHandover(),
            loadSentHandovers()
        ]);


        updateHandoverAccess();

    } else {

        patientId = null;

        sessionStorage.removeItem(
            "patientId"
        );


        teamSummary.classList.add(
            "hidden"
        );

        teamSection.classList.add(
            "hidden"
        );

        leaveSection.classList.add(
            "hidden"
        );

        handoverSection.classList.add(
            "hidden"
        );

        inviteCaregiverBtn.classList.add(
            "hidden"
        );


        if (!pendingInvitation) {

            noPatientSection.classList.remove(
                "hidden"
            );
        }
    }
}


// ================================
// Backend Response
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
// Current Caregiver
// ================================

async function loadCurrentCaregiver() {

    try {

        const response =
            await fetch(
                `/api/v1/caregiver/get-caregiver/${caregiverId}`
            );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر تحميل بيانات مقدم الرعاية",
                "error"
            );

            return false;
        }


        currentCaregiver =
            result.data;


        sessionStorage.setItem(
            "caregiverName",
            currentCaregiver.fullName
        );


        sessionStorage.setItem(
            "caregiverRole",
            currentCaregiver.role
        );


        return true;

    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );


        return false;
    }
}


// ================================
// Patient
// ================================

async function loadPatient() {

    try {

        const response =
            await fetch(
                `/api/v1/patient/get-patient/${patientId}`
            );


        const result =
            await readResponse(response);


        if (!response.ok) {
            return;
        }


        document.getElementById(
            "teamPatientName"
        ).textContent =
            result.data.fullName ||
            "المريض";

    } catch (error) {

        console.error(error);
    }
}


// ================================
// Team
// ================================

async function loadCaregivers() {

    try {

        const response =
            await fetch(
                `/api/v1/caregiver/get-patient-caregivers/${patientId}`
            );


        const result =
            await readResponse(response);


        if (!response.ok) {

            caregivers = [];


            showPageMessage(
                result.message ||
                "تعذر تحميل فريق الرعاية",
                "error"
            );


            return;
        }


        caregivers =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderCaregivers();

    } catch (error) {

        console.error(error);

        caregivers = [];


        showPageMessage(
            "تعذر تحميل فريق الرعاية",
            "error"
        );
    }
}


function showTeamPage() {

    noPatientSection.classList.add(
        "hidden"
    );

    teamSummary.classList.remove(
        "hidden"
    );

    teamSection.classList.remove(
        "hidden"
    );

    leaveSection.classList.remove(
        "hidden"
    );

    handoverSection.classList.remove(
        "hidden"
    );


    if (
        currentCaregiver.role ===
        "primary"
    ) {

        inviteCaregiverBtn.classList.remove(
            "hidden"
        );


        document.getElementById(
            "leaveDescription"
        ).textContent =
            "إذا كان هناك أعضاء آخرون في الفريق، يجب اختيار مقدم رعاية أساسي جديد قبل المغادرة.";

    } else {

        inviteCaregiverBtn.classList.add(
            "hidden"
        );


        document.getElementById(
            "leaveDescription"
        ).textContent =
            "يمكنك مغادرة رعاية المريض وسيتم إلغاء ارتباط حسابك به.";
    }
}


function renderCaregivers() {

    caregiversList.innerHTML = "";


    document.getElementById(
        "teamCount"
    ).textContent =
        `${caregivers.length} من مقدمي الرعاية`;


    if (caregivers.length <= 1) {

        emptyTeam.classList.remove(
            "hidden"
        );

    } else {

        emptyTeam.classList.add(
            "hidden"
        );
    }


    caregivers.forEach(
        caregiver => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "caregiver-item";


            const isMe =
                Number(caregiver.id) ===
                caregiverId;


            if (isMe) {

                item.classList.add(
                    "me"
                );
            }


            const actions = [];


            if (
                currentCaregiver.role ===
                "primary" &&
                !isMe &&
                caregiver.role !== "primary"
            ) {

                actions.push(`
                    <button type="button"
                            class="small-btn transfer-btn"
                            data-id="${caregiver.id}">

                        <span class="material-symbols-rounded">
                            swap_horiz
                        </span>

                        نقل الأساسي
                    </button>
                `);


                actions.push(`
                    <button type="button"
                            class="small-btn danger unlink-btn"
                            data-id="${caregiver.id}">

                        <span class="material-symbols-rounded">
                            person_remove
                        </span>

                        فك الارتباط
                    </button>
                `);
            }


            item.innerHTML = `

                <div class="caregiver-avatar">

                    <span class="material-symbols-rounded">
                        person
                    </span>

                </div>


                <div class="caregiver-info">

                    <div class="caregiver-name-row">

                        <h3>
                            ${escapeHtml(caregiver.fullName || "-")}
                        </h3>


                        <span class="role-badge">
                            ${translateRole(caregiver.role)}
                        </span>


                        ${
                caregiver.isCurrentCaregiver
                    ? `
                                    <span class="current-badge">
                                        مسؤول الرعاية الحالي
                                    </span>
                                  `
                    : ""
            }


                        ${
                isMe
                    ? `
                                    <span class="me-badge">
                                        أنت
                                    </span>
                                  `
                    : ""
            }

                    </div>


                    <p>
                        ${escapeHtml(caregiver.email || "-")}
                    </p>

                </div>


                ${
                actions.length
                    ? `
                            <div class="caregiver-actions">
                                ${actions.join("")}
                            </div>
                          `
                    : ""
            }
            `;


            caregiversList.appendChild(
                item
            );
        }
    );


    bindTeamButtons();
}


function bindTeamButtons() {

    document
        .querySelectorAll(
            ".unlink-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        unlinkCaregiver(
                            Number(
                                button.dataset.id
                            )
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".transfer-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        openTransferModal(
                            Number(
                                button.dataset.id
                            )
                        );
                    }
                );
            }
        );
}


// ================================
// Invite Caregiver
// ================================

inviteCaregiverBtn.addEventListener(
    "click",
    function () {

        inviteForm.reset();


        clearModalMessage(
            inviteMessage
        );


        inviteModal.classList.remove(
            "hidden"
        );


        inviteEmail.focus();
    }
);


document.getElementById(
    "closeInviteModal"
).addEventListener(
    "click",
    closeInviteModal
);


document.getElementById(
    "cancelInviteBtn"
).addEventListener(
    "click",
    closeInviteModal
);


function closeInviteModal() {

    inviteModal.classList.add(
        "hidden"
    );


    inviteForm.reset();


    clearModalMessage(
        inviteMessage
    );
}


inviteForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (
            !currentCaregiver ||
            currentCaregiver.role !==
            "primary"
        ) {

            return;
        }


        sendInvitationBtn.disabled =
            true;


        clearModalMessage(
            inviteMessage
        );


        const email =
            inviteEmail.value.trim();

        const phone =
            invitePhone.value.trim();

        const params =
            new URLSearchParams({
                email: email,
                phoneNumber: phone
            });


        try {

            const response =
                await fetch(
                    `/api/v1/caregiver/assign-caregiver-to-patient/${caregiverId}/${patientId}?${params.toString()}`,
                    {
                        method: "POST"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                showModalMessage(
                    inviteMessage,
                    result.message ||
                    "تعذر إرسال الدعوة",
                    "error"
                );


                return;
            }


            showModalMessage(
                inviteMessage,
                "تم إرسال الدعوة بنجاح عبر واتساب",
                "success"
            );


            inviteForm.reset();
            await loadOutgoingInvitations();

        } catch (error) {

            console.error(error);


            showModalMessage(
                inviteMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            sendInvitationBtn.disabled =
                false;
        }
    }
);


// ================================
// Outgoing Pending Invitations
// ================================

async function loadOutgoingInvitations() {

    if (
        !currentCaregiver ||
        currentCaregiver.role !== "primary" ||
        !patientId
    ) {
        outgoingInvitations = [];

        outgoingInvitationsSection.classList.add(
            "hidden"
        );

        return;
    }

    try {

        const response = await fetch(
            `/api/v1/caregiver/get-pending-patient-invitations/${patientId}`
        );

        const result =
            await readResponse(response);

        if (!response.ok) {

            outgoingInvitations = [];

            outgoingInvitationsSection.classList.add(
                "hidden"
            );

            return;
        }

        outgoingInvitations =
            Array.isArray(result.data)
                ? result.data
                : [];

        renderOutgoingInvitations();

    } catch (error) {

        console.error(error);

        outgoingInvitations = [];

        outgoingInvitationsSection.classList.add(
            "hidden"
        );
    }
}


function renderOutgoingInvitations() {

    outgoingInvitationsList.innerHTML = "";

    outgoingInvitationsSection.classList.remove(
        "hidden"
    );

    if (outgoingInvitations.length === 0) {

        emptyOutgoingInvitations.classList.remove(
            "hidden"
        );

        return;
    }

    emptyOutgoingInvitations.classList.add(
        "hidden"
    );

    outgoingInvitations.forEach(
        invitation => {

            const item =
                document.createElement("article");

            item.className =
                "outgoing-invitation-item";

            item.innerHTML = `

                <div class="outgoing-invitation-icon">

                    <span class="material-symbols-rounded">
                        outgoing_mail
                    </span>

                </div>

                <div class="outgoing-invitation-info">

                    <div class="outgoing-invitation-top">

                        <strong>
                            ${escapeHtml(invitation.email || "-")}
                        </strong>

                        <span class="pending-invitation-badge">
                            بانتظار القبول
                        </span>

                    </div>

                    <div class="outgoing-invitation-meta">

                        <span>
                            <span class="material-symbols-rounded">
                                call
                            </span>

                            ${escapeHtml(invitation.phoneNumber || "-")}
                        </span>

                        <span>
                            <span class="material-symbols-rounded">
                                badge
                            </span>

                            ${translateRole(invitation.role)}
                        </span>

                    </div>

                </div>

                <button type="button"
                        class="small-btn danger cancel-invitation-btn"
                        data-id="${invitation.id}">

                    <span class="material-symbols-rounded">
                        close
                    </span>

                    إلغاء الدعوة

                </button>
            `;

            outgoingInvitationsList.appendChild(
                item
            );
        }
    );

    document
        .querySelectorAll(
            ".cancel-invitation-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        cancelOutgoingInvitation(
                            Number(button.dataset.id),
                            button
                        );
                    }
                );
            }
        );
}


async function cancelOutgoingInvitation(
    invitationId,
    button
) {

    const confirmed = confirm(
        "هل أنت متأكدة من إلغاء هذه الدعوة؟"
    );

    if (!confirmed) {
        return;
    }

    button.disabled = true;

    try {

        const response = await fetch(
            `/api/v1/caregiver/cancel-caregiver-invitation/${invitationId}/${caregiverId}`,
            {
                method: "PUT"
            }
        );

        const result =
            await readResponse(response);

        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر إلغاء الدعوة",
                "error"
            );

            return;
        }

        showPageMessage(
            "تم إلغاء الدعوة بنجاح",
            "success"
        );

        await loadOutgoingInvitations();

    } catch (error) {

        console.error(error);

        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );

    } finally {

        button.disabled = false;
    }
}
// ================================
// Pending Invitation
// ================================

async function loadPendingInvitation() {

    try {

        const response =
            await fetch(
                `/api/v1/caregiver/get-pending-caregiver-invitation/${caregiverId}`
            );


        const result =
            await readResponse(
                response
            );


        if (
            !response.ok ||
            !result.data
        ) {

            pendingInvitation =
                null;


            pendingInvitationSection.classList.add(
                "hidden"
            );


            return;
        }


        pendingInvitation =
            result.data;


        /*
         * These fields depend on the
         * CaregiverInvitation model.
         */
        if (pendingInvitation.patientId) {

            try {

                const patientResponse =
                    await fetch(
                        `/api/v1/patient/get-patient/${pendingInvitation.patientId}`
                    );

                const patientResult =
                    await readResponse(patientResponse);

                document.getElementById(
                    "invitationPatient"
                ).textContent =
                    patientResponse.ok && patientResult.data
                        ? patientResult.data.fullName
                        : `#${pendingInvitation.patientId}`;

            } catch (error) {

                console.error(error);

                document.getElementById(
                    "invitationPatient"
                ).textContent =
                    `#${pendingInvitation.patientId}`;
            }

        } else {

            document.getElementById(
                "invitationPatient"
            ).textContent = "-";
        }


        document.getElementById(
            "invitationRole"
        ).textContent =
            pendingInvitation.role
                ? translateRole(
                    pendingInvitation.role
                )
                : "-";


        pendingInvitationSection.classList.remove(
            "hidden"
        );


        noPatientSection.classList.add(
            "hidden"
        );

    } catch (error) {

        console.error(error);
    }
}


document.getElementById(
    "acceptInvitationBtn"
).addEventListener(
    "click",
    async function () {

        if (!pendingInvitation) {
            return;
        }


        await respondToInvitation(
            "accept"
        );
    }
);


document.getElementById(
    "rejectInvitationBtn"
).addEventListener(
    "click",
    async function () {

        if (!pendingInvitation) {
            return;
        }


        await respondToInvitation(
            "reject"
        );
    }
);


async function respondToInvitation(
    action
) {

    const button =
        action === "accept"
            ? document.getElementById(
                "acceptInvitationBtn"
            )
            : document.getElementById(
                "rejectInvitationBtn"
            );


    button.disabled = true;


    const endpoint =
        action === "accept"
            ? "accept-caregiver-invitation"
            : "reject-caregiver-invitation";


    try {

        const response =
            await fetch(
                `/api/v1/caregiver/${endpoint}/${pendingInvitation.id}/${caregiverId}`,
                {
                    method: "PUT"
                }
            );


        const result =
            await readResponse(
                response
            );


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر تنفيذ العملية",
                "error"
            );


            return;
        }


        if (action === "accept") {

            showPageMessage(
                "تم قبول الدعوة والانضمام إلى فريق الرعاية",
                "success"
            );


            await initializePage();

        } else {

            pendingInvitation =
                null;


            pendingInvitationSection.classList.add(
                "hidden"
            );


            showPageMessage(
                "تم رفض الدعوة",
                "success"
            );


            if (
                !currentCaregiver.patientId
            ) {

                noPatientSection.classList.remove(
                    "hidden"
                );
            }
        }

    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );

    } finally {

        button.disabled = false;
    }
}


// ================================
// Unlink Caregiver
// ================================

async function unlinkCaregiver(id) {

    const caregiver =
        caregivers.find(
            item =>
                Number(item.id) === id
        );


    if (!caregiver) {
        return;
    }


    const confirmed =
        confirm(
            `هل تريدين فك ارتباط ${caregiver.fullName} من المريض؟`
        );


    if (!confirmed) {
        return;
    }


    clearPageMessage();


    try {

        const response =
            await fetch(
                `/api/v1/caregiver/unlink-caregiver/${caregiverId}/${id}`,
                {
                    method: "PUT"
                }
            );


        const result =
            await readResponse(
                response
            );


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر فك ارتباط مقدم الرعاية",
                "error"
            );


            return;
        }


        showPageMessage(
            "تم فك ارتباط مقدم الرعاية بنجاح",
            "success"
        );


        await loadCaregivers();


        await Promise.all([
            loadPendingHandover(),
            loadSentHandovers()
        ]);


        updateHandoverAccess();

    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// ================================
// Transfer Primary
// ================================

function openTransferModal(id) {

    const caregiver =
        caregivers.find(
            item =>
                Number(item.id) === id
        );


    if (!caregiver) {
        return;
    }


    transferTargetId =
        id;


    transferCaregiverName.textContent =
        caregiver.fullName || "-";


    clearModalMessage(
        transferMessage
    );


    transferModal.classList.remove(
        "hidden"
    );
}


document.getElementById(
    "closeTransferModal"
).addEventListener(
    "click",
    closeTransferModal
);


document.getElementById(
    "cancelTransferBtn"
).addEventListener(
    "click",
    closeTransferModal
);


function closeTransferModal() {

    transferModal.classList.add(
        "hidden"
    );


    transferTargetId =
        null;


    clearModalMessage(
        transferMessage
    );
}


confirmTransferBtn.addEventListener(
    "click",
    async function () {

        if (!transferTargetId) {
            return;
        }


        confirmTransferBtn.disabled =
            true;


        try {

            const response =
                await fetch(
                    `/api/v1/caregiver/transfer-primary-role/${caregiverId}/${transferTargetId}`,
                    {
                        method: "PUT"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                showModalMessage(
                    transferMessage,
                    result.message ||
                    "تعذر نقل الدور الأساسي",
                    "error"
                );


                return;
            }


            closeTransferModal();


            showPageMessage(
                "تم نقل دور مقدم الرعاية الأساسي بنجاح",
                "success"
            );


            await initializePage();

        } catch (error) {

            console.error(error);


            showModalMessage(
                transferMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            confirmTransferBtn.disabled =
                false;
        }
    }
);


// ================================
// Handover Access
// ================================

function updateHandoverAccess() {

    if (
        !currentCaregiver?.patientId
    ) {

        handoverSection.classList.add(
            "hidden"
        );

        return;
    }


    handoverSection.classList.remove(
        "hidden"
    );


    const current =
        caregivers.find(
            caregiver =>
                caregiver.isCurrentCaregiver ===
                true
        );


    currentCaregiverName.textContent =
        current?.fullName ||
        "غير محدد";


    const otherActiveCaregivers =
        caregivers.filter(
            caregiver =>
                Number(caregiver.id) !==
                caregiverId &&
                caregiver.status ===
                "active"
        );


    const hasPendingSent =
        sentHandovers.some(
            handover =>
                handover.status ===
                "pending"
        );


    /*
     * Handover is based on current
     * responsibility, not primary role.
     */
    if (
        currentCaregiver.isCurrentCaregiver ===
        true &&
        otherActiveCaregivers.length > 0 &&
        !hasPendingSent
    ) {

        createHandoverBtn.classList.remove(
            "hidden"
        );

    } else {

        createHandoverBtn.classList.add(
            "hidden"
        );
    }
}


// ================================
// Incoming Pending Handover
// ================================
async function loadPendingHandover() {

    try {

        const response =
            await fetch(
                `/api/v1/handover/get-pending-handover/${caregiverId}`
            );


        const result =
            await readResponse(
                response
            );


        /*
         * 404 means there is no pending handover.
         * This is a normal state.
         */
        if (response.status === 404) {

            pendingHandover =
                null;


            incomingHandoverSection.classList.add(
                "hidden"
            );


            incomingHandoverSection.classList.remove(
                "overdue-handover"
            );


            return;
        }


        /*
         * Any other error should be shown
         * to the user.
         */
        if (!response.ok) {

            pendingHandover =
                null;


            incomingHandoverSection.classList.add(
                "hidden"
            );


            incomingHandoverSection.classList.remove(
                "overdue-handover"
            );


            showPageMessage(
                result.message ||
                "تعذر تحميل طلب تسليم الرعاية",
                "error"
            );


            return;
        }


        pendingHandover =
            result.data;


        renderPendingHandover();

    } catch (error) {

        console.error(error);


        pendingHandover =
            null;


        incomingHandoverSection.classList.add(
            "hidden"
        );


        incomingHandoverSection.classList.remove(
            "overdue-handover"
        );


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}
function renderPendingHandover() {

    if (!pendingHandover) {

        incomingHandoverSection.classList.add(
            "hidden"
        );


        incomingHandoverSection.classList.remove(
            "overdue-handover"
        );


        return;
    }


    const sender =
        caregivers.find(
            caregiver =>
                Number(caregiver.id) ===
                Number(
                    pendingHandover.fromCaregiverId
                )
        );


    incomingFromName.textContent =
        sender?.fullName ||
        `مقدم الرعاية #${pendingHandover.fromCaregiverId}`;


    incomingCreatedAt.textContent =
        formatDateTime(
            pendingHandover.createdAt
        );


    const overdue =
        isHandoverOverdue(
            pendingHandover
        );


    if (overdue) {

        incomingExpectedAt.innerHTML = `
            ${escapeHtml(
            formatDateTime(
                pendingHandover.expectedAcceptanceAt
            )
        )}

            <span class="overdue-handover-badge">
                متأخر
            </span>
        `;


        incomingHandoverSection.classList.add(
            "overdue-handover"
        );

    } else {

        incomingExpectedAt.textContent =
            formatDateTime(
                pendingHandover.expectedAcceptanceAt
            );


        incomingHandoverSection.classList.remove(
            "overdue-handover"
        );
    }


    incomingSummary.textContent =
        pendingHandover.summary ||
        "-";


    incomingHandoverSection.classList.remove(
        "hidden"
    );
}

// ================================
// Accept Handover
// ================================

acceptHandoverBtn.addEventListener(
    "click",
    async function () {

        if (!pendingHandover) {
            return;
        }


        const confirmed =
            confirm(
                "عند قبول التسليم ستصبحين مقدم الرعاية المسؤول حاليًا، وستنتقل إليك المهام المعلقة. هل تريدين المتابعة؟"
            );


        if (!confirmed) {
            return;
        }


        acceptHandoverBtn.disabled =
            true;

        rejectHandoverBtn.disabled =
            true;


        try {

            const response =
                await fetch(
                    `/api/v1/handover/accept-handover/${pendingHandover.id}/${caregiverId}`,
                    {
                        method: "PUT"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                showPageMessage(
                    result.message ||
                    "تعذر قبول طلب تسليم الرعاية",
                    "error"
                );


                return;
            }


            pendingHandover =
                null;


            await refreshHandoverPage();


            showPageMessage(
                "تم استلام مسؤولية الرعاية بنجاح ونقل المهام المعلقة إليك",
                "success"
            );

        } catch (error) {

            console.error(error);


            showPageMessage(
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            acceptHandoverBtn.disabled =
                false;

            rejectHandoverBtn.disabled =
                false;
        }
    }
);


// ================================
// Reject Handover
// ================================

rejectHandoverBtn.addEventListener(
    "click",
    async function () {

        if (!pendingHandover) {
            return;
        }


        const confirmed =
            confirm(
                "هل تريدين رفض طلب استلام الرعاية؟"
            );


        if (!confirmed) {
            return;
        }


        acceptHandoverBtn.disabled =
            true;

        rejectHandoverBtn.disabled =
            true;


        try {

            const response =
                await fetch(
                    `/api/v1/handover/reject-handover/${pendingHandover.id}/${caregiverId}`,
                    {
                        method: "PUT"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                showPageMessage(
                    result.message ||
                    "تعذر رفض طلب التسليم",
                    "error"
                );


                return;
            }


            pendingHandover =
                null;


            incomingHandoverSection.classList.add(
                "hidden"
            );


            await loadSentHandovers();


            updateHandoverAccess();


            showPageMessage(
                "تم رفض طلب تسليم الرعاية",
                "success"
            );

        } catch (error) {

            console.error(error);


            showPageMessage(
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            acceptHandoverBtn.disabled =
                false;

            rejectHandoverBtn.disabled =
                false;
        }
    }
);


// ================================
// Sent Handovers
// ================================

async function loadSentHandovers() {

    try {

        const response =
            await fetch(
                `/api/v1/handover/get-sent-handovers/${caregiverId}`
            );


        const result =
            await readResponse(
                response
            );


        if (!response.ok) {

            sentHandovers = [];

            renderSentHandovers();

            return;
        }


        sentHandovers =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderSentHandovers();

    } catch (error) {

        console.error(error);


        sentHandovers = [];


        renderSentHandovers();
    }
}


function renderSentHandovers() {

    sentHandoversList.innerHTML =
        "";


    if (
        sentHandovers.length === 0
    ) {

        emptySentHandovers.classList.remove(
            "hidden"
        );


        return;
    }


    emptySentHandovers.classList.add(
        "hidden"
    );


    sentHandovers.forEach(
        handover => {
            const overdue =
                isHandoverOverdue(
                    handover
                );

            const receiver =
                caregivers.find(
                    caregiver =>
                        Number(caregiver.id) ===
                        Number(
                            handover.toCaregiverId
                        )
                );


            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "handover-item";


            item.innerHTML = `

                <div class="handover-item-top">

                    <div class="handover-receiver">

                        <div class="handover-receiver-icon">

                            <span class="material-symbols-rounded">
                                person
                            </span>

                        </div>

                        <div>

                            <span>
                                تسليم الرعاية إلى
                            </span>

                            <strong>
                                ${
                escapeHtml(
                    receiver?.fullName ||
                    `مقدم الرعاية #${handover.toCaregiverId}`
                )
            }
                            </strong>

                        </div>

                    </div>

                    <span class="handover-status ${handover.status}">
                        ${translateHandoverStatus(handover.status)}
                    </span>
                    
                    ${
                        overdue ? `
                        <span class="overdue-handover-badge">
                                    متأخر
                        </span>
                        ` 
                            : ""
                    }


                </div>


                <p class="handover-item-summary">
                    ${escapeHtml(handover.summary || "-")}
                </p>


                <div class="handover-item-meta">

                    <span class="handover-meta">

                        <span class="material-symbols-rounded">
                            schedule
                        </span>

                        أُرسل:
                        ${formatDateTime(handover.createdAt)}

                    </span>


                    <span class="handover-meta">

                        <span class="material-symbols-rounded">
                            timer
                        </span>

                        الرد المتوقع:
                        ${formatDateTime(handover.expectedAcceptanceAt)}

                    </span>


                    ${
                handover.acceptedAt
                    ? `
                                <span class="handover-meta">

                                    <span class="material-symbols-rounded">
                                        check_circle
                                    </span>

                                    تم القبول:
                                    ${formatDateTime(handover.acceptedAt)}

                                </span>
                              `
                    : ""
            }


                    ${
                handover.rejectedAt
                    ? `
                                <span class="handover-meta">

                                    <span class="material-symbols-rounded">
                                        cancel
                                    </span>

                                    تم الرفض:
                                    ${formatDateTime(handover.rejectedAt)}

                                </span>
                              `
                    : ""
            }

                </div>


                ${
                handover.status ===
                "pending"
                    ? `
                            <div class="handover-item-actions">

                                <button type="button"
                                        class="small-btn edit-handover-btn"
                                        data-id="${handover.id}">

                                    <span class="material-symbols-rounded">
                                        edit
                                    </span>

                                    تعديل

                                </button>


                                <button type="button"
                                        class="small-btn danger delete-handover-btn"
                                        data-id="${handover.id}">

                                    <span class="material-symbols-rounded">
                                        delete
                                    </span>

                                    إلغاء الطلب

                                </button>

                            </div>
                          `
                    :
                    handover.status ===
                    "rejected"
                        ? `
                                <div class="handover-item-actions">

                                    <button type="button"
                                            class="small-btn danger delete-handover-btn"
                                            data-id="${handover.id}">

                                        <span class="material-symbols-rounded">
                                            delete
                                        </span>

                                        حذف من السجل

                                    </button>

                                </div>
                              `
                        : ""
            }
            `;


            sentHandoversList.appendChild(
                item
            );
        }
    );


    bindHandoverHistoryButtons();
}


// ================================
// Create Handover
// ================================

createHandoverBtn.addEventListener(
    "click",
    openCreateHandoverModal
);


function openCreateHandoverModal() {

    editingHandoverId =
        null;


    handoverForm.reset();


    handoverModalTitle.textContent =
        "تسليم الرعاية";


    handoverModalDescription.textContent =
        "اختاري مقدم الرعاية الذي سيتولى المسؤولية الحالية";


    handoverReceiverGroup.classList.remove(
        "hidden"
    );


    fixedReceiverBox.classList.add(
        "hidden"
    );


    handoverReceiver.required =
        true;


    populateHandoverReceivers();


    setMinimumExpectedAcceptance();


    clearModalMessage(
        handoverModalMessage
    );


    handoverModal.classList.remove(
        "hidden"
    );
}


function populateHandoverReceivers() {

    handoverReceiver.innerHTML = `
        <option value="">
            اختاري مقدم الرعاية
        </option>
    `;


    caregivers
        .filter(
            caregiver =>
                Number(caregiver.id) !==
                caregiverId &&
                caregiver.status ===
                "active"
        )
        .forEach(
            caregiver => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    caregiver.id;


                option.textContent =
                    `${caregiver.fullName} - ${translateRole(caregiver.role)}`;


                handoverReceiver.appendChild(
                    option
                );
            }
        );
}


// ================================
// Edit Handover
// ================================

function openEditHandoverModal(id) {

    const handover =
        sentHandovers.find(
            item =>
                Number(item.id) === id
        );


    if (
        !handover ||
        handover.status !== "pending"
    ) {

        return;
    }


    editingHandoverId =
        id;


    handoverForm.reset();


    handoverModalTitle.textContent =
        "تعديل طلب التسليم";


    handoverModalDescription.textContent =
        "يمكن تعديل ملخص التسليم ووقت الاستجابة فقط";


    /*
     * Backend prevents changing:
     * patientId
     * fromCaregiverId
     * toCaregiverId
     */
    handoverReceiverGroup.classList.add(
        "hidden"
    );


    handoverReceiver.required =
        false;


    const receiver =
        caregivers.find(
            caregiver =>
                Number(caregiver.id) ===
                Number(
                    handover.toCaregiverId
                )
        );


    fixedReceiverName.textContent =
        receiver?.fullName ||
        `مقدم الرعاية #${handover.toCaregiverId}`;


    fixedReceiverBox.classList.remove(
        "hidden"
    );


    handoverSummary.value =
        handover.summary || "";


    expectedAcceptanceAt.value =
        toDateTimeLocal(
            handover.expectedAcceptanceAt
        );


    setMinimumExpectedAcceptance();


    clearModalMessage(
        handoverModalMessage
    );


    handoverModal.classList.remove(
        "hidden"
    );
}


// ================================
// Save Handover
// ================================

handoverForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (
            !editingHandoverId &&
            currentCaregiver?.isCurrentCaregiver !==
            true
        ) {

            showModalMessage(
                handoverModalMessage,
                "فقط مقدم الرعاية المسؤول حاليًا يمكنه تسليم الرعاية",
                "error"
            );


            return;
        }


        const oldHandover =
            editingHandoverId
                ? sentHandovers.find(
                    item =>
                        Number(item.id) ===
                        editingHandoverId
                )
                : null;


        const toCaregiverId =
            editingHandoverId
                ? Number(
                    oldHandover.toCaregiverId
                )
                : Number(
                    handoverReceiver.value
                );


        if (!toCaregiverId) {

            showModalMessage(
                handoverModalMessage,
                "اختاري مقدم الرعاية المستلم",
                "error"
            );


            return;
        }


        const handover = {

            patientId:
            patientId,

            fromCaregiverId:
            caregiverId,

            toCaregiverId:
            toCaregiverId,

            summary:
                handoverSummary.value.trim(),

            createdAt:
                oldHandover?.createdAt ||
                null,

            expectedAcceptanceAt:
                normalizeDateTime(
                    expectedAcceptanceAt.value
                ),

            acceptedAt:
                oldHandover?.acceptedAt ||
                null,

            rejectedAt:
                oldHandover?.rejectedAt ||
                null,

            status:
                oldHandover?.status ||
                null,

            overdueAlertSent:
                oldHandover?.overdueAlertSent ??
                false
        };


        let url =
            "/api/v1/handover/add-handover";


        let method =
            "POST";


        if (editingHandoverId) {

            url =
                `/api/v1/handover/update-handover/${editingHandoverId}`;


            method =
                "PUT";
        }


        saveHandoverBtn.disabled =
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
                            JSON.stringify(
                                handover
                            )
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                showModalMessage(
                    handoverModalMessage,
                    result.message ||
                    "تعذر حفظ طلب التسليم",
                    "error"
                );


                return;
            }


            const wasEditing =
                editingHandoverId !==
                null;


            closeHandoverModal();


            await loadSentHandovers();


            updateHandoverAccess();


            showPageMessage(
                wasEditing
                    ? "تم تحديث طلب تسليم الرعاية بنجاح"
                    : "تم إرسال طلب تسليم الرعاية وإشعار مقدم الرعاية عبر واتساب",
                "success"
            );

        } catch (error) {

            console.error(error);


            showModalMessage(
                handoverModalMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            saveHandoverBtn.disabled =
                false;
        }
    }
);


// ================================
// Delete Handover
// ================================

async function deleteHandover(id) {

    const handover =
        sentHandovers.find(
            item =>
                Number(item.id) === id
        );


    if (!handover) {
        return;
    }


    const confirmed =
        confirm(
            handover.status === "pending"
                ? "هل تريدين إلغاء طلب تسليم الرعاية؟"
                : "هل تريدين حذف طلب التسليم من السجل؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/v1/handover/delete-handover/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await readResponse(
                response
            );


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر حذف طلب التسليم",
                "error"
            );


            return;
        }


        await loadSentHandovers();


        updateHandoverAccess();


        showPageMessage(
            handover.status ===
            "pending"
                ? "تم إلغاء طلب تسليم الرعاية"
                : "تم حذف طلب التسليم",
            "success"
        );

    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// ================================
// Handover History Buttons
// ================================

function bindHandoverHistoryButtons() {

    document
        .querySelectorAll(
            ".edit-handover-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        openEditHandoverModal(
                            Number(
                                button.dataset.id
                            )
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".delete-handover-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        deleteHandover(
                            Number(
                                button.dataset.id
                            )
                        );
                    }
                );
            }
        );
}


// ================================
// Refresh Handover State
// ================================

async function refreshHandoverPage() {

    const loaded =
        await loadCurrentCaregiver();


    if (!loaded) {
        return;
    }


    if (
        currentCaregiver.patientId
    ) {

        patientId =
            currentCaregiver.patientId;


        sessionStorage.setItem(
            "patientId",
            patientId
        );


        await loadCaregivers();


        await Promise.all([
            loadPendingHandover(),
            loadSentHandovers()
        ]);


        updateHandoverAccess();
    }
}


// ================================
// Handover Modal
// ================================

document.getElementById(
    "closeHandoverModal"
).addEventListener(
    "click",
    closeHandoverModal
);


document.getElementById(
    "cancelHandoverBtn"
).addEventListener(
    "click",
    closeHandoverModal
);


function closeHandoverModal() {

    handoverModal.classList.add(
        "hidden"
    );


    handoverForm.reset();


    editingHandoverId =
        null;


    handoverReceiver.required =
        true;


    handoverReceiverGroup.classList.remove(
        "hidden"
    );


    fixedReceiverBox.classList.add(
        "hidden"
    );


    clearModalMessage(
        handoverModalMessage
    );
}


// ================================
// Leave Patient
// ================================

document.getElementById(
    "leavePatientBtn"
).addEventListener(
    "click",
    openLeaveModal
);


function openLeaveModal() {

    clearModalMessage(
        leaveModalMessage
    );


    newPrimaryCaregiver.innerHTML = `
        <option value="">
            اختاري مقدم الرعاية
        </option>
    `;


    const otherCaregivers =
        caregivers.filter(
            caregiver =>
                Number(caregiver.id) !==
                caregiverId
        );


    if (
        currentCaregiver.role ===
        "primary" &&
        otherCaregivers.length > 0
    ) {

        newPrimarySection.classList.remove(
            "hidden"
        );


        otherCaregivers
            .filter(
                caregiver =>
                    caregiver.role ===
                    "secondary" ||
                    caregiver.role ===
                    "backup"
            )
            .forEach(
                caregiver => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        caregiver.id;


                    option.textContent =
                        `${caregiver.fullName} - ${translateRole(caregiver.role)}`;


                    newPrimaryCaregiver.appendChild(
                        option
                    );
                }
            );


        leaveWarningText.textContent =
            "أنت مقدم الرعاية الأساسي. يجب اختيار مقدم رعاية أساسي جديد قبل مغادرة المريض.";

    } else {

        newPrimarySection.classList.add(
            "hidden"
        );


        if (
            currentCaregiver.role ===
            "primary"
        ) {

            leaveWarningText.textContent =
                "أنت مقدم الرعاية الوحيد. بعد مغادرتك سيصبح المريض غير نشط.";

        } else {

            leaveWarningText.textContent =
                "سيتم إلغاء ارتباط حسابك بالمريض ولن تظهر بيانات المريض في حسابك.";
        }
    }


    leaveModal.classList.remove(
        "hidden"
    );
}


document.getElementById(
    "closeLeaveModal"
).addEventListener(
    "click",
    closeLeaveModal
);


document.getElementById(
    "cancelLeaveBtn"
).addEventListener(
    "click",
    closeLeaveModal
);


function closeLeaveModal() {

    leaveModal.classList.add(
        "hidden"
    );


    newPrimaryCaregiver.value =
        "";


    clearModalMessage(
        leaveModalMessage
    );
}


confirmLeaveBtn.addEventListener(
    "click",
    async function () {

        let newPrimaryId =
            null;


        const otherCaregivers =
            caregivers.filter(
                caregiver =>
                    Number(caregiver.id) !==
                    caregiverId
            );


        if (
            currentCaregiver.role ===
            "primary" &&
            otherCaregivers.length > 0
        ) {

            newPrimaryId =
                newPrimaryCaregiver.value;


            if (!newPrimaryId) {

                showModalMessage(
                    leaveModalMessage,
                    "اختاري مقدم الرعاية الأساسي الجديد أولًا",
                    "error"
                );


                return;
            }
        }


        confirmLeaveBtn.disabled =
            true;


        let url =
            `/api/v1/caregiver/leave-patient/${caregiverId}`;


        if (newPrimaryId) {

            url +=
                `?newPrimaryCaregiverId=${newPrimaryId}`;
        }


        try {

            const response =
                await fetch(
                    url,
                    {
                        method: "PUT"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                showModalMessage(
                    leaveModalMessage,
                    result.message ||
                    "تعذر مغادرة المريض",
                    "error"
                );


                return;
            }


            sessionStorage.removeItem(
                "patientId"
            );


            sessionStorage.setItem(
                "caregiverRole",
                "unassigned"
            );


            window.location.replace(
                "/dashboard"
            );

        } catch (error) {

            console.error(error);


            showModalMessage(
                leaveModalMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            confirmLeaveBtn.disabled =
                false;
        }
    }
);


// ================================
// Close Modals By Background
// ================================

[
    inviteModal,
    transferModal,
    leaveModal,
    handoverModal
].forEach(
    modal => {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target !== modal
                ) {

                    return;
                }


                if (
                    modal === inviteModal
                ) {

                    closeInviteModal();
                }


                if (
                    modal === transferModal
                ) {

                    closeTransferModal();
                }


                if (
                    modal === leaveModal
                ) {

                    closeLeaveModal();
                }


                if (
                    modal === handoverModal
                ) {

                    closeHandoverModal();
                }
            }
        );
    }
);


// ================================
// Helpers
// ================================

function isHandoverOverdue(handover) {

    if (
        !handover ||
        handover.status !== "pending" ||
        !handover.expectedAcceptanceAt
    ) {

        return false;
    }


    const expectedAt =
        new Date(
            handover.expectedAcceptanceAt
        );


    if (
        Number.isNaN(
            expectedAt.getTime()
        )
    ) {

        return false;
    }


    return expectedAt < new Date();
}

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


function translateHandoverStatus(
    status
) {

    switch (status) {

        case "pending":
            return "بانتظار الرد";

        case "accepted":
            return "تم القبول";

        case "rejected":
            return "تم الرفض";

        default:
            return status || "-";
    }
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


function setMinimumExpectedAcceptance() {

    expectedAcceptanceAt.min =
        getDateTimeLocalNow();
}


function getDateTimeLocalNow() {

    const now =
        new Date();


    return (
        `${now.getFullYear()}-` +
        `${padDateValue(now.getMonth() + 1)}-` +
        `${padDateValue(now.getDate())}T` +
        `${padDateValue(now.getHours())}:` +
        `${padDateValue(now.getMinutes())}`
    );
}


function padDateValue(value) {

    return String(value)
        .padStart(2, "0");
}


function showPageMessage(
    message,
    type
) {

    careTeamMessage.textContent =
        message || "";


    careTeamMessage.className =
        `form-message ${type}`;
}


function clearPageMessage() {

    careTeamMessage.textContent =
        "";


    careTeamMessage.className =
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

    element.textContent =
        "";


    element.className =
        "modal-message";
}


function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;
}