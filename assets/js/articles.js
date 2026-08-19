
document.addEventListener("alpine:init", () => {

    Alpine.data("articlesData", () => ({

        // =========================
        // STATE
        // =========================

        articles: [],

        search: "",

        filter: "all",

        showModal: false,

        showReadModal: false,

        editingArticle: null,

        selectedArticle: null,


        // =========================
        // FORM
        // =========================

        form: {

            title: "",

            category: "Technology",

            image: "assets/images/Background.jpeg",

            excerpt: "",

            content: "",

            readTime: 5,

            status: "draft",

            author: "Mohammad"

        },


        // =========================
        // INIT
        // =========================

        init() {

            this.loadArticles();

        },


        // =========================
        // LOAD
        // =========================

        loadArticles() {

            const savedArticles =
                localStorage.getItem("devora_articles");


            if (savedArticles) {

                this.articles =
                    JSON.parse(savedArticles);

                return;

            }


            // Demo articles

            this.articles = [

                {
                    id: 1,

                    title:
                        "How to Build a Better Web Experience",

                    category:
                        "Development",

                    image:
                        "assets/images/Background.jpeg",

                    excerpt:
                        "Learn the essential principles behind creating fast, clean and user-friendly web applications.",

                    content:
                        "A great web experience starts with a clear structure. Developers should focus on performance, accessibility, responsive layouts and intuitive interactions. By combining these principles, we can create products that are easier to use and maintain.",

                    readTime: 6,

                    status:
                        "published",

                    author:
                        "Mohammad",

                    date:
                        "Aug 19, 2026"
                },


                {
                    id: 2,

                    title:
                        "Why Good UI Design Matters",

                    category:
                        "Design",

                    image:
                        "assets/images/logo1.png",

                    excerpt:
                        "Good design is not only about making an interface beautiful. It is about making products easier to understand.",

                    content:
                        "User interface design plays an important role in the success of digital products. A good interface reduces confusion, improves navigation and helps users complete their tasks faster.",

                    readTime: 4,

                    status:
                        "published",

                    author:
                        "Mohammad",

                    date:
                        "Aug 18, 2026"
                },


                {
                    id: 3,

                    title:
                        "Planning Your Next Project",

                    category:
                        "Business",

                    image:
                        "assets/images/Picsart_26-01-26_17-47-50-037.png",

                    excerpt:
                        "Before writing code, spend some time planning the structure, goals and features of your application.",

                    content:
                        "Project planning helps developers understand what they are building before implementation begins. Start with the main goal, define the users, list important features and divide the work into smaller tasks.",

                    readTime: 5,

                    status:
                        "draft",

                    author:
                        "Mohammad",

                    date:
                        "Aug 17, 2026"
                }

            ];


            this.saveToStorage();

        },


        // =========================
        // SAVE STORAGE
        // =========================

        saveToStorage() {

            localStorage.setItem(
                "devora_articles",
                JSON.stringify(this.articles)
            );

        },


        // =========================
        // FILTERED ARTICLES
        // =========================

        get filteredArticles() {

            let result =
                this.articles;


            // Search

            if (this.search.trim()) {

                const query =
                    this.search.toLowerCase();


                result =
                    result.filter(article =>

                        article.title
                            .toLowerCase()
                            .includes(query)

                        ||

                        article.excerpt
                            .toLowerCase()
                            .includes(query)

                        ||

                        article.category
                            .toLowerCase()
                            .includes(query)

                    );

            }


            // Status filter

            if (this.filter !== "all") {

                result =
                    result.filter(article =>
                        article.status === this.filter
                    );

            }


            return result;

        },


        // =========================
        // COUNTS
        // =========================

        get publishedCount() {

            return this.articles.filter(
                article =>
                    article.status === "published"
            ).length;

        },


        get draftCount() {

            return this.articles.filter(
                article =>
                    article.status === "draft"
            ).length;

        },


        // =========================
        // RESET FORM
        // =========================

        resetForm() {

            this.form = {

                title: "",

                category: "Technology",

                image:
                    "assets/images/Background.jpeg",

                excerpt: "",

                content: "",

                readTime: 5,

                status: "draft",

                author: "Mohammad"

            };

        },


        // =========================
        // CREATE
        // =========================

        openCreateModal() {

            this.editingArticle = null;

            this.resetForm();

            this.showModal = true;

            this.$nextTick(() => {

                this.initSelects();

            });

        },


        // =========================
        // EDIT
        // =========================

        openEditModal(article) {

            this.editingArticle = article;

            this.form = {
                ...article
            };

            this.showModal = true;

            this.$nextTick(() => {

                this.initSelects();

            });

        },


        // =========================
        // SAVE
        // =========================

        saveArticle() {

            if (!this.form.title.trim()) {

                M.toast({
                    html: "Article title is required"
                });

                return;

            }


            if (!this.form.excerpt.trim()) {

                M.toast({
                    html: "Article description is required"
                });

                return;

            }


            if (this.editingArticle) {

                // UPDATE

                const index =
                    this.articles.findIndex(
                        article =>
                            article.id ===
                            this.editingArticle.id
                    );


                if (index !== -1) {

                    this.articles[index] = {

                        ...this.form,

                        id:
                            this.editingArticle.id,

                        date:
                            this.editingArticle.date

                    };

                }


                M.toast({
                    html: "Article updated successfully"
                });

            }

            else {

                // CREATE

                const newArticle = {

                    ...this.form,

                    id:
                        Date.now(),

                    date:
                        this.formatDate(new Date()),

                    author:
                        "Mohammad"

                };


                this.articles.unshift(
                    newArticle
                );


                M.toast({
                    html: "Article created successfully"
                });

            }


            this.saveToStorage();

            this.closeModal();

        },


        // =========================
        // DELETE
        // =========================

        deleteArticle(id) {

            const article =
                this.articles.find(
                    item => item.id === id
                );


            if (!article) return;


            const confirmed =
                confirm(
                    `Delete "${article.title}"?`
                );


            if (!confirmed) return;


            this.articles =
                this.articles.filter(
                    item => item.id !== id
                );


            this.saveToStorage();


            M.toast({
                html: "Article deleted"
            });

        },


        // =========================
        // READ
        // =========================

        readArticle(article) {

            this.selectedArticle =
                article;

            this.showReadModal =
                true;

        },


        // =========================
        // CLOSE
        // =========================

        closeModal() {

            this.showModal = false;

            this.editingArticle = null;

        },


        // =========================
        // MATERIALIZE SELECT
        // =========================

        initSelects() {

            const selects =
                document.querySelectorAll(
                    ".article-modal select"
                );


            M.FormSelect.init(selects);

        },


        // =========================
        // DATE
        // =========================

        formatDate(date) {

            return date.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            );

        }

    }));

});

