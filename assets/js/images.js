document.addEventListener("alpine:init", () => {

    Alpine.data("imagesData", () => ({

        images: [],
        search: "",
        filter: "all",
        showMoreCategories: false,
        sortOrder: "newest",


        viewMode: "grid",

        selectedImage: null,
        showPreview: false,

        editingImage: null,

        showUploadModal: false,
        selectedFile: null,
        newImageName: "",
        newImageCategory: "Technology",

        db: null,

         setViewMode(mode) {
         
             if (!["grid", "list"].includes(mode)) {
                 return;
             }
         
             this.viewMode = mode;
         
         },
         
         toggleView(mode) {
         
             this.setViewMode(mode);
         
         },        

        // =========================
        // INIT
        // =========================

async init() {

    try {

        await this.initDatabase();

        await this.loadImages();

        this.$nextTick(() => {
            this.initSelects();
        });

    } catch (error) {

        console.error(
            "Images initialization error:",
            error
        );

        this.images = [];

    }

},


        // =========================
        // DATABASE
        // =========================

        initDatabase() {

            return new Promise((resolve, reject) => {

                if (!window.indexedDB) {

                    reject(
                        new Error("IndexedDB is not supported.")
                    );

                    return;

                }


                const request =
                    indexedDB.open("DevoraImagesDB", 1);


                request.onupgradeneeded = (event) => {

                    const database =
                        event.target.result;


                    if (
                        !database.objectStoreNames
                            .contains("images")
                    ) {

                        database.createObjectStore(
                            "images",
                            {
                                keyPath: "id"
                            }
                        );

                    }

                };


                request.onsuccess = () => {

                    this.db = request.result;

                    resolve();

                };


                request.onerror = () => {

                    reject(request.error);

                };

            });

        },


        // =========================
        // LOAD IMAGES
        // =========================

        async loadImages() {

            const storedImages =
                await this.getStoredImages();


            if (storedImages.length > 0) {

                this.images = storedImages;


                this.images.forEach(image => {

                    if (image.file) {

                        image.url =
                            URL.createObjectURL(
                                image.file
                            );

                    }

                });


                return;

            }


            this.loadDemoImages();

        },


        // =========================
        // DEMO IMAGES
        // =========================

        loadDemoImages() {

            this.images = [

                {
                    id: 1,
                    name: "Technology",
                    category: "Technology",
                    url: "assets/images/ai.jpg",
                    demo: true
                },

                {
                    id: 2,
                    name: "Digital World",
                    category: "Technology",
                    url: "assets/images/demo/digital-world.jpg",
                    demo: true
                },

                {
                    id: 3,
                    name: "Mountain",
                    category: "Nature",
                    url: "assets/images/demo/mountain.jpg",
                    demo: true
                },

                {
                    id: 4,
                    name: "Landscape",
                    category: "Nature",
                    url: "assets/images/demo/landscape.jpg",
                    demo: true
                },

                {
                    id: 5,
                    name: "Abstract Flow",
                    category: "Abstract",
                    url: "assets/images/demo/abstract-flow.jpg",
                    demo: true
                },

                {
                    id: 6,
                    name: "Gradient",
                    category: "Abstract",
                    url: "assets/images/demo/gradient.jpg",
                    demo: true
                }

            ];

        },


        // =========================
        // GET DATABASE IMAGES
        // =========================

        getStoredImages() {

            return new Promise((resolve, reject) => {

                if (!this.db) {

                    reject(
                        new Error("Database is not ready.")
                    );

                    return;

                }


                const transaction =
                    this.db.transaction(
                        ["images"],
                        "readonly"
                    );


                const store =
                    transaction.objectStore(
                        "images"
                    );


                const request =
                    store.getAll();


                request.onsuccess = () => {

                    resolve(
                        request.result || []
                    );

                };


                request.onerror = () => {

                    reject(request.error);

                };

            });

        },


        // =========================
        // SAVE IMAGE
        // =========================

        saveImage(image) {

            return new Promise((resolve, reject) => {

                if (!this.db) {

                    reject(
                        new Error("Database is not ready.")
                    );

                    return;

                }


                const transaction =
                    this.db.transaction(
                        ["images"],
                        "readwrite"
                    );


                const store =
                    transaction.objectStore(
                        "images"
                    );


                const request =
                    store.put(image);


                request.onsuccess = () => {

                    resolve();

                };


                request.onerror = () => {

                    reject(request.error);

                };

            });

        },


        // =========================
        // DELETE IMAGE
        // =========================

        deleteFromDatabase(id) {

            return new Promise((resolve, reject) => {

                if (!this.db) {

                    reject(
                        new Error("Database is not ready.")
                    );

                    return;

                }


                const transaction =
                    this.db.transaction(
                        ["images"],
                        "readwrite"
                    );


                const store =
                    transaction.objectStore(
                        "images"
                    );


                const request =
                    store.delete(id);


                request.onsuccess = () => {

                    resolve();

                };


                request.onerror = () => {

                    reject(request.error);

                };

            });

        },


        // =========================
        // FILTER
        // =========================

        get filteredImages() {

            let result =
                [...this.images];


            // SEARCH

            if (this.search.trim()) {

                const query =
                    this.search
                        .toLowerCase()
                        .trim();


                result =
                    result.filter(image =>

                        image.name
                            .toLowerCase()
                            .includes(query)

                        ||

                        image.category
                            .toLowerCase()
                            .includes(query)

                    );

            }


            // CATEGORY

            if (this.filter !== "all") {

                result =
                    result.filter(
                        image =>
                            image.category ===
                            this.filter
                    );

            }


            // SORT

            result.sort((a, b) => {

                return this.sortOrder === "newest"

                    ? b.id - a.id

                    : a.id - b.id;

            });


            return result;

        },


        // =========================
        // COUNT
        // =========================

        get imageCount() {

            return this.images.length;

        },


        // =========================
        // SORT
        // =========================

        toggleSort() {

            this.sortOrder =
                this.sortOrder === "newest"
                    ? "oldest"
                    : "newest";

        },


        // =========================
        // PREVIEW
        // =========================

        previewImage(image) {

            this.selectedImage = image;

            this.showPreview = true;

        },


        closePreview() {

            this.showPreview = false;

            this.selectedImage = null;

        },

        // =========================
        // MATERIALIZE SELECT
        // =========================
        
        initSelects() {
        
            const selects =
                document.querySelectorAll(
                    ".image-upload-modal select"
                );
        
            if (!selects.length) {
                return;
            }
        
            M.FormSelect.init(selects, {
        
                dropdownOptions: {
        
                    // همیشه منو را زیر فیلد باز کن
                    coverTrigger: false,
        
                    // عرض منو برابر فیلد Category باشد
                    constrainWidth: true,
        
                    // قبل از باز شدن، ارتفاع منو را
                    // بر اساس فضای باقی‌مانده پایین صفحه تعیین کن
                    onOpenStart: function () {
        
                        const triggerRect =
                            this.el.getBoundingClientRect();
        
                        const spaceBelow =
                            window.innerHeight -
                            triggerRect.bottom -
                            20;
        
                        // منو فقط به اندازه فضای پایین صفحه
                        // ارتفاع می‌گیرد و بقیه آیتم‌ها scroll می‌شوند
                        this.dropdownEl.style.maxHeight =
                            Math.max(0, spaceBelow) + "px";
        
                        this.dropdownEl.style.overflowY =
                            "auto";
        
                        this.dropdownEl.style.overflowX =
                            "hidden";
                    }
        
                }
        
            });
        
        },


        // =========================
        // OPEN UPLOAD
        // =========================

openUpload() {

    this.editingImage = null;

    this.showUploadModal = true;

    this.selectedFile = null;

    this.newImageName = "";

    this.newImageCategory =
        "Technology";

    this.$nextTick(() => {
        this.initSelects();
    });

},


        // =========================
        // CLOSE UPLOAD
        // =========================

       closeUpload() {

    this.showUploadModal = false;

    this.selectedFile = null;

    this.newImageName = "";

    this.newImageCategory =
        "Technology";

    this.editingImage = null;

},


        // =========================
        // SELECT IMAGE
        // =========================

        selectFile(event) {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            // فقط Image

            if (!file.type.startsWith("image/")) {

                alert(
                    "Please select an image file."
                );

                event.target.value = "";

                return;

            }


            // حداکثر 10MB

            if (
                file.size >
                10 * 1024 * 1024
            ) {

                alert(
                    "Image must be smaller than 10MB."
                );

                event.target.value = "";

                return;

            }


            this.selectedFile = file;


            // اسم فایل به عنوان اسم اولیه

            this.newImageName =
                file.name
                    .replace(/\.[^/.]+$/, "")
                    .replace(/[-_]/g, " ");

        },


        // =========================
        // UPLOAD
        // =========================

        async uploadImage() {

            if (!this.selectedFile) {

                alert(
                    "Please choose an image first."
                );

                return;

            }


            if (!this.newImageName.trim()) {

                alert(
                    "Please enter an image name."
                );

                return;

            }


            const image = {

                id: Date.now(),

                name:
                    this.newImageName.trim(),

                category:
                    this.newImageCategory,

                file:
                    this.selectedFile,

                date:
                    new Date().toLocaleDateString(
                        "en-US"
                    )

            };


            try {

                // ذخیره عکس واقعی

                await this.saveImage(image);


                // ساخت URL برای نمایش

                image.url =
                    URL.createObjectURL(
                        this.selectedFile
                    );


                // اضافه کردن به اول Gallery

                this.images.unshift(
                    image
                );


                // بستن Modal

                this.closeUpload();


            } catch (error) {

                console.error(
                    "Upload error:",
                    error
                );


                alert(
                    "The image could not be saved. Please run the project with Live Server."
                );

            }

        },



        // =========================
        // EDIT IMAGE
        // =========================

             openEditImage(image) {
             
                 this.editingImage = image;
             
                 this.newImageName =
                     image.name || "";
             
                 this.newImageCategory =
                     image.category || "Technology";
             
                 this.selectedFile = null;
             
                 this.showUploadModal = true;
             
                 this.$nextTick(() => {
             
                     this.initSelects();
             
                 });

        },

async saveImageEdit() {

    if (!this.editingImage) {
        return;
    }

    if (!this.newImageName.trim()) {

        alert(
            "Please enter an image name."
        );

        return;

    }

    const updatedImage = {

        ...this.editingImage,

        name:
            this.newImageName.trim(),

        category:
            this.newImageCategory

    };

    try {

        await this.saveImage(
            updatedImage
        );

        const index =
            this.images.findIndex(
                image =>
                    image.id ===
                    this.editingImage.id
            );

        if (index !== -1) {

            this.images[index] =
                updatedImage;

        }

        M.toast({
            html: "Image updated successfully",
            classes: "green"
        });

        this.closeUpload();

    } catch (error) {

        console.error(
            "Image update error:",
            error
        );

        alert(
            "Could not update the image."
        );

    }

},


        // =========================
        // DELETE
        // =========================

        async deleteImage(id) {

            const confirmed =
                confirm(
                    "Delete this image?"
                );


            if (!confirmed) {

                return;

            }


            try {

                const image =
                    this.images.find(
                        item =>
                            item.id === id
                    );


                if (
                    image &&
                    image.url &&
                    image.file
                ) {

                    URL.revokeObjectURL(
                        image.url
                    );

                }


                if (!image?.demo) {

                    await this.deleteFromDatabase(
                        id
                    );

                }


                this.images =
                    this.images.filter(
                        item =>
                            item.id !== id
                    );


                if (
                    this.selectedImage &&
                    this.selectedImage.id === id
                ) {

                    this.closePreview();

                }

            } catch (error) {

                console.error(
                    "Delete error:",
                    error
                );

                alert(
                    "Could not delete the image."
                );

            }

        }

    }));

});