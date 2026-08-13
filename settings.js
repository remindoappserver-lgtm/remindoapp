// =====================================================
// REMINDO v1.7
// SETTINGS ENGINE
// =====================================================


// =====================================================
// DARK MODE
// =====================================================

const darkModeToggle =
    document.getElementById("darkModeToggle");


// Apply saved theme immediately

function applyTheme() {

    const darkMode =
        localStorage.getItem("darkMode") === "enabled";

    document.body.classList.toggle(
        "dark",
        darkMode
    );

    if (darkModeToggle) {

        darkModeToggle.checked =
            darkMode;

    }

}


// Apply saved theme when Settings opens

applyTheme();


// Dark mode toggle

if (darkModeToggle) {

    darkModeToggle.addEventListener(
        "change",
        () => {

            if (darkModeToggle.checked) {

                localStorage.setItem(
                    "darkMode",
                    "enabled"
                );

            }

            else {

                localStorage.setItem(
                    "darkMode",
                    "disabled"
                );

            }


            applyTheme();

        }
    );

}


// =====================================================
// NOTIFICATIONS
// =====================================================

const notificationToggle =
    document.getElementById(
        "notificationToggle"
    );


if (
    "Notification" in window &&
    Notification.permission === "granted"
) {

    if (notificationToggle) {

        notificationToggle.checked =
            true;

    }

}


if (notificationToggle) {

    notificationToggle.addEventListener(
        "change",
        () => {

            if (notificationToggle.checked) {

                if ("Notification" in window) {

                    Notification.requestPermission()
                        .then(permission => {

                            if (
                                permission ===
                                "granted"
                            ) {

                                alert(
                                    "Notifications enabled 🔔"
                                );

                            }

                            else {

                                notificationToggle.checked =
                                    false;

                            }

                        });

                }

            }

            else {

                alert(
                    "Notifications cannot be disabled from the browser. You can manage them in browser settings."
                );

                notificationToggle.checked =
                    true;

            }

        }
    );

}


// =====================================================
// EXPORT BACKUP
// =====================================================

const exportBtn =
    document.getElementById(
        "exportBtn"
    );


if (exportBtn) {

    exportBtn.addEventListener(
        "click",
        () => {

            const data =
                localStorage.getItem(
                    "reminders"
                ) || "[]";


            const blob =
                new Blob(
                    [data],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;

            link.download =
                "remindo-backup.json";


            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );


            URL.revokeObjectURL(
                url
            );


            alert(
                "Backup exported successfully ✅"
            );

        }
    );

}


// =====================================================
// IMPORT BACKUP
// =====================================================

const importBtn =
    document.getElementById(
        "importBtn"
    );

const importFile =
    document.getElementById(
        "importFile"
    );


if (importBtn && importFile) {

    importBtn.addEventListener(
        "click",
        () => {

            importFile.click();

        }
    );

}


if (importFile) {

    importFile.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (e) {

                    try {

                        const data =
                            JSON.parse(
                                e.target.result
                            );


                        if (
                            !Array.isArray(data)
                        ) {

                            throw new Error(
                                "Invalid backup format"
                            );

                        }


                        localStorage.setItem(
                            "reminders",
                            JSON.stringify(data)
                        );


                        alert(
                            "Backup restored successfully ✅"
                        );


                    }

                    catch (error) {

                        alert(
                            "Invalid backup file ❌"
                        );

                        console.error(
                            error
                        );

                    }

                };


            reader.readAsText(
                file
            );

        }
    );

}


// =====================================================
// DELETE ALL REMINDERS
// =====================================================

const clearBtn =
    document.getElementById(
        "clearBtn"
    );


if (clearBtn) {

    clearBtn.addEventListener(
        "click",
        () => {

            const confirmDelete =
                confirm(
                    "Are you sure you want to delete all reminders?"
                );


            if (confirmDelete) {

                localStorage.removeItem(
                    "reminders"
                );


                alert(
                    "All reminders deleted."
                );

            }

        }
    );

}


// =====================================================
// REMINDO SETTINGS ENGINE COMPLETE
// =====================================================
