const patientId =
    Number(sessionStorage.getItem("patientId"));

const caregiverId =
    Number(sessionStorage.getItem("caregiverId"));

let tasks = [];
let currentCaregiver = null;

let editingTaskId = null;
let completingTaskId = null;

let todayFilter = "all";
let historyFilter = "all";

const taskHistoryList =
    document.getElementById("taskHistoryList");

const emptyTaskHistory =
    document.getElementById("emptyTaskHistory");

document
    .querySelectorAll(".history-filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(".history-filter-btn")
                    .forEach(item =>
                        item.classList.remove("active")
                    );

                button.classList.add("active");

                historyFilter =
                    button.dataset.historyFilter;

                renderTaskHistory();
            }
        );
    });

function renderTaskHistory() {

    taskHistoryList.innerHTML = "";

    let historyTasks = tasks.filter(task =>
        (task.status === "completed" ||
            task.status === "cancelled") &&
        !isToday(task.dueDateTime)
    );

    if (historyFilter !== "all") {

        historyTasks =
            historyTasks.filter(
                task =>
                    task.status === historyFilter
            );
    }

    historyTasks.sort(
        (a, b) =>
            new Date(b.dueDateTime) -
            new Date(a.dueDateTime)
    );

    if (historyTasks.length === 0) {

        emptyTaskHistory.classList.remove(
            "hidden"
        );

        return;
    }

    emptyTaskHistory.classList.add(
        "hidden"
    );

    historyTasks.forEach(task => {

        taskHistoryList.appendChild(
            createTaskCard(task, false)
        );
    });
}


// =========================
// Elements
// =========================

const addTaskBtn =
    document.getElementById("addTaskBtn");

const careStatusCard =
    document.getElementById("careStatusCard");

const careStatusTitle =
    document.getElementById("careStatusTitle");

const careStatusText =
    document.getElementById("careStatusText");

const overdueSection =
    document.getElementById("overdueSection");

const overdueTasksList =
    document.getElementById("overdueTasksList");

const overdueTasksCount =
    document.getElementById("overdueTasksCount");

const overdueSectionCount =
    document.getElementById("overdueSectionCount");

const todayTasksList =
    document.getElementById("todayTasksList");

const upcomingTasksList =
    document.getElementById("upcomingTasksList");

const emptyTodayTasks =
    document.getElementById("emptyTodayTasks");

const emptyUpcomingTasks =
    document.getElementById("emptyUpcomingTasks");

const pageMessage =
    document.getElementById("pageMessage");


// Task Modal

const taskModal =
    document.getElementById("taskModal");

const taskForm =
    document.getElementById("taskForm");

const taskModalTitle =
    document.getElementById("taskModalTitle");

const taskModalDescription =
    document.getElementById("taskModalDescription");

const taskTitle =
    document.getElementById("taskTitle");

const taskDescription =
    document.getElementById("taskDescription");

const taskDueDateTime =
    document.getElementById("taskDueDateTime");

const taskPriority =
    document.getElementById("taskPriority");

const taskFormMessage =
    document.getElementById("taskFormMessage");

const saveTaskBtn =
    document.getElementById("saveTaskBtn");


// Complete Modal

const completeModal =
    document.getElementById("completeModal");

const completeTaskName =
    document.getElementById("completeTaskName");

const completeMessage =
    document.getElementById("completeMessage");

const confirmCompleteBtn =
    document.getElementById("confirmCompleteBtn");


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

    await loadCurrentCaregiver();

    await loadTasks();
}


// =========================
// Backend Response
// =========================

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


// =========================
// Logged-in Caregiver
// =========================

async function loadCurrentCaregiver() {

    try {

        const response = await fetch(
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

            return;
        }


        currentCaregiver =
            result.data;


        updateCaregiverAccess();


    } catch (error) {

        console.error(error);

        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


function updateCaregiverAccess() {

    if (!currentCaregiver) {
        return;
    }


    /*
     * Any caregiver linked to the patient
     * can add a care task.
     */
    addTaskBtn.classList.remove("hidden");


    if (
        currentCaregiver.isCurrentCaregiver === true
    ) {

        careStatusCard.classList.remove(
            "viewer"
        );


        careStatusTitle.textContent =
            "أنت مقدم الرعاية الحالي";


        careStatusText.textContent =
            "يمكنك متابعة المهام الحالية وإكمال المهام المسندة إليك خلال فترة رعايتك.";


    } else {

        careStatusCard.classList.add(
            "viewer"
        );


        careStatusTitle.textContent =
            "الرعاية حاليًا لدى مقدم رعاية آخر";


        careStatusText.textContent =
            "يمكنك إضافة مهمة للمريض ومتابعة سجل المهام، بينما تنفيذ المهام الحالية يكون لمقدم الرعاية المسؤول.";
    }
}


// =========================
// Load Patient Tasks
// =========================

async function loadTasks() {

    try {

        const response = await fetch(
            `/api/v1/care-task/get-patient-care-tasks/${patientId}`
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر تحميل مهام الرعاية",
                "error"
            );

            return;
        }


        tasks =
            Array.isArray(result.data)
                ? result.data
                : [];


        updateTaskSummary();

        renderOverdueTasks();
        renderTodayTasks();
        renderUpcomingTasks();
        renderTaskHistory();


    } catch (error) {

        console.error(error);

        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// =========================
// Task Groups
// =========================

function getOverdueTasks() {

    const now =
        new Date();


    return tasks.filter(task => {

        if (
            task.status !== "pending" ||
            !task.dueDateTime
        ) {
            return false;
        }


        const dueDate =
            new Date(task.dueDateTime);


        return (
            !Number.isNaN(dueDate.getTime()) &&
            dueDate < now
        );
    });
}


function getTodayTasks() {

    const now =
        new Date();


    return tasks.filter(task => {

        if (!isToday(task.dueDateTime)) {
            return false;
        }


        /*
         * A pending task whose time has
         * already passed belongs to the
         * overdue section instead.
         *
         * Completed and cancelled tasks
         * remain in today's history.
         */
        if (task.status === "pending") {

            const dueDate =
                new Date(task.dueDateTime);


            return dueDate >= now;
        }


        return true;
    });
}


function getUpcomingTasks() {

    const todayEnd =
        new Date();

    todayEnd.setHours(
        23,
        59,
        59,
        999
    );


    return tasks.filter(task => {

        if (
            task.status !== "pending" ||
            !task.dueDateTime
        ) {
            return false;
        }


        const dueDate =
            new Date(task.dueDateTime);


        return (
            !Number.isNaN(dueDate.getTime()) &&
            dueDate > todayEnd
        );
    });
}


// =========================
// Summary
// =========================

function updateTaskSummary() {

    const todayTasks =
        tasks.filter(task =>
            isToday(task.dueDateTime)
        );


    const todayVisiblePending =
        getTodayTasks().filter(
            task =>
                task.status === "pending"
        );


    const overdueTasks =
        getOverdueTasks();


    document.getElementById(
        "todayTotalTasks"
    ).textContent =
        todayTasks.length;


    overdueTasksCount.textContent =
        overdueTasks.length;


    document.getElementById(
        "todayPendingTasks"
    ).textContent =
        todayVisiblePending.length;


    document.getElementById(
        "todayCompletedTasks"
    ).textContent =
        todayTasks.filter(
            task =>
                task.status === "completed"
        ).length;
}


// =========================
// Today Filters
// =========================


document
    .querySelectorAll(".filter-btn:not(.history-filter-btn)")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {


                document
                    .querySelectorAll(".filter-btn:not(.history-filter-btn)")                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                todayFilter =
                    button.dataset.filter;


                renderTodayTasks();
            }
        );
    });


// =========================
// Render Overdue
// =========================

function renderOverdueTasks() {

    overdueTasksList.innerHTML = "";


    const overdueTasks =
        getOverdueTasks()
            .sort(
                (a, b) =>
                    new Date(a.dueDateTime) -
                    new Date(b.dueDateTime)
            );


    if (overdueTasks.length === 0) {

        overdueSection.classList.add(
            "hidden"
        );

        return;
    }


    overdueSection.classList.remove(
        "hidden"
    );


    overdueSectionCount.textContent =
        getOverdueCountText(
            overdueTasks.length
        );


    overdueTasks.forEach(task => {

        overdueTasksList.appendChild(
            createTaskCard(
                task,
                true
            )
        );
    });


    bindTaskButtons();
}


// =========================
// Render Today
// =========================

function renderTodayTasks() {

    todayTasksList.innerHTML = "";


    let todayTasks =
        getTodayTasks();


    if (todayFilter !== "all") {

        todayTasks =
            todayTasks.filter(
                task =>
                    task.status === todayFilter
            );
    }


    todayTasks.sort(
        (a, b) =>
            new Date(a.dueDateTime) -
            new Date(b.dueDateTime)
    );


    if (todayTasks.length === 0) {

        emptyTodayTasks.classList.remove(
            "hidden"
        );

        return;
    }


    emptyTodayTasks.classList.add(
        "hidden"
    );


    todayTasks.forEach(task => {

        todayTasksList.appendChild(
            createTaskCard(
                task,
                false
            )
        );
    });


    bindTaskButtons();
}


// =========================
// Render Upcoming
// =========================

function renderUpcomingTasks() {

    upcomingTasksList.innerHTML = "";


    const upcomingTasks =
        getUpcomingTasks()
            .sort(
                (a, b) =>
                    new Date(a.dueDateTime) -
                    new Date(b.dueDateTime)
            );


    if (upcomingTasks.length === 0) {

        emptyUpcomingTasks.classList.remove(
            "hidden"
        );

        return;
    }


    emptyUpcomingTasks.classList.add(
        "hidden"
    );


    upcomingTasks.forEach(task => {

        upcomingTasksList.appendChild(
            createTaskCard(
                task,
                false
            )
        );
    });


    bindTaskButtons();
}


// =========================
// Create Task Card
// =========================

function createTaskCard(
    task,
    isOverdue = false
) {

    const item =
        document.createElement("article");


    item.className =
        `task-item ${
            task.status === "completed"
                ? "completed-task"
                : ""
        } ${
            isOverdue
                ? "overdue-task"
                : ""
        }`;


    /*
     * Managing an existing pending task
     * remains with its current owner.
     *
     * Handover transfers pending tasks
     * to the new caregiver.
     */
    const canManageTask =
        currentCaregiver?.isCurrentCaregiver === true &&
        Number(task.caregiverId) === caregiverId &&
        task.status === "pending";
    const canCompleteTask =
        canManageTask &&
        new Date(task.dueDateTime) <= new Date();


    const caregiverText =
        Number(task.caregiverId) === caregiverId
            ? "مسجلة لديك"
            : (
                task.status === "completed"
                    ? "أُنجزت بواسطة مقدم رعاية آخر"
                    : "مسندة لمقدم الرعاية المسؤول"
            );


    item.innerHTML = `

        <div class="task-priority-line
            ${getPriorityLineClass(task.priority)}">
        </div>


        <div class="task-content">

            <div class="task-top">

                <div class="task-title-area">

                    <div class="task-title-row">

                        <h3>
                            ${escapeHtml(task.title)}
                        </h3>


                        <span class="priority-badge
                            ${getPriorityClass(task.priority)}">

                            ${translatePriority(task.priority)}

                        </span>


                        <span class="status-badge
                            ${getStatusClass(task.status)}">

                            ${translateStatus(task.status)}

                        </span>


                        ${
        isOverdue
            ? `
                                    <span class="overdue-badge">

                                        <span class="material-symbols-rounded">
                                            schedule
                                        </span>

                                        متأخرة
                                    </span>
                                  `
            : ""
    }

                    </div>


                    ${
        task.description
            ? `
                                <p class="task-description">
                                    ${escapeHtml(task.description)}
                                </p>
                              `
            : ""
    }

                </div>

            </div>


            <div class="task-meta">

                <div class="meta-item
                    ${isOverdue ? "overdue-time" : ""}">

                    <span class="material-symbols-rounded">
                        schedule
                    </span>

                    ${
        isOverdue
            ? "كان موعدها "
            : ""
    }

                    ${formatDateTime(task.dueDateTime)}

                </div>


                <div class="meta-item">

                    <span class="material-symbols-rounded">
                        person
                    </span>

                    ${caregiverText}

                </div>


                ${
        task.completedAt
            ? `
                            <div class="meta-item">

                                <span class="material-symbols-rounded">
                                    task_alt
                                </span>

                                اكتملت
                                ${formatDateTime(task.completedAt)}

                            </div>
                          `
            : ""
    }

            </div>


            ${
     
    canManageTask
    ? `
            <div class="task-actions">

                ${
        canCompleteTask
            ? `
                            <button type="button"
                                    class="small-btn complete complete-task-btn"
                                    data-id="${task.id}">

                                <span class="material-symbols-rounded">
                                    done
                                </span>

                                إكمال المهمة
                            </button>
                          `
            : ""
    }

                <button type="button"
                        class="small-btn edit-task-btn"
                        data-id="${task.id}">

                    <span class="material-symbols-rounded">
                        edit
                    </span>

                    تعديل
                </button>


                <button type="button"
                        class="small-btn danger cancel-task-btn"
                        data-id="${task.id}">

                    <span class="material-symbols-rounded">
                        cancel
                    </span>

                    إلغاء
                </button>


                <button type="button"
                        class="small-btn danger delete-task-btn"
                        data-id="${task.id}">

                    <span class="material-symbols-rounded">
                        delete
                    </span>

                    حذف
                </button>

            </div>
          `
    : ""
    }

        </div>
    `;


    return item;
}


// =========================
// Add Task
// =========================

addTaskBtn.addEventListener(
    "click",
    function () {

        if (!currentCaregiver) {

            showPageMessage(
                "تعذر التحقق من بيانات مقدم الرعاية",
                "error"
            );

            return;
        }


        if (
            currentCaregiver.patientId == null ||
            Number(currentCaregiver.patientId) !== patientId
        ) {

            showPageMessage(
                "مقدم الرعاية غير مرتبط بهذا المريض",
                "error"
            );

            return;
        }


        editingTaskId = null;


        taskForm.reset();


        taskModalTitle.textContent =
            "إضافة مهمة";


        taskModalDescription.textContent =
            "أضيفي تفاصيل المهمة المطلوبة للمريض";


        taskDueDateTime.value =
            getDateTimeLocalNow();


        clearModalMessage(
            taskFormMessage
        );


        taskModal.classList.remove(
            "hidden"
        );


        taskTitle.focus();
    }
);


// =========================
// Edit Task
// =========================

function openEditTask(id) {

    const task =
        tasks.find(
            item =>
                Number(item.id) === id
        );


    if (!task) {
        return;
    }


    if (!canManage(task)) {

        showPageMessage(
            "هذه المهمة ليست ضمن مسؤوليتك الحالية",
            "error"
        );

        return;
    }


    editingTaskId = id;


    taskModalTitle.textContent =
        "تعديل المهمة";


    taskModalDescription.textContent =
        "يمكن تعديل تفاصيل المهمة قبل إكمالها";


    taskTitle.value =
        task.title;


    taskDescription.value =
        task.description || "";


    taskDueDateTime.value =
        toDateTimeLocal(
            task.dueDateTime
        );


    taskPriority.value =
        task.priority;


    clearModalMessage(
        taskFormMessage
    );


    taskModal.classList.remove(
        "hidden"
    );
}


// =========================
// Save Task
// =========================

taskForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!currentCaregiver) {

            showModalMessage(
                taskFormMessage,
                "تعذر التحقق من بيانات مقدم الرعاية",
                "error"
            );

            return;
        }


        const oldTask =
            editingTaskId
                ? tasks.find(
                    item =>
                        Number(item.id) ===
                        editingTaskId
                )
                : null;


        if (
            oldTask &&
            !canManage(oldTask)
        ) {

            showModalMessage(
                taskFormMessage,
                "هذه المهمة ليست ضمن مسؤوليتك الحالية",
                "error"
            );

            return;
        }


        const task = {

            patientId:
            patientId,

            caregiverId:
                oldTask
                    ? oldTask.caregiverId
                    : caregiverId,

            title:
                taskTitle.value.trim(),

            description:
                taskDescription.value.trim() || null,

            dueDateTime:
                normalizeDateTime(
                    taskDueDateTime.value
                ),

            priority:
            taskPriority.value,

            status:
                oldTask
                    ? oldTask.status
                    : "pending",

            completedAt:
                oldTask
                    ? oldTask.completedAt
                    : null
        };


        let url =
            "/api/v1/care-task/add-care-task";

        let method =
            "POST";


        if (editingTaskId) {

            url =
                `/api/v1/care-task/update-care-task/${editingTaskId}`;

            method =
                "PUT";
        }


        saveTaskBtn.disabled = true;


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
                        JSON.stringify(task)
                }
            );


            const result =
                await readResponse(response);


            if (!response.ok) {

                showModalMessage(
                    taskFormMessage,
                    result.message ||
                    "تعذر حفظ المهمة",
                    "error"
                );

                return;
            }


            const wasEditing =
                editingTaskId !== null;


            closeTaskModal();


            showPageMessage(
                wasEditing
                    ? "تم تحديث المهمة بنجاح"
                    : "تمت إضافة المهمة بنجاح",
                "success"
            );


            await loadTasks();


        } catch (error) {

            console.error(error);


            showModalMessage(
                taskFormMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            saveTaskBtn.disabled = false;
        }
    }
);


// =========================
// Complete
// =========================

function openCompleteModal(id) {

    const task =
        tasks.find(
            item =>
                Number(item.id) === id
        );


    if (!task) {
        return;
    }


    if (!canManage(task)) {

        showPageMessage(
            "هذه المهمة ليست ضمن مسؤوليتك الحالية",
            "error"
        );

        return;
    }


    completingTaskId = id;


    completeTaskName.textContent =
        task.title;


    clearModalMessage(
        completeMessage
    );


    completeModal.classList.remove(
        "hidden"
    );
}


confirmCompleteBtn.addEventListener(
    "click",
    async function () {

        if (!completingTaskId) {
            return;
        }


        confirmCompleteBtn.disabled = true;


        try {

            const response = await fetch(
                `/api/v1/care-task/complete-care-task/${completingTaskId}`,
                {
                    method: "PUT"
                }
            );


            const result =
                await readResponse(response);


            if (!response.ok) {

                showModalMessage(
                    completeMessage,
                    result.message ||
                    "تعذر إكمال المهمة",
                    "error"
                );

                return;
            }


            closeCompleteModal();


            showPageMessage(
                "تم إكمال المهمة بنجاح",
                "success"
            );


            await loadTasks();


        } catch (error) {

            console.error(error);


            showModalMessage(
                completeMessage,
                "تعذر الاتصال بالخادم",
                "error"
            );

        } finally {

            confirmCompleteBtn.disabled = false;
        }
    }
);


// =========================
// Cancel
// =========================

async function cancelTask(id) {

    const task =
        tasks.find(
            item =>
                Number(item.id) === id
        );


    if (!task) {
        return;
    }


    if (!canManage(task)) {

        showPageMessage(
            "هذه المهمة ليست ضمن مسؤوليتك الحالية",
            "error"
        );

        return;
    }


    if (
        !confirm(
            `هل تريدين إلغاء مهمة "${task.title}"؟`
        )
    ) {
        return;
    }


    try {

        const response = await fetch(
            `/api/v1/care-task/cancel-care-task/${id}`,
            {
                method: "PUT"
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر إلغاء المهمة",
                "error"
            );

            return;
        }


        showPageMessage(
            "تم إلغاء المهمة",
            "success"
        );


        await loadTasks();


    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// =========================
// Delete
// =========================

async function deleteTask(id) {

    const task =
        tasks.find(
            item =>
                Number(item.id) === id
        );


    if (!task) {
        return;
    }


    if (!canManage(task)) {

        showPageMessage(
            "هذه المهمة ليست ضمن مسؤوليتك الحالية",
            "error"
        );

        return;
    }


    const confirmed =
        confirm(
            `هل تريدين حذف مهمة "${task.title}" نهائيًا؟`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/api/v1/care-task/delete-care-task/${id}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await readResponse(response);


        if (!response.ok) {

            showPageMessage(
                result.message ||
                "تعذر حذف المهمة",
                "error"
            );

            return;
        }


        showPageMessage(
            "تم حذف المهمة بنجاح",
            "success"
        );


        await loadTasks();


    } catch (error) {

        console.error(error);


        showPageMessage(
            "تعذر الاتصال بالخادم",
            "error"
        );
    }
}


// =========================
// Permission
// =========================

function canManage(task) {

    return (
        currentCaregiver?.isCurrentCaregiver === true &&
        Number(task.caregiverId) === caregiverId &&
        task.status === "pending"
    );
}


// =========================
// Bind Buttons
// =========================

function bindTaskButtons() {

    document
        .querySelectorAll(".complete-task-btn")
        .forEach(button => {

            button.onclick = () =>
                openCompleteModal(
                    Number(button.dataset.id)
                );
        });


    document
        .querySelectorAll(".edit-task-btn")
        .forEach(button => {

            button.onclick = () =>
                openEditTask(
                    Number(button.dataset.id)
                );
        });


    document
        .querySelectorAll(".cancel-task-btn")
        .forEach(button => {

            button.onclick = () =>
                cancelTask(
                    Number(button.dataset.id)
                );
        });


    document
        .querySelectorAll(".delete-task-btn")
        .forEach(button => {

            button.onclick = () =>
                deleteTask(
                    Number(button.dataset.id)
                );
        });
}


// =========================
// Task Modal
// =========================

document.getElementById(
    "closeTaskModal"
).addEventListener(
    "click",
    closeTaskModal
);


document.getElementById(
    "cancelTaskBtn"
).addEventListener(
    "click",
    closeTaskModal
);


function closeTaskModal() {

    taskModal.classList.add(
        "hidden"
    );


    taskForm.reset();


    editingTaskId = null;


    clearModalMessage(
        taskFormMessage
    );
}


// =========================
// Complete Modal
// =========================

document.getElementById(
    "closeCompleteModal"
).addEventListener(
    "click",
    closeCompleteModal
);


document.getElementById(
    "cancelCompleteBtn"
).addEventListener(
    "click",
    closeCompleteModal
);


function closeCompleteModal() {

    completeModal.classList.add(
        "hidden"
    );


    completingTaskId = null;


    clearModalMessage(
        completeMessage
    );
}


// =========================
// Close Overlay
// =========================

[
    taskModal,
    completeModal
].forEach(modal => {

    modal.addEventListener(
        "click",
        function (event) {

            if (event.target !== modal) {
                return;
            }


            if (modal === taskModal) {
                closeTaskModal();
            }


            if (modal === completeModal) {
                closeCompleteModal();
            }
        }
    );
});


// =========================
// Helpers
// =========================

function isToday(value) {

    if (!value) {
        return false;
    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return false;
    }


    const today =
        new Date();


    return (
        date.getFullYear() ===
        today.getFullYear() &&

        date.getMonth() ===
        today.getMonth() &&

        date.getDate() ===
        today.getDate()
    );
}


function getOverdueCountText(count) {

    if (count === 1) {
        return "مهمة واحدة متأخرة";
    }


    if (count === 2) {
        return "مهمتان متأخرتان";
    }


    if (
        count >= 3 &&
        count <= 10
    ) {
        return `${count} مهام متأخرة`;
    }


    return `${count} مهمة متأخرة`;
}


function translatePriority(priority) {

    const priorities = {
        low: "منخفضة",
        medium: "متوسطة",
        high: "عالية"
    };


    return priorities[priority] || priority;
}


function translateStatus(status) {

    const statuses = {
        pending: "قيد الانتظار",
        completed: "مكتملة",
        cancelled: "ملغاة"
    };


    return statuses[status] || status;
}


function getPriorityClass(priority) {

    return `priority-${priority}`;
}


function getPriorityLineClass(priority) {

    return `priority-${priority}-line`;
}


function getStatusClass(status) {

    return `status-${status}`;
}


function formatDateTime(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
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
        .padStart(
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