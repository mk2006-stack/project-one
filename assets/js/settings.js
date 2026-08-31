/* =========================================================
DEVORA SETTINGS — COMPLETE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


"use strict";


/* =====================================================
   STORAGE KEY
===================================================== */

const STORAGE_KEY = "devora_settings";


/* =====================================================
   DEFAULT SETTINGS
===================================================== */

const defaultSettings = {

    profile: {
        name: "Devora User",
        email: "user@devora.com",
        avatar: "",
        bio: ""
    },

    appearance: {
        theme: "light",
        accent: "red",
        compact: false,
        largeText: false,
        reduceMotion: false,
        highContrast: false
    },

    language: "English",

    notifications: {
        email: true,
        system: true,
        article: true,
        file: true,
        image: true
    },

    privacy: {
        activityStatus: true,
        profileVisibility: "private"
    },

    security: {
        twoFactor: false
    }

};


/* =====================================================
   LOAD SETTINGS
===================================================== */

function loadSettings() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {

            return structuredClone(defaultSettings);

        }

        const parsed = JSON.parse(saved);

        return deepMerge(
            structuredClone(defaultSettings),
            parsed
        );

    } catch (error) {

        console.warn(
            "Devora Settings: unable to load settings.",
            error
        );

        return structuredClone(defaultSettings);

    }

}


/* =====================================================
   DEEP MERGE
===================================================== */

function deepMerge(target, source) {

    Object.keys(source || {}).forEach(key => {

        if (
            source[key] &&
            typeof source[key] === "object" &&
            !Array.isArray(source[key])
        ) {

            if (!target[key]) {

                target[key] = {};

            }

            deepMerge(
                target[key],
                source[key]
            );

        } else {

            target[key] = source[key];

        }

    });

    return target;

}


let settings = loadSettings();


/* =====================================================
   SAVE SETTINGS
===================================================== */

function saveSettings(showMessage = true) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(settings)
        );

        if (showMessage) {

            showToast(
                "Settings saved successfully.",
                "success"
            );

        }

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to save settings.",
            "error"
        );

    }

}


/* =====================================================
   HELPER
===================================================== */

function $(selector, parent = document) {

    return parent.querySelector(selector);

}


function $$(selector, parent = document) {

    return [
        ...parent.querySelectorAll(selector)
    ];

}


function setText(selector, value) {

    const element = $(selector);

    if (element) {

        element.textContent =
            value ?? "";

    }

}


/* =====================================================
   TOAST SYSTEM
===================================================== */

function showToast(
    message,
    type = "success"
) {

    let toast =
        $(".settings-toast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.className =
            "settings-toast";

        document.body.appendChild(toast);

    }

    toast.className =
        "settings-toast";

    if (type === "error") {

        toast.classList.add(
            "settings-toast-error"
        );

    }

    if (type === "warning") {

        toast.classList.add(
            "settings-toast-warning"
        );

    }


    let icon = "ri-check-line";

    if (type === "error") {

        icon = "ri-error-warning-line";

    }

    if (type === "warning") {

        icon = "ri-alert-line";

    }


    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${escapeHTML(message)}</span>
    `;


    toast.style.display = "flex";


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(() => {

            toast.style.display =
                "none";

        }, 3000);

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================================
   APPLY THEME
===================================================== */

function applyTheme() {

    const theme =
        settings.appearance.theme;


    if (theme === "dark") {

        document.documentElement
            .setAttribute(
                "data-theme",
                "dark"
            );

    } else {

        document.documentElement
            .setAttribute(
                "data-theme",
                "light"
            );

    }


    const themeButtons =
        $$(".settings-segmented-control button[data-theme]");


    themeButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.theme === theme
        );

    });

}


/* =====================================================
   ACCENT COLORS
===================================================== */

function applyAccent() {

    const accent =
        settings.appearance.accent;


    const colors = {

        red: {
            primary: "#e53935",
            dark: "#c62828",
            light: "#ffebee"
        },

        blue: {
            primary: "#1976d2",
            dark: "#0d47a1",
            light: "#e3f2fd"
        },

        green: {
            primary: "#2e7d32",
            dark: "#1b5e20",
            light: "#e8f5e9"
        },

        purple: {
            primary: "#7b1fa2",
            dark: "#4a148c",
            light: "#f3e5f5"
        },

        orange: {
            primary: "#ef6c00",
            dark: "#e65100",
            light: "#fff3e0"
        }

    };


    const selected =
        colors[accent] ||
        colors.red;


    document.documentElement.style
        .setProperty(
            "--settings-primary",
            selected.primary
        );


    document.documentElement.style
        .setProperty(
            "--settings-primary-dark",
            selected.dark
        );


    document.documentElement.style
        .setProperty(
            "--settings-primary-light",
            selected.light
        );


    $$(".accent-option").forEach(option => {

        option.classList.toggle(
            "active",
            option.dataset.accent === accent
        );

    });

}


/* =====================================================
   ACCESSIBILITY
===================================================== */

function applyAccessibility() {

    document.documentElement
        .classList.toggle(
            "settings-large-text",
            settings.appearance.largeText
        );


    document.documentElement
        .classList.toggle(
            "settings-reduce-motion",
            settings.appearance.reduceMotion
        );


    document.documentElement
        .classList.toggle(
            "settings-high-contrast",
            settings.appearance.highContrast
        );


    document.documentElement
        .classList.toggle(
            "settings-compact",
            settings.appearance.compact
        );

}


/* =====================================================
   APPLY ALL APPEARANCE SETTINGS
===================================================== */

function applyAppearance() {

    applyTheme();

    applyAccent();

    applyAccessibility();

}


/* =====================================================
   PROFILE
===================================================== */

function applyProfile() {

    const name =
        settings.profile.name ||
        "Devora User";


    const email =
        settings.profile.email ||
        "user@devora.com";


    setText(
        ".settings-profile-name",
        name
    );


    setText(
        ".settings-profile-email",
        email
    );


    setText(
        ".settings-profile-bio",
        settings.profile.bio || ""
    );


    setText(
        ".settings-navbar-name",
        name
    );


    setText(
        ".settings-dropdown-name",
        name
    );


    setText(
        ".settings-dropdown-email",
        email
    );


    const avatar =
        settings.profile.avatar;


    $$(".settings-profile-avatar")
        .forEach(image => {

            if (avatar) {

                image.src = avatar;

            }

        });


    $$(".settings-navbar-avatar")
        .forEach(image => {

            if (avatar) {

                image.src = avatar;

            }

        });


    $$(".settings-dropdown-avatar")
        .forEach(image => {

            if (avatar) {

                image.src = avatar;

            }

        });

}


/* =====================================================
   PROFILE FORM
===================================================== */

function loadProfileForm() {

    const nameInput =
        $("#settingsProfileName");

    const emailInput =
        $("#settingsProfileEmail");

    const bioInput =
        $("#settingsProfileBio");


    if (nameInput) {

        nameInput.value =
            settings.profile.name;

    }


    if (emailInput) {

        emailInput.value =
            settings.profile.email;

    }


    if (bioInput) {

        bioInput.value =
            settings.profile.bio;

    }

}


/* =====================================================
   SAVE PROFILE
===================================================== */

function saveProfile() {

    const nameInput =
        $("#settingsProfileName");

    const emailInput =
        $("#settingsProfileEmail");

    const bioInput =
        $("#settingsProfileBio");


    if (!nameInput || !emailInput) {

        return;

    }


    const name =
        nameInput.value.trim();


    const email =
        emailInput.value.trim();


    if (!name) {

        showToast(
            "Please enter your name.",
            "warning"
        );

        nameInput.focus();

        return;

    }


    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email)
    ) {

        showToast(
            "Please enter a valid email address.",
            "warning"
        );

        emailInput.focus();

        return;

    }


    settings.profile.name =
        name;


    settings.profile.email =
        email;


    settings.profile.bio =
        bioInput
            ? bioInput.value.trim()
            : settings.profile.bio;


    saveSettings();

    applyProfile();

}


/* =====================================================
   AVATAR UPLOAD
===================================================== */

function setupAvatarUpload() {

    const avatarButtons =
        $$(".settings-avatar-edit");


    avatarButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                let input =
                    $("#settingsAvatarInput");


                if (!input) {

                    input =
                        document.createElement(
                            "input"
                        );

                    input.type =
                        "file";

                    input.id =
                        "settingsAvatarInput";

                    input.accept =
                        "image/*";

                    input.style.display =
                        "none";

                    document.body.appendChild(
                        input
                    );


                    input.addEventListener(
                        "change",
                        handleAvatarUpload
                    );

                }


                input.click();

            }
        );

    });

}


function handleAvatarUpload(event) {

    const file =
        event.target.files?.[0];


    if (!file) {

        return;

    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        showToast(
            "Please select an image.",
            "warning"
        );

        return;

    }


    if (
        file.size >
        2 * 1024 * 1024
    ) {

        showToast(
            "Avatar must be smaller than 2MB.",
            "warning"
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload = () => {

        settings.profile.avatar =
            reader.result;


        saveSettings();

        applyProfile();

    };


    reader.readAsDataURL(file);

}


/* =====================================================
   THEME EVENTS
===================================================== */

function setupTheme() {

    $$(".settings-segmented-control button[data-theme]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    settings.appearance.theme =
                        button.dataset.theme;

                    applyTheme();

                    saveSettings();

                }
            );

        });

}


/* =====================================================
   ACCENT EVENTS
===================================================== */

function setupAccent() {

    $$(".accent-option")
        .forEach(option => {

            option.addEventListener(
                "click",
                () => {

                    const accent =
                        option.dataset.accent;

                    if (!accent) {

                        return;

                    }


                    settings.appearance.accent =
                        accent;


                    applyAccent();

                    saveSettings();

                }
            );

        });

}


/* =====================================================
   SWITCH HANDLER
===================================================== */

function setupSwitches() {

    const switchMap = {

        "settingsEmailNotifications":
            ["notifications", "email"],

        "settingsSystemNotifications":
            ["notifications", "system"],

        "settingsArticleNotifications":
            ["notifications", "article"],

        "settingsFileNotifications":
            ["notifications", "file"],

        "settingsImageNotifications":
            ["notifications", "image"],

        "settingsActivityStatus":
            ["privacy", "activityStatus"],

        "settingsTwoFactor":
            ["security", "twoFactor"],

        "settingsCompactMode":
            ["appearance", "compact"],

        "settingsLargeText":
            ["appearance", "largeText"],

        "settingsReduceMotion":
            ["appearance", "reduceMotion"],

        "settingsHighContrast":
            ["appearance", "highContrast"]

    };


    Object.entries(switchMap)
        .forEach(([id, path]) => {

            const element =
                document.getElementById(id);


            if (!element) {

                return;

            }


            const [
                group,
                property
            ] = path;


            element.checked =
                Boolean(
                    settings[group][property]
                );


            element.addEventListener(
                "change",
                () => {

                    settings[group][property] =
                        element.checked;


                    applyAppearance();

                    saveSettings();

                }
            );

        });

}


/* =====================================================
   SELECTS
===================================================== */

function setupSelects() {

    const language =
        $("#settingsLanguage");


    if (language) {

        language.value =
            settings.language;


        language.addEventListener(
            "change",
            () => {

                settings.language =
                    language.value;

                saveSettings();

                showToast(
                    "Language preference updated.",
                    "success"
                );

            }
        );

    }


    const visibility =
        $("#settingsProfileVisibility");


    if (visibility) {

        visibility.value =
            settings.privacy.profileVisibility;


        visibility.addEventListener(
            "change",
            () => {

                settings.privacy.profileVisibility =
                    visibility.value;

                saveSettings();

            }
        );

    }

}


/* =====================================================
   LOAD SWITCH STATE
===================================================== */

function loadSwitchStates() {

    const switchMap = {

        settingsEmailNotifications:
            settings.notifications.email,

        settingsSystemNotifications:
            settings.notifications.system,

        settingsArticleNotifications:
            settings.notifications.article,

        settingsFileNotifications:
            settings.notifications.file,

        settingsImageNotifications:
            settings.notifications.image,

        settingsActivityStatus:
            settings.privacy.activityStatus,

        settingsTwoFactor:
            settings.security.twoFactor,

        settingsCompactMode:
            settings.appearance.compact,

        settingsLargeText:
            settings.appearance.largeText,

        settingsReduceMotion:
            settings.appearance.reduceMotion,

        settingsHighContrast:
            settings.appearance.highContrast

    };


    Object.entries(switchMap)
        .forEach(([id, value]) => {

            const element =
                document.getElementById(id);


            if (element) {

                element.checked =
                    Boolean(value);

            }

        });

}


/* =====================================================
   SEARCH
===================================================== */

function setupSearch() {

    const input =
        $("#settingsSearch");


    const clear =
        $(".settings-search-clear");


    const results =
        $(".settings-search-results");


    if (!input) {

        return;

    }


    const searchableSections = [
        {
            title: "Profile",
            description:
                "Name, email and profile picture",
            selector:
                "#settings-profile"
        },

        {
            title: "Appearance",
            description:
                "Theme, colors and interface",
            selector:
                "#settings-appearance"
        },

        {
            title: "Notifications",
            description:
                "Manage notification preferences",
            selector:
                "#settings-notifications"
        },

        {
            title: "Privacy",
            description:
                "Privacy and visibility",
            selector:
                "#settings-privacy"
        },

        {
            title: "Security",
            description:
                "Password and account security",
            selector:
                "#settings-security"
        },

        {
            title: "Storage",
            description:
                "Files, cache and data",
            selector:
                "#settings-storage"
        },

        {
            title: "Accessibility",
            description:
                "Accessibility preferences",
            selector:
                "#settings-accessibility"
        }

    ];


    function renderSearch(query) {

        if (!results) {

            return;

        }


        query =
            query
                .trim()
                .toLowerCase();


        if (!query) {

            results.innerHTML = "";

            results.style.display =
                "none";

            return;

        }


        const filtered =
            searchableSections.filter(item =>
                `${item.title} ${item.description}`
                    .toLowerCase()
                    .includes(query)
            );


        if (!filtered.length) {

            results.innerHTML = `
                <div class="settings-search-result">
                    <i class="ri-search-line"></i>
                    <div>
                        <strong>No settings found</strong>
                        <span>Try another search term.</span>
                    </div>
                </div>
            `;

            results.style.display =
                "block";

            return;

        }


        results.innerHTML =
            filtered.map(item => `
                <button
                    type="button"
                    class="settings-search-result"
                    data-target="${item.selector}"
                >
                    <i class="ri-settings-3-line"></i>

                    <div>
                        <strong>
                            ${escapeHTML(item.title)}
                        </strong>

                        <span>
                            ${escapeHTML(item.description)}
                        </span>
                    </div>
                </button>
            `).join("");


        results.style.display =
            "block";


        $$(".settings-search-result", results)
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const target =
                            $(button.dataset.target);


                        if (target) {

                            target.scrollIntoView({
                                behavior:
                                    settings.appearance.reduceMotion
                                        ? "auto"
                                        : "smooth",
                                block: "start"
                            });

                        }


                        input.value = "";

                        results.style.display =
                            "none";

                    }
                );

            });

    }


    input.addEventListener(
        "input",
        () => {

            renderSearch(
                input.value
            );

        }
    );


    if (clear) {

        clear.addEventListener(
            "click",
            () => {

                input.value = "";

                renderSearch("");

                input.focus();

            }
        );

    }


    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    ".settings-search-section"
                )
            ) {

                if (results) {

                    results.style.display =
                        "none";

                }

            }

        }
    );

}


/* =====================================================
   CATEGORY CARDS
===================================================== */

function setupCategoryCards() {

    $$(".settings-category-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const targetSelector =
                        card.dataset.target;


                    if (!targetSelector) {

                        return;

                    }


                    const target =
                        $(targetSelector);


                    if (!target) {

                        return;

                    }


                    target.scrollIntoView({
                        behavior:
                            settings.appearance.reduceMotion
                                ? "auto"
                                : "smooth",
                        block: "start"
                    });

                }
            );

        });

}


/* =====================================================
   PROFILE DROPDOWN
===================================================== */

function setupProfileDropdown() {

    const button =
        $(".settings-desktop-profile-button");


    const dropdown =
        $(".settings-profile-dropdown");


    if (!button || !dropdown) {

        return;

    }


    dropdown.style.display =
        "none";


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const visible =
                dropdown.style.display ===
                "block";


            dropdown.style.display =
                visible
                    ? "none"
                    : "block";

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !dropdown.contains(event.target) &&
                !button.contains(event.target)
            ) {

                dropdown.style.display =
                    "none";

            }

        }
    );

}


/* =====================================================
   TWO FACTOR
===================================================== */

function setupTwoFactor() {

    const checkbox =
        $("#settingsTwoFactor");


    const button =
        $("#settingsTwoFactorSetup");


    if (!checkbox || !button) {

        return;

    }


    function updateButton() {

        button.textContent =
            checkbox.checked
                ? "Manage 2FA"
                : "Set up 2FA";

    }


    updateButton();


    checkbox.addEventListener(
        "change",
        updateButton
    );


    button.addEventListener(
        "click",
        () => {

            if (!checkbox.checked) {

                showToast(
                    "Two-factor authentication setup is ready.",
                    "success"
                );

                return;

            }


            showToast(
                "Two-factor authentication management opened.",
                "success"
            );

        }
    );

}


/* =====================================================
   PASSWORD
===================================================== */

function setupPasswordButton() {

    const button =
        $("#settingsChangePassword");


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            showToast(
                "Password change panel is ready.",
                "success"
            );

        }
    );

}


/* =====================================================
   EXPORT SETTINGS
===================================================== */

function exportSettings() {

    const data = {

        exportedAt:
            new Date().toISOString(),

        application:
            "Devora",

        settings

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const anchor =
        document.createElement("a");


    anchor.href =
        url;


    anchor.download =
        "devora-settings.json";


    document.body.appendChild(
        anchor
    );


    anchor.click();


    anchor.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Settings exported successfully.",
        "success"
    );

}


/* =====================================================
   IMPORT SETTINGS
===================================================== */

function importSettings() {

    const input =
        document.createElement("input");


    input.type =
        "file";

    input.accept =
        "application/json,.json";


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];


            if (!file) {

                return;

            }


            const reader =
                new FileReader();


            reader.onload = () => {

                try {

                    const imported =
                        JSON.parse(
                            reader.result
                        );


                    const incoming =
                        imported.settings ||
                        imported;


                    settings =
                        deepMerge(
                            structuredClone(
                                defaultSettings
                            ),
                            incoming
                        );


                    saveSettings(
                        false
                    );


                    applyAll();

                    loadSwitchStates();

                    loadProfileForm();


                    showToast(
                        "Settings imported successfully.",
                        "success"
                    );

                } catch (error) {

                    console.error(error);

                    showToast(
                        "Invalid settings file.",
                        "error"
                    );

                }

            };


            reader.readAsText(file);

        }
    );


    input.click();

}


/* =====================================================
   RESET SETTINGS
===================================================== */

function resetSettings() {

    const confirmed =
        window.confirm(
            "Reset all Devora settings to their default values?"
        );


    if (!confirmed) {

        return;

    }


    settings =
        structuredClone(
            defaultSettings
        );


    saveSettings(
        false
    );


    applyAll();

    loadSwitchStates();

    loadProfileForm();


    showToast(
        "All settings have been reset.",
        "success"
    );

}


/* =====================================================
   CLEAR CACHE
===================================================== */

function clearDevoraCache() {

    const confirmed =
        window.confirm(
            "Clear Devora local cache and temporary data?"
        );


    if (!confirmed) {

        return;

    }


    const keepSettings =
        localStorage.getItem(
            STORAGE_KEY
        );


    localStorage.clear();


    if (keepSettings) {

        localStorage.setItem(
            STORAGE_KEY,
            keepSettings
        );

    }


    sessionStorage.clear();


    showToast(
        "Temporary data cleared.",
        "success"
    );

}


/* =====================================================
   DANGER BUTTONS
===================================================== */

function setupDangerZone() {

    const reset =
        $("#settingsResetButton");


    const clear =
        $("#settingsClearCacheButton");


    const exportButton =
        $("#settingsExportButton");


    const importButton =
        $("#settingsImportButton");


    if (reset) {

        reset.addEventListener(
            "click",
            resetSettings
        );

    }


    if (clear) {

        clear.addEventListener(
            "click",
            clearDevoraCache
        );

    }


    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportSettings
        );

    }


    if (importButton) {

        importButton.addEventListener(
            "click",
            importSettings
        );

    }

}


/* =====================================================
   SAVE ALL BUTTON
===================================================== */

function setupGlobalSave() {

    const buttons =
        $$("[data-settings-save]");


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                saveProfile();

                saveSettings();

            }
        );

    });

}


/* =====================================================
   SYSTEM THEME
===================================================== */

function setupSystemTheme() {

    const media =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );


    media.addEventListener?.(
        "change",
        () => {

            if (
                settings.appearance.theme ===
                "system"
            ) {

                document.documentElement
                    .setAttribute(
                        "data-theme",
                        media.matches
                            ? "dark"
                            : "light"
                    );

            }

        }
    );

}


/* =====================================================
   KEYBOARD SHORTCUT
===================================================== */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                    "k"
            ) {

                const search =
                    $("#settingsSearch");


                if (search) {

                    event.preventDefault();

                    search.focus();

                }

            }


            if (
                event.key ===
                "Escape"
            ) {

                const results =
                    $(".settings-search-results");


                if (results) {

                    results.style.display =
                        "none";

                }

            }

        }
    );

}


/* =====================================================
   PROFILE IMAGE FALLBACK
===================================================== */

function setupImageFallbacks() {

    $$(".settings-profile-avatar, .settings-navbar-avatar, .settings-dropdown-avatar")
        .forEach(image => {

            image.addEventListener(
                "error",
                () => {

                    image.style.objectFit =
                        "cover";

                }
            );

        });

}


/* =====================================================
   UPDATE MOBILE USER INFO
   This is the important part for File/Mobile profile
===================================================== */

function updateMobileUserProfile() {

    const name =
        settings.profile.name ||
        "Devora User";


    const email =
        settings.profile.email ||
        "user@devora.com";


    /*
     * We intentionally support several possible
     * class names so the Settings page can control
     * the existing mobile profile area.
     */


    const nameSelectors = [

        ".mobile-profile-name",

        ".mobile-user-name",

        ".sidebar-profile-name",

        ".profile-name",

        "[data-user-name]"

    ];


    const emailSelectors = [

        ".mobile-profile-email",

        ".mobile-user-email",

        ".sidebar-profile-email",

        ".profile-email",

        "[data-user-email]"

    ];


    const avatarSelectors = [

        ".mobile-profile-avatar",

        ".mobile-user-avatar",

        ".sidebar-profile-avatar",

        ".profile-avatar",

        "[data-user-avatar]"

    ];


    nameSelectors.forEach(
        selector => {

            $$(selector)
                .forEach(element => {

                    element.textContent =
                        name;

                });

        }
    );


    emailSelectors.forEach(
        selector => {

            $$(selector)
                .forEach(element => {

                    element.textContent =
                        email;

                });

        }
    );


    if (settings.profile.avatar) {

        avatarSelectors.forEach(
            selector => {

                $$(selector)
                    .forEach(element => {

                        if (
                            element.tagName ===
                            "IMG"
                        ) {

                            element.src =
                                settings.profile.avatar;

                        } else {

                            element.style.backgroundImage =
                                `url("${settings.profile.avatar}")`;

                        }

                    });

            }
        );

    }

}


/* =====================================================
   APPLY EVERYTHING
===================================================== */

function applyAll() {

    applyAppearance();

    applyProfile();

    updateMobileUserProfile();

}


/* =====================================================
   INITIALIZE
===================================================== */

applyAll();

loadProfileForm();

loadSwitchStates();

setupAvatarUpload();

setupTheme();

setupAccent();

setupSwitches();

setupSelects();

setupSearch();

setupCategoryCards();

setupProfileDropdown();

setupTwoFactor();

setupPasswordButton();

setupDangerZone();

setupGlobalSave();

setupSystemTheme();

setupKeyboardShortcuts();

setupImageFallbacks();


/* =====================================================
   READY
===================================================== */

document.documentElement
    .classList.add(
        "settings-ready"
    );


console.log(
    "Devora Settings initialized successfully."
);


});
