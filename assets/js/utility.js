"use strict";


/* =========================================================
   DEVORA STATUS
========================================================= */

document.addEventListener("alpine:init", function () {


    Alpine.data("statusData", function () {

        return {

            userCount: 0,

            imageCount: 0,

            articleCount: 0,


            loadingUsers: false,

            loadingImages: false,

            loadingArticles: false,


            init() {

                this.loadUsers();

                this.loadImages();

                this.loadArticles();

            },


            /* =============================================
               USERS
            ============================================== */

            async loadUsers() {

                this.loadingUsers = true;


                try {

                    const response =
                        await axios.get(
                            "https://jsonplaceholder.typicode.com/users",
                            {
                                timeout: 8000
                            }
                        );


                    const apiUsers =
                        response.data || [];


                    let customUsers = [];


                    try {

                        customUsers =
                            JSON.parse(
                                localStorage.getItem(
                                    "devora_custom_users"
                                ) || "[]"
                            );

                    } catch (error) {

                        customUsers = [];

                    }


                    this.userCount =
                        apiUsers.length +
                        (
                            Array.isArray(customUsers)
                                ? customUsers.length
                                : 0
                        );


                    localStorage.setItem(
                        "devora_users_cache",
                        JSON.stringify(
                            [
                                ...apiUsers,
                                ...customUsers
                            ]
                        )
                    );


                } catch (error) {

                    console.warn(
                        "STATUS USERS ERROR:",
                        error
                    );


                    try {

                        const cached =
                            JSON.parse(
                                localStorage.getItem(
                                    "devora_users_cache"
                                ) || "[]"
                            );


                        this.userCount =
                            Array.isArray(cached)
                                ? cached.length
                                : 0;

                    } catch (cacheError) {

                        this.userCount = 0;

                    }

                } finally {

                    this.loadingUsers = false;

                }

            },


            /* =============================================
               IMAGES
            ============================================== */

            loadImages() {

                this.loadingImages = true;


                try {

                    const request =
                        indexedDB.open(
                            "DevoraImagesDB",
                            1
                        );


                    request.onsuccess =
                        (event) => {

                            const db =
                                event.target.result;


                            if (
                                !db.objectStoreNames.contains(
                                    "images"
                                )
                            ) {

                                this.imageCount = 0;

                                db.close();

                                this.loadingImages = false;

                                return;

                            }


                            const transaction =
                                db.transaction(
                                    "images",
                                    "readonly"
                                );


                            const store =
                                transaction.objectStore(
                                    "images"
                                );


                            const countRequest =
                                store.count();


                            countRequest.onsuccess =
                                () => {

                                    this.imageCount =
                                        countRequest.result || 0;

                                };


                            countRequest.onerror =
                                () => {

                                    this.imageCount = 0;

                                };


                            transaction.oncomplete =
                                () => {

                                    db.close();

                                    this.loadingImages = false;

                                };


                            transaction.onerror =
                                () => {

                                    db.close();

                                    this.loadingImages = false;

                                };

                        };


                    request.onerror =
                        () => {

                            this.imageCount = 0;

                            this.loadingImages = false;

                        };


                } catch (error) {

                    console.warn(
                        "STATUS IMAGES ERROR:",
                        error
                    );

                    this.imageCount = 0;

                    this.loadingImages = false;

                }

            },


            /* =============================================
               ARTICLES
            ============================================== */

            async loadArticles() {

                this.loadingArticles = true;


                try {

                    /*
                     * The articles page already uses
                     * local storage in this project.
                     */

                    const possibleKeys = [

                        "devora_articles",

                        "devora_custom_articles",

                        "articles"

                    ];


                    let articles = null;


                    for (
                        const key of possibleKeys
                    ) {

                        try {

                            const saved =
                                JSON.parse(
                                    localStorage.getItem(
                                        key
                                    ) || "null"
                                );


                            if (
                                Array.isArray(saved)
                            ) {

                                articles = saved;

                                break;

                            }

                        } catch (error) {

                            /* ignore */

                        }

                    }


                    if (
                        Array.isArray(articles)
                    ) {

                        this.articleCount =
                            articles.length;

                    } else {

                        /*
                         * Fallback to API used by the
                         * current Devora project.
                         */

                        const response =
                            await axios.get(
                                "https://jsonplaceholder.typicode.com/posts",
                                {
                                    timeout: 8000
                                }
                            );


                        this.articleCount =
                            Array.isArray(response.data)
                                ? response.data.length
                                : 0;

                    }


                } catch (error) {

                    console.warn(
                        "STATUS ARTICLES ERROR:",
                        error
                    );


                    this.articleCount = 0;

                } finally {

                    this.loadingArticles = false;

                }

            }

        };

    });


    /* =====================================================
       ACTIVITY
    ====================================================== */


 Alpine.data("activityData", function () {

    return {

        activities: [],

        loading: false,

        filter: "all",


        init() {

            this.loadActivities();

        },


        /* =================================================
           LOAD
        ================================================= */

        loadActivities() {

            this.loading = true;


            try {

                const saved =
                    JSON.parse(
                        localStorage.getItem(
                            "devora_activity_log"
                        ) || "[]"
                    );


                this.activities =
                    Array.isArray(saved)
                        ? saved
                        : [];


            } catch (error) {

                console.error(
                    "Activity load error:",
                    error
                );

                this.activities = [];

            } finally {

                this.loading = false;

            }

        },


        /* =================================================
           FILTER
        ================================================= */

        get filteredActivities() {

            if (this.filter === "all") {

                return this.activities;

            }


            return this.activities.filter(
                activity =>
                    activity.category === this.filter
            );

        },


        /* =================================================
           FILTER COUNT
        ================================================= */

        get totalActivities() {

            return this.activities.length;

        },


        /* =================================================
           CLEAR
        ================================================= */

        clearActivities() {

            localStorage.removeItem(
                "devora_activity_log"
            );


            this.activities = [];

        },


        /* =================================================
           REFRESH
        ================================================= */

        refresh() {

            this.loadActivities();

        }

    };

});
/* =========================================================
   DEVORA GLOBAL ACTIVITY LOGGER
========================================================= */

window.DevoraActivity = {

    STORAGE_KEY:
        "devora_activity_log",


    add({

        category = "system",

        type = "system",

        icon = "bolt",

        title = "System activity",

        description = "",

        meta = ""

    }) {


        let activities = [];


        try {

            activities =
                JSON.parse(
                    localStorage.getItem(
                        this.STORAGE_KEY
                    ) || "[]"
                );

        } catch (error) {

            activities = [];

        }


        const activity = {

            id:
                Date.now() +
                Math.random(),


            category,

            type,

            icon,

            title,

            description,

            meta,


            timestamp:
                new Date().toISOString(),


            time:
                new Date().toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )

        };


        activities.unshift(
            activity
        );


        /*
         * Keep the last 50 events
         */

        activities =
            activities.slice(0, 50);


        localStorage.setItem(

            this.STORAGE_KEY,

            JSON.stringify(
                activities
            )

        );


        /*
         * Tell Home / Activity to refresh
         */

        window.dispatchEvent(
            new CustomEvent(
                "devora:activity",
                {
                    detail: activity
                }
            )
        );


        return activity;

    }

};

});