document.addEventListener('alpine:init', () => {

    Alpine.data('homeData', () => ({

        users: [],

        imageCount: 0,
        articleCount: 0,

        isLoading: false,
        isLoadingImages: false,
        isLoadingArticles: false,

        apiError: false,

        welcomeName: "Mohammad",


        async init() {

            this.loadWelcomeName();

            await Promise.all([
                this.getUsers(),
                this.getImageCount(),
                this.getArticleCount()
            ]);

        },


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


                const deletedUsers =
                    JSON.parse(
                        localStorage.getItem(
                            "devora_deleted_users"
                        ) || "[]"
                    );


                const deletedIds =
                    new Set(deletedUsers);


                const filteredApiUsers =
                    apiUsers.filter(
                        user =>
                            !deletedIds.has(user.id)
                    );


                this.users = [

                    ...filteredApiUsers,
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


        async getImageCount() {

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

                                db.close();

                            };


                        countRequest.onerror =
                            () => {

                                this.imageCount = 0;

                                db.close();

                            };

                    };


                request.onerror =
                    () => {

                        this.imageCount = 0;

                    };


            } catch (error) {

                console.error(
                    "Image count error:",
                    error
                );

                this.imageCount = 0;

            } finally {

                setTimeout(() => {

                    this.isLoadingImages =
                        false;

                }, 150);

            }

        },


        async getArticleCount() {

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

                this.isLoadingArticles = false;

            }

        }

    }));

});