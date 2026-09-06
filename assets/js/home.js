document.addEventListener('alpine:init', () => {

    Alpine.data('homeData', () => ({

        users: [],
        allComments: [],

        currentCommentIndex: 0,

        commentTimer: null,

        imageCount: 0,
        articleCount: 0,

        homeActivities: [],

        comments: [],
        commentCount: 0,

        isLoading: false,
        isLoadingImages: false,
        isLoadingArticles: false,
        isLoadingComments: false,

        apiError: false,
        commentsError: false,

        welcomeName: "Mohammad",


        // =========================
        // INIT
        // =========================

         init() {
         
             this.loadWelcomeName();
         
             this.getUsers();
         
             this.getImageCount();
         
             this.getArticleCount();
         
             this.getComments();
         
             this.loadHomeActivities();
         
             window.addEventListener(
                 "devora:activity",
                 () => {
                     this.loadHomeActivities();
                 }
             );
         
         },
        // =========================
        // WELCOME
        // =========================

        loadWelcomeName() {

            const savedName =
                localStorage.getItem(
                    "devora_user_name"
                );

            if (
                savedName &&
                savedName.trim()
            ) {

                this.welcomeName =
                    savedName.trim();

            }

        },


        // =========================
        // USERS
        // =========================

        async getUsers() {

            this.isLoading = true;
            this.apiError = false;

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


                const customUsers =
                    JSON.parse(
                        localStorage.getItem(
                            "devora_custom_users"
                        ) || "[]"
                    );

                this.users = [
                
                    ...apiUsers,
                    ...customUsers
                
                ];

                localStorage.setItem(
                    "devora_users_cache",
                    JSON.stringify(this.users)
                );


            } catch (error) {

                console.error(
                    "HOME USERS ERROR:",
                    error
                );

                this.apiError = true;


                const cachedUsers =
                    JSON.parse(
                        localStorage.getItem(
                            "devora_users_cache"
                        ) || "[]"
                    );


                this.users =
                    Array.isArray(cachedUsers)
                        ? cachedUsers
                        : [];

            } finally {

                this.isLoading = false;

            }

        },


        // =========================
        // IMAGE COUNT
        // =========================

        getImageCount() {

            this.isLoadingImages = true;

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

                            this.isLoadingImages =
                                false;

                            return;

                        }


                        const transaction =
                            db.transaction(
                                ["images"],
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

                                this.isLoadingImages =
                                    false;

                                db.close();

                            };


                        countRequest.onerror =
                            () => {

                                this.imageCount = 0;

                                this.isLoadingImages =
                                    false;

                                db.close();

                            };

                    };


                request.onerror =
                    () => {

                        this.imageCount = 0;

                        this.isLoadingImages =
                            false;

                    };


            } catch (error) {

                console.error(
                    "Image count error:",
                    error
                );

                this.imageCount = 0;

                this.isLoadingImages =
                    false;

            }

        },


        // =========================
        // ARTICLE COUNT
        // =========================

        getArticleCount() {

            this.isLoadingArticles = true;

            try {

                const savedArticles =
                    localStorage.getItem(
                        "devora_articles"
                    );


                if (!savedArticles) {

                    this.articleCount = 0;

                    return;

                }


                const articles =
                    JSON.parse(
                        savedArticles
                    );


                this.articleCount =
                    Array.isArray(articles)
                        ? articles.length
                        : 0;


            } catch (error) {

                console.error(
                    "Article count error:",
                    error
                );

                this.articleCount = 0;

            } finally {

                this.isLoadingArticles =
                    false;

            }

        },


        updateVisibleComments() {

    if (!this.allComments.length) {

        this.comments = [];

        return;

    }

    const total =
        this.allComments.length;

    this.comments = [

        this.allComments[
            this.currentCommentIndex % total
        ],

        this.allComments[
            (this.currentCommentIndex + 1) % total
        ],

        this.allComments[
            (this.currentCommentIndex + 2) % total
        ]

    ];

},


startCommentSlider() {

    if (this.commentTimer) {

        clearInterval(this.commentTimer);

    }

    this.commentTimer =
        setInterval(() => {

            this.currentCommentIndex =
                (this.currentCommentIndex + 1)
                % this.allComments.length;

            this.updateVisibleComments();

        }, 5000);

},


        // =========================
        // COMMENTS
        // =========================

        async getComments() {

            this.isLoadingComments = true;
            this.commentsError = false;

            try {

                const response =
                    await axios.get(
                        "https://jsonplaceholder.typicode.com/comments",
                        {
                            timeout: 8000
                        }
                    );


                const allComments =
                    response.data || [];


                this.allComments = allComments;

                this.commentCount = allComments.length;
                
                this.currentCommentIndex = 0;
                
                this.updateVisibleComments();
                
                if (this.allComments.length > 0) {

    this.startCommentSlider();

}

                console.log(
                    "COMMENTS:",
                    this.comments
                );


            } catch (error) {

                console.error(
                    "COMMENTS ERROR:",
                    error
                );

                this.comments = [];

                this.commentCount = 0;

                this.commentsError = true;

            } finally {

                this.isLoadingComments =
                    false;

            }

        },

        // =========================
        // HOME ACTIVITY
        // =========================

        loadHomeActivities() {

            try {

                const saved =
                    JSON.parse(
                        localStorage.getItem(
                            "devora_activity_log"
                        ) || "[]"
                    );


                this.homeActivities =
                    Array.isArray(saved)
                        ? saved
                        : [];


            } catch (error) {

                console.error(
                    "HOME ACTIVITY ERROR:",
                    error
                );

                this.homeActivities = [];

            }

        }


    }
    
)); 
});