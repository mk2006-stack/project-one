"use strict";

/*
=========================================================
DEVORA SETTINGS
Central settings controller
=========================================================
*/

const DEVORA_SETTINGS_KEY = "devora_settings";

const DEVORA_DEFAULT_SETTINGS = {

    profile: {
        name: "Devora User",
        username: "devorauser",
        email: "user@devora.com",
        role: "User",
        bio: "",
        avatar: ""
    },

    appearance: {
        theme: "light",
        accent: "red",
        density: "comfortable",
        animations: true
    },

    navigation: {
        rememberLastPage: true,
        compact: false,
        showProfile: true
    },

    files: {
        view: "grid",
        sort: "name",
        confirmDelete: true
    },

    images: {
        thumbnailSize: "medium",
        autoPreview: true,
        sort: "name"
    },

    articles: {
        autoSave: true,
        confirmDelete: true,
        editor: "standard"
    },

    notifications: {
        enabled: true,
        duration: 3000,
        sound: true
    },

    region: {
        language: "en",
        timezone: "system",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24"
    },

    accessibility: {
        largeText: false,
        highContrast: false,
        reduceMotion: false,
        keyboardNavigation: true
    }
};


/* =====================================================
   HELPERS
===================================================== */

function devoraDeepMerge(base, extra) {

    const result = {
        ...base
    };

    Object.keys(extra || {}).forEach(key => {

        if (
            extra[key] &&
            typeof extra[key] === "object" &&
            !Array.isArray(extra[key]) &&
            typeof base[key] === "object"
        ) {

            result[key] =
                devoraDeepMerge(
                    base[key],
                    extra[key]
                );

        } else {

            result[key] = extra[key];

        }

    });

    return result;
}


function getDevoraSettings() {

    try {

        const saved =
            localStorage.getItem(
                DEVORA_SETTINGS_KEY
            );

        if (!saved) {

            return structuredClone(
                DEVORA_DEFAULT_SETTINGS
            );

        }

        return devoraDeepMerge(
            DEVORA_DEFAULT_SETTINGS,
            JSON.parse(saved)
        );

    } catch (error) {

        console.error(
            "Devora settings load error:",
            error
        );

        return structuredClone(
            DEVORA_DEFAULT_SETTINGS
        );

    }

}


/* =====================================================
   GLOBAL SETTINGS API
===================================================== */

window.DevoraSettings = {

    get() {

        return getDevoraSettings();

    },

    save(settings) {

        localStorage.setItem(
            DEVORA_SETTINGS_KEY,
            JSON.stringify(settings)
        );

        window.dispatchEvent(
            new CustomEvent(
                "devora-settings-changed",
                {
                    detail: settings
                }
            )
        );

    },

    update(section, values) {

        const settings =
            getDevoraSettings();

        settings[section] = {
            ...settings[section],
            ...values
        };

        this.save(settings);

        return settings;

    }

};


/* =====================================================
   ALPINE SETTINGS
===================================================== */

function settingsData() {

    return {

        profile: structuredClone(
            DEVORA_DEFAULT_SETTINGS.profile
        ),

        appearance: structuredClone(
            DEVORA_DEFAULT_SETTINGS.appearance
        ),

        navigation: structuredClone(
            DEVORA_DEFAULT_SETTINGS.navigation
        ),

        files: structuredClone(
            DEVORA_DEFAULT_SETTINGS.files
        ),

        images: structuredClone(
            DEVORA_DEFAULT_SETTINGS.images
        ),

        articles: structuredClone(
            DEVORA_DEFAULT_SETTINGS.articles
        ),

        notifications: structuredClone(
            DEVORA_DEFAULT_SETTINGS.notifications
        ),

        region: structuredClone(
            DEVORA_DEFAULT_SETTINGS.region
        ),

        accessibility: structuredClone(
            DEVORA_DEFAULT_SETTINGS.accessibility
        ),


        /* SEARCH */

        searchQuery: "",

        searchResults: [],

        searchItems: [

            {
                id: "profile",
                title: "Profile",
                description: "Manage your profile information"
            },

            {
                id: "profile-details",
                title: "Profile Details",
                description: "Edit your name, username, email and bio"
            },

            {
                id: "appearance",
                title: "Appearance",
                description: "Theme, accent color, density and animations"
            },

            {
                id: "navigation",
                title: "Navigation",
                description: "Navigation and sidebar preferences"
            },

            {
                id: "files-preferences",
                title: "Files",
                description: "File view, sorting and delete preferences"
            },

            {
                id: "images-preferences",
                title: "Images",
                description: "Image thumbnails and preview preferences"
            },

            {
                id: "articles-preferences",
                title: "Articles",
                description: "Article editor and saving preferences"
            },

            {
                id: "notifications",
                title: "Notifications",
                description: "Notification settings and sound"
            },

            {
                id: "security",
                title: "Security",
                description: "Password, sessions and two-factor authentication"
            },

            {
                id: "data-storage",
                title: "Data & Storage",
                description: "Manage application data and storage"
            },

            {
                id: "language-region",
                title: "Language & Region",
                description: "Language, timezone and date settings"
            },

            {
                id: "accessibility",
                title: "Accessibility",
                description: "Accessibility and display options"
            }

        ],


        /* STORAGE */

        storage: {

            localStorageSize: "0 KB",

            imageCount: 0,

            articleCount: 0,

            fileCount: 0

        },


        /* TOAST */

        toast: {

            visible: false,

            message: "",

            icon: "check_circle",

            type: "success",

            timer: null

        },


        /* PROFILE MENU */

        profileMenuOpen: false,


        /* =================================================
           INIT
        ================================================= */

        async init() {

            const saved =
                getDevoraSettings();

            this.profile =
                structuredClone(
                    saved.profile
                );

            this.appearance =
                structuredClone(
                    saved.appearance
                );

            this.navigation =
                structuredClone(
                    saved.navigation
                );

            this.files =
                structuredClone(
                    saved.files
                );

            this.images =
                structuredClone(
                    saved.images
                );

            this.articles =
                structuredClone(
                    saved.articles
                );

            this.notifications =
                structuredClone(
                    saved.notifications
                );

            this.region =
                structuredClone(
                    saved.region
                );

            this.accessibility =
                structuredClone(
                    saved.accessibility
                );

            await this.updateStorageInfo();

            this.applySettings();

        },


        /* =================================================
           PROFILE
        ================================================= */

        toggleProfileMenu() {

            this.profileMenuOpen =
                !this.profileMenuOpen;

        },


        saveProfile() {

            if (
                !this.profile.name ||
                !this.profile.name.trim()
            ) {

                this.showToast(
                    "Name cannot be empty",
                    "error"
                );

                return;

            }

            this.saveSection(
                "profile",
                this.profile
            );

            localStorage.setItem(
                "devora_user_name",
                this.profile.name
            );

            this.showToast(
                "Profile saved successfully",
                "check_circle"
            );

        },


        /* =================================================
           AVATAR
        ================================================= */

        openAvatarPicker() {

            const input =
                document.getElementById(
                    "avatarInput"
                );

            if (input) {

                input.click();

            }

        },


        handleAvatarChange(event) {

            const file =
                event?.target?.files?.[0];

            if (!file) {
                return;
            }

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                this.showToast(
                    "Please select an image",
                    "error"
                );

                return;

            }

            const reader =
                new FileReader();

            reader.onload = () => {

                this.profile.avatar =
                    reader.result;

                this.saveSection(
                    "profile",
                    this.profile
                );

                this.showToast(
                    "Profile picture updated",
                    "check_circle"
                );

            };

            reader.onerror = () => {

                this.showToast(
                    "Unable to load image",
                    "error"
                );

            };

            reader.readAsDataURL(file);

        },


        /* =================================================
           APPEARANCE
        ================================================= */

        setTheme(theme) {

            if (
                ![
                    "light",
                    "dark",
                    "system"
                ].includes(theme)
            ) {

                return;

            }

            this.appearance.theme =
                theme;

            this.saveSection(
                "appearance",
                this.appearance
            );

            this.applySettings();

            this.showToast(
                "Theme updated",
                "check_circle"
            );

        },


        setAccent(accent) {

            if (
                ![
                    "red",
                    "blue",
                    "green",
                    "yellow",
                    "purple",
                    "orange",
                    "pink",
                    "cyan",
                    "teal"
                ].includes(accent)
            ) {

                return;

            }

            this.appearance.accent =
                accent;

            this.saveSection(
                "appearance",
                this.appearance
            );

            this.applySettings();

            this.showToast(
                "Accent color updated",
                "check_circle"
            );

        },


        setDensity(density) {

            if (
                ![
                    "comfortable",
                    "compact"
                ].includes(density)
            ) {

                return;

            }

            this.appearance.density =
                density;

            this.saveSection(
                "appearance",
                this.appearance
            );

            this.applySettings();

            this.showToast(
                "Interface density updated",
                "check_circle"
            );

        },


        saveAppearance() {

            this.saveSection(
                "appearance",
                this.appearance
            );

            this.applySettings();

        },


        /* =================================================
           OTHER SETTINGS
        ================================================= */

        saveNavigation() {

            this.saveSection(
                "navigation",
                this.navigation
            );

            this.applySettings();

        },


        saveFiles() {

            this.saveSection(
                "files",
                this.files
            );

            this.applySettings();

        },


        saveImages() {

            this.saveSection(
                "images",
                this.images
            );

            this.applySettings();

        },


        saveArticles() {

            this.saveSection(
                "articles",
                this.articles
            );

            this.applySettings();

        },


        saveNotifications() {

            this.saveSection(
                "notifications",
                this.notifications
            );

        },


        saveRegion() {

            this.saveSection(
                "region",
                this.region
            );

        },


        saveAccessibility() {

            this.saveSection(
                "accessibility",
                this.accessibility
            );

            this.applySettings();

        },


        saveSection(section, data) {

            window.DevoraSettings.update(
                section,
                data
            );

        },


        /* =================================================
           APPLY
        ================================================= */

        applySettings() {

            const settings =
                getDevoraSettings();

            this.applyTheme(
                settings.appearance.theme
            );

            this.applyAccent(
                settings.appearance.accent
            );

            this.applyAccessibility(
                settings.accessibility
            );

            this.applyDensity(
                settings.appearance.density
            );

        },


        applyTheme(theme) {

            let finalTheme =
                theme;

            if (
                theme === "system"
            ) {

                finalTheme =
                    window.matchMedia(
                        "(prefers-color-scheme: dark)"
                    ).matches
                        ? "dark"
                        : "light";

            }

            document.documentElement
                .setAttribute(
                    "data-theme",
                    finalTheme
                );

            document.documentElement
                .classList.toggle(
                    "devora-dark",
                    finalTheme === "dark"
                );

            document.body.classList.toggle(
                "dark-mode",
                finalTheme === "dark"
            );

        },


        applyAccent(accent) {

            document.documentElement
                .setAttribute(
                    "data-accent",
                    accent
                );

            document.body
                .setAttribute(
                    "data-accent",
                    accent
                );

        },


        applyDensity(density) {

            document.documentElement
                .setAttribute(
                    "data-density",
                    density
                );

        },


        applyAccessibility(settings) {

            document.documentElement
                .classList.toggle(
                    "devora-large-text",
                    settings.largeText
                );

            document.documentElement
                .classList.toggle(
                    "devora-high-contrast",
                    settings.highContrast
                );

            document.documentElement
                .classList.toggle(
                    "devora-reduce-motion",
                    settings.reduceMotion
                );

            document.documentElement
                .classList.toggle(
                    "devora-keyboard-navigation",
                    settings.keyboardNavigation
                );

        },


        /* =================================================
           SEARCH
        ================================================= */

        searchSettings() {

            const query =
                String(
                    this.searchQuery || ""
                )
                    .trim()
                    .toLowerCase();

            if (!query) {

                this.searchResults = [];

                return;

            }

            this.searchResults =
                this.searchItems.filter(
                    item =>

                        item.title
                            .toLowerCase()
                            .includes(query)

                        ||

                        item.description
                            .toLowerCase()
                            .includes(query)
                );

        },


        clearSearch() {

            this.searchQuery = "";

            this.searchResults = [];

        },


        openSearchResult(result) {

            if (!result) {
                return;
            }

            this.clearSearch();

            this.$nextTick(() => {

                this.scrollToSection(
                    result.id
                );

            });

        },


        scrollToSection(sectionId) {

            const element =
                document.getElementById(
                    sectionId
                );

            if (!element) {
                return;
            }

            element.scrollIntoView({
                behavior:
                    this.accessibility.reduceMotion
                        ? "auto"
                        : "smooth",
                block: "start"
            });

            history.replaceState(
                null,
                "",
                "#" + sectionId
            );

        },


        /* =================================================
           SECURITY
        ================================================= */

        showSecurityMessage(title) {

            this.showToast(
                title +
                " is not connected yet",
                "info"
            );

        },


        /* =================================================
           EXPORT
        ================================================= */

        async exportData() {

            try {

                const settings =
                    getDevoraSettings();

                const articles =
                    JSON.parse(
                        localStorage.getItem(
                            "devora_articles"
                        ) || "[]"
                    );

                const customUsers =
                    JSON.parse(
                        localStorage.getItem(
                            "devora_custom_users"
                        ) || "[]"
                    );

                const exportObject = {

                    devora: true,

                    version: 1,

                    exportedAt:
                        new Date().toISOString(),

                    settings,

                    articles,

                    customUsers

                };

                const blob =
                    new Blob(
                        [
                            JSON.stringify(
                                exportObject,
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
                    URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    "devora-backup.json";

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                URL.revokeObjectURL(
                    url
                );

                this.showToast(
                    "Devora backup exported",
                    "download"
                );

            } catch (error) {

                console.error(error);

                this.showToast(
                    "Unable to export data",
                    "error"
                );

            }

        },


        /* =================================================
           IMPORT
        ================================================= */

        openImportPicker() {

            const input =
                document.getElementById(
                    "importDataInput"
                );

            if (input) {

                input.click();

            }

        },


        async importData(event) {

            const file =
                event?.target?.files?.[0];

            if (!file) {
                return;
            }

            try {

                const text =
                    await file.text();

                const imported =
                    JSON.parse(text);

                if (
                    !imported ||
                    typeof imported !==
                    "object"
                ) {

                    throw new Error(
                        "Invalid backup"
                    );

                }

                const settings =
                    imported.settings ||
                    imported;

                localStorage.setItem(
                    DEVORA_SETTINGS_KEY,
                    JSON.stringify(
                        devoraDeepMerge(
                            DEVORA_DEFAULT_SETTINGS,
                            settings
                        )
                        )
                    );

                if (
                    Array.isArray(
                        imported.articles
                    )
                ) {

                    localStorage.setItem(
                        "devora_articles",
                        JSON.stringify(
                            imported.articles
                        )
                    );

                }

                if (
                    Array.isArray(
                        imported.customUsers
                    )
                ) {

                    localStorage.setItem(
                        "devora_custom_users",
                        JSON.stringify(
                            imported.customUsers
                        )
                    );

                }

                await this.init();

                this.showToast(
                    "Devora backup imported successfully",
                    "check_circle"
                );

                setTimeout(() => {

                    location.reload();

                }, 500);

            } catch (error) {

                console.error(
                    "Import error:",
                    error
                );

                this.showToast(
                    "Invalid Devora backup file",
                    "error"
                );

            } finally {

                event.target.value = "";

            }

        },


        /* =================================================
           CACHE
        ================================================= */

        async clearCache() {

            const message =
                "Clear Devora cache?\n\n" +
                "This will remove temporary/cache data only.\n\n" +
                "Your images, files, articles, users and settings will NOT be deleted.";

            const confirmed =
                window.confirm(
                    message
                );

            if (!confirmed) {
                return;
            }

            const cacheKeys = [

                "devora_users_cache"

            ];

            cacheKeys.forEach(
                key => {
                    localStorage.removeItem(
                        key
                    );
                }
            );

            sessionStorage.clear();

            if (
                "caches" in window
            ) {

                try {

                    const keys =
                        await caches.keys();

                    await Promise.all(
                        keys.map(
                            key =>
                                caches.delete(
                                    key
                                )
                        )
                    );

                } catch (error) {

                    console.warn(
                        "CacheStorage clear failed:",
                        error
                    );

                }

            }

            await this.updateStorageInfo();

            this.showToast(
                "Cache cleared. Your data was kept.",
                "check_circle"
            );

        },


        /* =================================================
           RESET
        ================================================= */

        resetPreferences() {

            const confirmed =
                window.confirm(
                    "Reset all Devora preferences?\n\nYour articles, files, images and users will remain."
                );

            if (!confirmed) {
                return;
            }

            localStorage.removeItem(
                DEVORA_SETTINGS_KEY
            );

            location.reload();

        },


        resetApplication() {

            const confirmed =
                window.confirm(
                    "WARNING!\n\nThis will delete Devora application data and preferences.\n\nAre you sure?"
                );

            if (!confirmed) {
                return;
            }

            localStorage.clear();

            sessionStorage.clear();

            location.reload();

        },


        /* =================================================
           STORAGE
        ================================================= */

        async updateStorageInfo() {

            try {

                this.storage.articleCount =
                    this.getArticleCount();

                this.storage.imageCount =
                    await this.getIndexedDBCount(
                        "DevoraImagesDB",
                        "images"
                    );

                this.storage.fileCount =
                    await this.getIndexedDBCount(
                        "DevoraFilesDB",
                        "files"
                    );

                let bytes = 0;

                for (
                    let i = 0;
                    i < localStorage.length;
                    i++
                ) {

                    const key =
                        localStorage.key(i);

                    const value =
                        localStorage.getItem(
                            key
                        ) || "";

                    bytes +=
                        (
                            key.length +
                            value.length
                        ) * 2;

                }

                this.storage.localStorageSize =
                    this.formatBytes(
                        bytes
                    );

            } catch (error) {

                console.error(
                    "Storage information error:",
                    error
                );

            }

        },


        getArticleCount() {

            try {

                const articles =
                    JSON.parse(
                        localStorage.getItem(
                            "devora_articles"
                        ) || "[]"
                    );

                return Array.isArray(
                    articles
                )
                    ? articles.length
                    : 0;

            } catch {

                return 0;

            }

        },


        getIndexedDBCount(
            databaseName,
            storeName
        ) {

            return new Promise(
                resolve => {

                    if (
                        !window.indexedDB
                    ) {

                        resolve(0);

                        return;

                    }

                    const request =
                        indexedDB.open(
                            databaseName
                        );

                    request.onsuccess =
                        event => {

                            const db =
                                event.target.result;

                            if (
                                !db.objectStoreNames
                                    .contains(
                                        storeName
                                    )
                            ) {

                                db.close();

                                resolve(0);

                                return;

                            }

                            const transaction =
                                db.transaction(
                                    storeName,
                                    "readonly"
                                );

                            const store =
                                transaction
                                    .objectStore(
                                        storeName
                                    );

                            const countRequest =
                                store.count();

                            countRequest.onsuccess =
                                () => {

                                    const count =
                                        countRequest.result;

                                    db.close();

                                    resolve(
                                        count
                                    );

                                };

                            countRequest.onerror =
                                () => {

                                    db.close();

                                    resolve(0);

                                };

                        };

                    request.onerror =
                        () => {

                            resolve(0);

                        };

                }
            );

        },


        formatBytes(bytes) {

            if (
                !bytes ||
                bytes <= 0
            ) {

                return "0 KB";

            }

            const units = [
                "B",
                "KB",
                "MB",
                "GB"
            ];

            const index =
                Math.min(
                    Math.floor(
                        Math.log(bytes) /
                        Math.log(1024)
                    ),
                    units.length - 1
                );

            return (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(1)
            + " "
            + units[index];

        },


        /* =================================================
           TOAST
        ================================================= */

        showToast(
            message,
            icon = "check_circle",
            type = "success"
        ) {

            clearTimeout(
                this.toast.timer
            );

            this.toast.message =
                message;

            this.toast.icon =
                icon;

            this.toast.type =
                type;

            this.toast.visible =
                true;

            this.toast.timer =
                setTimeout(() => {

                    this.toast.visible =
                        false;

                }, 3000);

        }

    };

}