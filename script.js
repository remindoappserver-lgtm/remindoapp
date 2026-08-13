/* =====================================================
   REMINDO v1.6
   Smart Reminder Engine
   Never Miss What Matters.
===================================================== */

"use strict";

// =====================================================
// GLOBAL THEME
// =====================================================

(function () {

    const darkMode =
        localStorage.getItem("darkMode") === "enabled";

    if (darkMode) {

        document.body.classList.add("dark");

    }

})();

/* =====================================================
   STORAGE
===================================================== */

const STORAGE_KEY = "reminders";

let reminders =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let editingId = null;

let searchText = "";

let currentFilter = "all";

let currentSort = "nearest";


/* =====================================================
   ELEMENTS
===================================================== */

const addBtn =
    document.getElementById("addReminderBtn");

const modal =
    document.getElementById("modal");

const cancelBtn =
    document.getElementById("cancelReminder");

const saveBtn =
    document.getElementById("saveReminder");

const reminderContainer =
    document.getElementById("reminderContainer");

const searchInput =
    document.getElementById("searchInput");

const filterSelect =
    document.getElementById("filterSelect");

const sortSelect =
    document.getElementById("sortSelect");

const notificationBtn =
    document.getElementById("notificationBtn");

const settingsBtn =
    document.getElementById("settingsBtn");

const calendarBtn =
    document.getElementById("calendarBtn");

const categoryInput =
    document.getElementById("category");

const titleInput =
    document.getElementById("title");

const dueDateInput =
    document.getElementById("dueDate");

const notesInput =
    document.getElementById("notes");

const alertTimeInput =
    document.getElementById("alertTime");

const repeatInput =
    document.getElementById("repeat");


/* =====================================================
   OPEN ADD MODAL
===================================================== */

if (addBtn) {

    addBtn.addEventListener("click", () => {

        editingId = null;

        clearForm();

        setModalTitle("Add Reminder");

        if (modal) {
            modal.classList.remove("hidden");
        }

    });

}


/* =====================================================
   CLOSE MODAL
===================================================== */

if (cancelBtn) {

    cancelBtn.addEventListener("click", () => {

        closeModal();

    });

}


/* =====================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
===================================================== */

if (modal) {

    modal.addEventListener("click", (event) => {

        if (event.target === modal) {

            closeModal();

        }

    });

}


/* =====================================================
   ESC KEY CLOSES MODAL
===================================================== */

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        modal &&
        !modal.classList.contains("hidden")
    ) {

        closeModal();

    }

});


/* =====================================================
   SAVE REMINDER
===================================================== */

if (saveBtn) {

    saveBtn.addEventListener("click", () => {

        const category =
            categoryInput
                ? categoryInput.value
                : "Other";

        const title =
            titleInput
                ? titleInput.value.trim()
                : "";

        const dueDate =
            dueDateInput
                ? dueDateInput.value
                : "";

        const notes =
            notesInput
                ? notesInput.value.trim()
                : "";

        const alertTime =
            alertTimeInput
                ? alertTimeInput.value
                : "0";

        const repeat =
            repeatInput
                ? repeatInput.value
                : "none";


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (title === "") {

            alert("Please enter a reminder title.");

            if (titleInput) {
                titleInput.focus();
            }

            return;

        }


        if (dueDate === "") {

            alert("Please select a due date.");

            if (dueDateInput) {
                dueDateInput.focus();
            }

            return;

        }


        /* ---------------------------------------------
           EDIT EXISTING REMINDER
        --------------------------------------------- */

        if (editingId !== null) {

            reminders =
                reminders.map(item => {

                    if (
                        String(item.id) ===
                        String(editingId)
                    ) {

                        return {

                            ...item,

                            category,

                            title,

                            dueDate,

                            notes,

                            alertTime,

                            repeat,

                            updated:
                                new Date().toISOString(),

                            /*
                             * Reset notification status
                             * if the reminder was changed.
                             */

                            notificationSent: false

                        };

                    }

                    return item;

                });

        }


        /* ---------------------------------------------
           CREATE NEW REMINDER
        --------------------------------------------- */

        else {

            reminders.push({

                id:
                    Date.now(),

                category,

                title,

                dueDate,

                notes,

                alertTime,

                repeat,

                created:
                    new Date().toISOString(),

                updated:
                    new Date().toISOString(),

                notificationSent:
                    false

            });

        }


        /* ---------------------------------------------
           SAVE
        --------------------------------------------- */

        saveData();

        displayReminders();

        updateDashboard();

        clearForm();

        closeModal();

        editingId = null;

    });

}


/* =====================================================
   SAVE TO LOCAL STORAGE
===================================================== */

function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(reminders)
        );

    }

    catch (error) {

        console.error(
            "Unable to save Remindo data:",
            error
        );

        alert(
            "Unable to save your reminder. Please check your browser storage."
        );

    }

}


/* =====================================================
   DISPLAY REMINDERS
===================================================== */

function displayReminders() {

    if (!reminderContainer) {
        return;
    }


    reminderContainer.innerHTML = "";


    let filtered =
        reminders.filter(reminder => {

            const days =
                calculateDays(
                    reminder.dueDate
                );


            /* -----------------------------------------
               SEARCH
            ----------------------------------------- */

            const title =
                String(
                    reminder.title || ""
                ).toLowerCase();

            const category =
                String(
                    reminder.category || ""
                ).toLowerCase();

            const notes =
                String(
                    reminder.notes || ""
                ).toLowerCase();


            const searchMatch =

                title.includes(searchText) ||

                category.includes(searchText) ||

                notes.includes(searchText);


            /* -----------------------------------------
               FILTER
            ----------------------------------------- */

            let filterMatch = true;


            if (
                currentFilter ===
                "urgent"
            ) {

                filterMatch =

                    !days.expired &&

                    days.number <= 7;

            }


            else if (
                currentFilter ===
                "upcoming"
            ) {

                filterMatch =

                    !days.expired &&

                    days.number > 7;

            }


            else if (
                currentFilter ===
                "expired"
            ) {

                filterMatch =
                    days.expired;

            }


            return (
                searchMatch &&
                filterMatch
            );

        });


    /* =================================================
       SORT
    ================================================= */

    filtered.sort((a, b) => {

        if (
            currentSort ===
            "nearest"
        ) {

            return (
                new Date(a.dueDate) -
                new Date(b.dueDate)
            );

        }


        if (
            currentSort ===
            "furthest"
        ) {

            return (
                new Date(b.dueDate) -
                new Date(a.dueDate)
            );

        }


        if (
            currentSort ===
            "az"
        ) {

            return String(
                a.title || ""
            ).localeCompare(
                String(
                    b.title || ""
                )
            );

        }


        if (
            currentSort ===
            "newest"
        ) {

            return (
                Number(b.id) -
                Number(a.id)
            );

        }


        return 0;

    });


    /* =================================================
       EMPTY STATE
    ================================================= */

    if (filtered.length === 0) {

        reminderContainer.innerHTML = `

            <div class="empty-state">

                <h2>
                    ${
                        reminders.length === 0
                            ? "No Reminders Yet"
                            : "No Reminders Found"
                    }
                </h2>

                <p>
                    ${
                        reminders.length === 0
                            ? "Click + to add your first reminder."
                            : "Try changing your search or filter."
                    }
                </p>

            </div>

        `;

        return;

    }


    /* =================================================
       CREATE CARDS
    ================================================= */

    filtered.forEach(reminder => {

        const days =
            calculateDays(
                reminder.dueDate
            );


        let status =
            "safe";


        if (days.expired) {

            status =
                "expired";

        }

        else if (
            days.number <= 7
        ) {

            status =
                "urgent";

        }

        else if (
            days.number <= 30
        ) {

            status =
                "warning";

        }


        const card =
            document.createElement("div");


        card.className =
            "reminder-card " +
            status;


        const category =
            escapeHTML(
                reminder.category ||
                "Other"
            );


        const title =
            escapeHTML(
                reminder.title ||
                "Untitled Reminder"
            );


        const notes =
            escapeHTML(
                reminder.notes ||
                ""
            );


        const id =
            escapeHTML(
                String(reminder.id)
            );


        card.innerHTML = `

            <div class="card-header">

                <span class="category-icon">

                    ${getCategoryIcon(
                        reminder.category
                    )}

                </span>


                <span class="category">

                    ${category}

                </span>

            </div>


            <h2>

                ${title}

            </h2>


            <p>

                <strong>📅 Due:</strong>

                ${formatDate(
                    reminder.dueDate
                )}

            </p>


            <h3>

                ${days.text}

            </h3>


            ${
                notes
                    ? `<p>${notes}</p>`
                    : ""
            }


            <button
                type="button"
                data-edit-id="${id}"
            >

                Edit

            </button>


            <button
                type="button"
                data-delete-id="${id}"
            >

                Delete

            </button>

        `;


        /* ---------------------------------------------
           EDIT BUTTON
        --------------------------------------------- */

        const editButton =
            card.querySelector(
                "[data-edit-id]"
            );


        if (editButton) {

            editButton.addEventListener(
                "click",
                () => {

                    editReminder(
                        reminder.id
                    );

                }
            );

        }


        /* ---------------------------------------------
           DELETE BUTTON
        --------------------------------------------- */

        const deleteButton =
            card.querySelector(
                "[data-delete-id]"
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                () => {

                    deleteReminder(
                        reminder.id
                    );

                }
            );

        }


        reminderContainer.appendChild(
            card
        );

    });

}


/* =====================================================
   EDIT REMINDER
===================================================== */

function editReminder(id) {

    const reminder =
        reminders.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!reminder) {
        return;
    }


    if (categoryInput) {

        categoryInput.value =
            reminder.category ||
            "Other";

    }


    if (titleInput) {

        titleInput.value =
            reminder.title ||
            "";

    }


    if (dueDateInput) {

        dueDateInput.value =
            reminder.dueDate ||
            "";

    }


    if (notesInput) {

        notesInput.value =
            reminder.notes ||
            "";

    }


    if (alertTimeInput) {

        alertTimeInput.value =
            reminder.alertTime ||
            "0";

    }


    if (repeatInput) {

        repeatInput.value =
            reminder.repeat ||
            "none";

    }


    editingId =
        id;


    setModalTitle(
        "Edit Reminder"
    );


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


/* =====================================================
   DELETE REMINDER
===================================================== */

function deleteReminder(id) {

    const reminder =
        reminders.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!reminder) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${reminder.title}"?`
        );


    if (!confirmed) {
        return;
    }


    reminders =
        reminders.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveData();

    displayReminders();

    updateDashboard();

}


/* =====================================================
   DATE CALCULATION
===================================================== */

function calculateDays(date) {

    if (!date) {

        return {

            number: 0,

            expired: false,

            text: "No Due Date"

        };

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const expiry =
        new Date(
            `${date}T00:00:00`
        );


    expiry.setHours(
        0,
        0,
        0,
        0
    );


    const difference =
        expiry - today;


    const days =
        Math.round(
            difference /
            (1000 * 60 * 60 * 24)
        );


    /* ---------------------------------------------
       EXPIRED
    --------------------------------------------- */

    if (days < 0) {

        return {

            number:
                Math.abs(days),

            expired:
                true,

            text:
                "Expired " +
                Math.abs(days) +
                " days ago"

        };

    }


    /* ---------------------------------------------
       TODAY
    --------------------------------------------- */

    if (days === 0) {

        return {

            number: 0,

            expired: false,

            text: "Expires Today"

        };

    }


    /* ---------------------------------------------
       FUTURE
    --------------------------------------------- */

    return {

        number:
            days,

        expired:
            false,

        text:
            days +
            (
                days === 1
                    ? " Day Remaining"
                    : " Days Remaining"
            )

    };

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(date) {

    if (!date) {
        return "No Date";
    }


    const formattedDate =
        new Date(
            `${date}T00:00:00`
        );


    if (
        isNaN(
            formattedDate.getTime()
        )
    ) {

        return date;

    }


    return formattedDate.toLocaleDateString(
        "en-GB",
        {

            day:
                "2-digit",

            month:
                "long",

            year:
                "numeric"

        }
    );

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    let expired = 0;

    let week = 0;

    let month = 0;


    reminders.forEach(
        reminder => {

            const result =
                calculateDays(
                    reminder.dueDate
                );


            if (
                result.expired
            ) {

                expired++;

            }

            else if (
                result.number <= 7
            ) {

                week++;

            }

            else if (
                result.number <= 30
            ) {

                month++;

            }

        }
    );


    const totalCount =
        document.getElementById(
            "totalCount"
        );


    const weekCount =
        document.getElementById(
            "weekCount"
        );


    const monthCount =
        document.getElementById(
            "monthCount"
        );


    const expiredCount =
        document.getElementById(
            "expiredCount"
        );


    if (totalCount) {

        totalCount.innerText =
            reminders.length;

    }


    if (weekCount) {

        weekCount.innerText =
            week;

    }


    if (monthCount) {

        monthCount.innerText =
            month;

    }


    if (expiredCount) {

        expiredCount.innerText =
            expired;

    }

}


/* =====================================================
   SEARCH
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            searchText =
                searchInput.value
                    .trim()
                    .toLowerCase();


            displayReminders();

        }
    );

}


/* =====================================================
   FILTER
===================================================== */

if (filterSelect) {

    filterSelect.addEventListener(
        "change",
        () => {

            currentFilter =
                filterSelect.value;

            displayReminders();

        }
    );

}


/* =====================================================
   SORT
===================================================== */

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        () => {

            currentSort =
                sortSelect.value;

            displayReminders();

        }
    );

}


/* =====================================================
   CLEAR FORM
===================================================== */

function clearForm() {

    if (categoryInput) {

        categoryInput.selectedIndex =
            0;

    }


    if (titleInput) {

        titleInput.value =
            "";

    }


    if (dueDateInput) {

        dueDateInput.value =
            "";

    }


    if (notesInput) {

        notesInput.value =
            "";

    }


    if (alertTimeInput) {

        alertTimeInput.value =
            "0";

    }


    if (repeatInput) {

        repeatInput.value =
            "none";

    }

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }


    clearForm();

    editingId =
        null;


    setModalTitle(
        "Add Reminder"
    );

}


/* =====================================================
   MODAL TITLE
===================================================== */

function setModalTitle(title) {

    if (!modal) {
        return;
    }


    const heading =
        modal.querySelector(
            "h2"
        );


    if (heading) {

        heading.textContent =
            title;

    }

}


/* =====================================================
   CATEGORY ICONS
===================================================== */

function getCategoryIcon(category) {

    const icons = {

        "Passport":
            "🛂",

        "Visa / Residency":
            "🛂",

        "National ID":
            "🪪",

        "Vehicle Registration":
            "🚗",

        "Vehicle Insurance":
            "🚗",

        "Driving Licence":
            "🚘",

        "Trade Licence":
            "🏢",

        "Business Permit":
            "📄",

        "Company Documents":
            "🏭",

        "Employee Documents":
            "👤",

        "Contract Renewal":
            "📝",

        "Property / Lease":
            "🏠",

        "Home Maintenance":
            "🔧",

        "Utilities":
            "💡",

        "Subscriptions":
            "🔄",

        "Banking / Finance":
            "💳",

        "Tax / VAT":
            "💰",

        "Medical":
            "💉",

        "Medical Insurance":
            "💉",

        "Dental":
            "🦷",

        "Education":
            "🎓",

        "Travel":
            "✈️",

        "Memberships":
            "⭐",

        "Warranty":
            "🔧",

        "Insurance":
            "🖊️",

        "Appointments":
            "📅",

        "Personal":
            "👤",

        "Other":
            "📌"

    };


    return (
        icons[category] ||
        "📌"
    );

}


/* =====================================================
   NOTIFICATION BUTTON
===================================================== */

if (notificationBtn) {

    notificationBtn.addEventListener(
        "click",
        async () => {

            if (
                !(
                    "Notification"
                    in window
                )
            ) {

                alert(
                    "Your browser does not support notifications."
                );

                return;

            }


            if (
                Notification.permission ===
                "granted"
            ) {

                alert(
                    "Notifications are already enabled 🔔"
                );

                checkReminders();

                return;

            }


            if (
                Notification.permission ===
                "denied"
            ) {

                alert(
                    "Notifications are blocked. Please enable them in your browser settings."
                );

                return;

            }


            try {

                const permission =
                    await Notification.requestPermission();


                if (
                    permission ===
                    "granted"
                ) {

                    alert(
                        "Notifications enabled successfully 🔔"
                    );

                    checkReminders();

                }

                else {

                    alert(
                        "Notification permission denied."
                    );

                }

            }

            catch (error) {

                console.error(
                    "Notification permission error:",
                    error
                );

            }

        }
    );

}


/* =====================================================
   SETTINGS BUTTON
===================================================== */

if (settingsBtn) {

    settingsBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "settings.html";

        }
    );

}


/* =====================================================
   CALENDAR BUTTON
===================================================== */

if (calendarBtn) {

    calendarBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "calendar.html";

        }
    );

}


/* =====================================================
   SMART NOTIFICATIONS
===================================================== */

function requestNotificationPermission() {

    if (
        !(
            "Notification"
            in window
        )
    ) {

        return;

    }


    /*
     * Do not automatically request permission
     * when the page loads.
     *
     * The user can enable notifications
     * using the 🔔 button.
     */

}


/* =====================================================
   CHECK REMINDERS
===================================================== */

function checkReminders() {

    if (
        !(
            "Notification"
            in window
        )
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    let dataChanged =
        false;


    reminders.forEach(
        reminder => {

            if (!reminder.dueDate) {
                return;
            }


            const due =
                new Date(
                    `${reminder.dueDate}T00:00:00`
                );


            due.setHours(
                0,
                0,
                0,
                0
            );


            const difference =
                Math.round(
                    (
                        due -
                        today
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );


            const alertTime =
                Number(
                    reminder.alertTime ||
                    0
                );


            /*
             * -----------------------------------------
             * REMINDER ALERT
             * -----------------------------------------
             */

            if (
                difference ===
                alertTime
            ) {

                const notificationKey =
                    getNotificationKey(
                        reminder,
                        "alert"
                    );


                if (
                    !hasNotificationBeenSent(
                        notificationKey
                    )
                ) {

                    sendNotification(

                        "Remindo Reminder",

                        getNotificationMessage(
                            reminder,
                            difference
                        )

                    );


                    markNotificationSent(
                        notificationKey
                    );


                    dataChanged =
                        true;

                }

            }


            /*
             * -----------------------------------------
             * EXPIRED ALERT
             * -----------------------------------------
             *
             * Only notify once when it expires.
             */

            if (
                difference < 0
            ) {

                const notificationKey =
                    getNotificationKey(
                        reminder,
                        "expired"
                    );


                if (
                    !hasNotificationBeenSent(
                        notificationKey
                    )
                ) {

                    sendNotification(

                        "Reminder Expired",

                        reminder.title +
                        " has expired."

                    );


                    markNotificationSent(
                        notificationKey
                    );


                    dataChanged =
                        true;

                }

            }

        }
    );


    if (dataChanged) {

        saveData();

    }

}


/* =====================================================
   NOTIFICATION MESSAGE
===================================================== */

function getNotificationMessage(
    reminder,
    difference
) {

    if (
        difference === 0
    ) {

        return (
            reminder.title +
            " is due today."
        );

    }


    if (
        difference === 1
    ) {

        return (
            reminder.title +
            " is due tomorrow."
        );

    }


    if (
        difference > 1
    ) {

        return (
            reminder.title +
            " is due in " +
            difference +
            " days."
        );

    }


    return (
        reminder.title +
        " reminder."
    );

}


/* =====================================================
   NOTIFICATION KEY
===================================================== */

function getNotificationKey(
    reminder,
    type
) {

    return (
        "remindo_notification_" +
        reminder.id +
        "_" +
        reminder.dueDate +
        "_" +
        type
    );

}


/* =====================================================
   CHECK IF NOTIFICATION SENT
===================================================== */

function hasNotificationBeenSent(
    key
) {

    return (
        localStorage.getItem(
            key
        ) === "true"
    );

}


/* =====================================================
   MARK NOTIFICATION SENT
===================================================== */

function markNotificationSent(
    key
) {

    localStorage.setItem(
        key,
        "true"
    );

}


/* =====================================================
   SEND NOTIFICATION
===================================================== */

function sendNotification(
    title,
    message
) {

    if (
        !(
            "Notification"
            in window
        )
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;

    }


    try {

        new Notification(
            title,
            {

                body:
                    message,

                icon:
                    "icon-512.png",

                badge:
                    "icon-512.png"

            }
        );

    }

    catch (error) {

        console.error(
            "Unable to send notification:",
            error
        );

    }

}


/* =====================================================
   REPEATING REMINDERS
===================================================== */

function processRepeatingReminders() {

    let changed =
        false;


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    reminders.forEach(
        reminder => {

            if (
                !reminder.dueDate ||
                !reminder.repeat ||
                reminder.repeat ===
                    "none"
            ) {

                return;

            }


            let due =
                new Date(
                    `${reminder.dueDate}T00:00:00`
                );


            due.setHours(
                0,
                0,
                0,
                0
            );


            /*
             * Only move repeating reminders
             * forward when they have passed.
             */

            if (
                due >= today
            ) {

                return;

            }


            let safety =
                0;


            while (
                due < today &&
                safety < 120
            ) {

                if (
                    reminder.repeat ===
                    "monthly"
                ) {

                    due.setMonth(
                        due.getMonth() +
                        1
                    );

                }


                else if (
                    reminder.repeat ===
                    "yearly"
                ) {

                    due.setFullYear(
                        due.getFullYear() +
                        1
                    );

                }


                else {

                    break;

                }


                safety++;

            }


            const newDate =
                formatDateForInput(
                    due
                );


            if (
                newDate !==
                reminder.dueDate
            ) {

                reminder.dueDate =
                    newDate;


                reminder.updated =
                    new Date().toISOString();


                /*
                 * The next cycle should be
                 * allowed to send a new notification.
                 */

                removeNotificationRecords(
                    reminder.id
                );


                changed =
                    true;

            }

        }
    );


    if (changed) {

        saveData();

    }

}


/* =====================================================
   REMOVE OLD NOTIFICATION RECORDS
===================================================== */

function removeNotificationRecords(
    reminderId
) {

    const prefix =
        "remindo_notification_" +
        reminderId +
        "_";


    const keysToRemove =
        [];


    for (
        let i = 0;
        i < localStorage.length;
        i++
    ) {

        const key =
            localStorage.key(i);


        if (
            key &&
            key.startsWith(prefix)
        ) {

            keysToRemove.push(
                key
            );

        }

    }


    keysToRemove.forEach(
        key => {

            localStorage.removeItem(
                key
            );

        }
    );

}


/* =====================================================
   FORMAT DATE FOR INPUT
===================================================== */

function formatDateForInput(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   START REMINDO
===================================================== */

/*
 * Process recurring reminders first.
 */

processRepeatingReminders();


/*
 * Display reminders.
 */

displayReminders();


/*
 * Update dashboard.
 */

updateDashboard();


/*
 * Prepare notification system.
 *
 * We intentionally do NOT ask for
 * notification permission automatically.
 */

requestNotificationPermission();


/*
 * If notification permission was
 * already granted, check reminders.
 */

if (
    "Notification" in window &&
    Notification.permission ===
        "granted"
) {

    checkReminders();

}


/*
 * Check notifications every 60 seconds.
 */

setInterval(
    () => {

        processRepeatingReminders();

        displayReminders();

        updateDashboard();

        checkReminders();

    },
    60000
);


/* =====================================================
   REMINDO v1.6 COMPLETE
===================================================== */
