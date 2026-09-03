"use strict";

/* =========================================================
   DEVORA GLOBAL MAIN
   - Materialize mobile sidenav
   - Global theme
   - Global accent
   - Accessibility
   - Navigation preferences
   - File / Image preferences
========================================================= */

(function () {

    const SETTINGS_KEY = "devora_settings";


    /* =====================================================
       LOAD SETTINGS
    ===================================================== */

    function getSettings() {

        const defaults = {

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

            accessibility: {
                largeText: false,
                highContrast: false,
                reduceMotion: false,
                keyboardNavigation: true
            }

        };


        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        SETTINGS_KEY
                    ) || "{}"
                );


            return {

                ...defaults,

                ...saved,

                appearance: {
                    ...defaults.appearance,
                    ...(saved.appearance || {})
                },

                navigation: {
                    ...defaults.navigation,
                    ...(saved.navigation || {})
                },

                files: {
                    ...defaults.files,
                    ...(saved.files || {})
                },

                images: {
                    ...defaults.images,
                    ...(saved.images || {})
                },

                articles: {
                    ...defaults.articles,
                    ...(saved.articles || {})
                },

                accessibility: {
                    ...defaults.accessibility,
                    ...(saved.accessibility || {})
                }

            };

        } catch (error) {

            console.warn(
                "Devora: unable to load settings.",
                error
            );

            return defaults;

        }

    }

    function applyProfileToSidenav() {

    let settings = null;

    try {

        settings = JSON.parse(
            localStorage.getItem(
                SETTINGS_KEY
            ) || "{}"
        );

    } catch (error) {

        console.warn(
            "Devora: unable to load profile.",
            error
        );

        return;
    }


    const profile =
        settings.profile || {};


    const name =
        profile.name ||
        "Devora User";


    const email =
        profile.email ||
        "user@devora.com";


    const avatar =
        profile.avatar ||
        "assets/images/Avatar.jpg";


    document
        .querySelectorAll(
            ".sidenav .user-view"
        )
        .forEach(userView => {

            const nameElement =
                userView.querySelector(
                    ".name"
                );


            const emailElement =
                userView.querySelector(
                    ".email"
                );


            const avatarElement =
                userView.querySelector(
                    ".circle"
                );


            if (nameElement) {

                nameElement.textContent =
                    name;

            }


            if (emailElement) {

                emailElement.textContent =
                    email;

            }


            if (avatarElement) {

                avatarElement.src =
                    avatar;

            }

        });

}

    /* =====================================================
       MOBILE SIDENAV
       THIS PART MUST NOT BE REMOVED
    ===================================================== */

    function initMobileNavigation() {

        if (
            !window.M ||
            !M.Sidenav
        ) {

            console.warn(
                "Devora: Materialize Sidenav is unavailable."
            );

            return;

        }


        const elements =
            document.querySelectorAll(
                ".sidenav"
            );


        if (!elements.length) {

            return;

        }


        const instances =
            M.Sidenav.init(
                elements,
                {
                    edge: "left",
                    draggable: true
                }
            );


        /*
         * Extra fallback.
         * If Materialize trigger does not automatically
         * find the instance, open it manually.
         */

        document
            .querySelectorAll(
                ".sidenav-trigger"
            )
            .forEach(trigger => {

                trigger.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        const targetId =
                            this.getAttribute(
                                "data-target"
                            );

                        if (!targetId) {
                            return;
                        }


                        const target =
                            document.getElementById(
                                targetId
                            );

                        if (!target) {
                            return;
                        }


                        const instance =
                            M.Sidenav.getInstance(
                                target
                            );


                        if (instance) {

                            instance.open();

                        }

                    }
                );

            });

    }


    /* =====================================================
       THEME
    ===================================================== */

    function applyTheme(settings) {

        let theme =
            settings.appearance.theme;


        if (theme === "system") {

            theme =
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches
                    ? "dark"
                    : "light";

        }


        document.documentElement
            .setAttribute(
                "data-theme",
                theme
            );


        document.body
            .setAttribute(
                "data-theme",
                theme
            );


        document.documentElement
            .classList.toggle(
                "devora-dark",
                theme === "dark"
            );

    }


    /* =====================================================
       ACCENT
    ===================================================== */

    function applyAccent(settings) {

        const allowed = [
            "red",
            "blue",
            "green",
            "yellow",
            "purple",
            "orange",
            "pink",
            "cyan",
            "teal"
        ];


        const accent =
            allowed.includes(
                settings.appearance.accent
            )
                ? settings.appearance.accent
                : "red";


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

    }


    /* =====================================================
       ACCESSIBILITY
    ===================================================== */

    function applyAccessibility(settings) {

        const root =
            document.documentElement;


        root.classList.toggle(
            "devora-large-text",
            !!settings.accessibility.largeText
        );


        root.classList.toggle(
            "devora-high-contrast",
            !!settings.accessibility.highContrast
        );


        root.classList.toggle(
            "devora-reduce-motion",
            !!settings.accessibility.reduceMotion
        );


        root.classList.toggle(
            "devora-keyboard-navigation",
            !!settings.accessibility.keyboardNavigation
        );


        root.classList.toggle(
            "devora-no-animations",
            settings.appearance.animations === false
        );

    }


    /* =====================================================
       DENSITY
    ===================================================== */

    function applyDensity(settings) {

        document.documentElement
            .setAttribute(
                "data-density",
                settings.appearance.density
            );


        document.documentElement
            .classList.toggle(
                "devora-compact-navigation",
                !!settings.navigation.compact
            );


        document.documentElement
            .classList.toggle(
                "devora-hide-profile-info",
                settings.navigation.showProfile === false
            );

    }


    /* =====================================================
       FILE VIEW
    ===================================================== */

    function applyFileSettings(settings) {

        document.documentElement
            .setAttribute(
                "data-files-view",
                settings.files.view
            );

    }


    /* =====================================================
       IMAGE THUMBNAIL
    ===================================================== */

    function applyImageSettings(settings) {

        document.documentElement
            .setAttribute(
                "data-thumbnail-size",
                settings.images.thumbnailSize
            );

    }


    /* =====================================================
       ARTICLE EDITOR
    ===================================================== */

    function applyArticleSettings(settings) {

        document.documentElement
            .setAttribute(
                "data-article-editor",
                settings.articles.editor
            );

    }


    /* =====================================================
       APPLY EVERYTHING
    ===================================================== */

    function applyAllSettings() {

        const settings =
            getSettings();


        applyTheme(settings);

        applyAccent(settings);

        applyAccessibility(settings);

        applyDensity(settings);

        applyFileSettings(settings);

        applyImageSettings(settings);

        applyArticleSettings(settings);

        applyProfileToSidenav();

    }


    /* =====================================================
       SYSTEM THEME WATCHER
    ===================================================== */

    function watchSystemTheme() {

        const media =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );


        const handler = function () {

            const settings =
                getSettings();


            if (
                settings.appearance.theme ===
                "system"
            ) {

                applyTheme(settings);

            }

        };


        if (
            media.addEventListener
        ) {

            media.addEventListener(
                "change",
                handler
            );

        } else {

            media.addListener(
                handler
            );

        }

    }


    /* =====================================================
       SETTINGS CHANGE
    ===================================================== */

    window.addEventListener(
        "devora-settings-changed",
        function () {

            applyAllSettings();

        }
    );


    /* =====================================================
       STORAGE CHANGE
       Useful if another Devora tab changes settings.
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key === SETTINGS_KEY
            ) {

                applyAllSettings();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            /*
             * IMPORTANT:
             * Materialize first.
             */

            initMobileNavigation();


            /*
             * Then global Devora settings.
             */

            applyAllSettings();


            watchSystemTheme();

        }
    );


    /*
     * Apply immediately too.
     * This prevents a light-theme flash.
     */

    applyAllSettings();

})();