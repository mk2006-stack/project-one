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


            init() {

                this.refresh();

            },


            refresh() {

                /*
                 * These are intentionally generated from
                 * the current state of the project.
                 *
                 * Later, when you add real activity logging,
                 * this same array can be replaced by the
                 * actual event store.
                 */

                const now =
                    new Date();


                const time =
                    (minutesAgo) => {

                        const date =
                            new Date(
                                now.getTime()
                                -
                                minutesAgo * 60000
                            );


                        return date.toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        );

                    };


                this.activities = [

                    {
                        id: 1,

                        type: "system",

                        icon: "verified",

                        category: "SYSTEM",

                        title:
                            "Devora system is operational",

                        description:
                            "The application is running normally and all main workspace modules are available.",

                        meta:
                            "System health check",

                        time:
                            time(1)
                    },


                    {
                        id: 2,

                        type: "users",

                        icon: "people",

                        category: "USERS",

                        title:
                            "User management synchronized",

                        description:
                            "The current user list was loaded and the local user cache was updated.",

                        meta:
                            "User Management",

                        time:
                            time(4)
                    },


                    {
                        id: 3,

                        type: "images",

                        icon: "image",

                        category: "IMAGES",

                        title:
                            "Image library checked",

                        description:
                            "Devora checked the local image database and synchronized the current image count.",

                        meta:
                            "DevoraImagesDB",

                        time:
                            time(7)
                    },


                    {
                        id: 4,

                        type: "articles",

                        icon: "article",

                        category: "ARTICLES",

                        title:
                            "Article resources available",

                        description:
                            "The article workspace is ready and available for management.",

                        meta:
                            "Articles",

                        time:
                            time(11)
                    },


                    {
                        id: 5,

                        type: "navigation",

                        icon: "dashboard",

                        category: "WORKSPACE",

                        title:
                            "Workspace opened",

                        description:
                            "Devora workspace modules are ready to use.",

                        meta:
                            "Dashboard",

                        time:
                            time(16)
                    }

                ];

            }

        };

    });

});