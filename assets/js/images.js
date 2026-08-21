document.addEventListener("alpine:init", () => {

    Alpine.data("imagesData", () => ({

        // =========================
        // STATE
        // =========================

        images: [],
        search: "",
        filter: "all",

        selectedImage: null,
        showPreview: false,


        // =========================
        // INIT
        // =========================

        init() {
            this.loadImages();
        },


        // =========================
        // LOAD IMAGES
        // =========================

        loadImages() {

            const savedImages = localStorage.getItem("devora_images");

            if (savedImages) {

                try {
                    this.images = JSON.parse(savedImages);
                    return;
                } catch (error) {
                    console.error(
                        "Failed to load images:",
                        error
                    );
                }

            }


            // =========================
            // DEMO IMAGES
            // =========================

            this.images = [

                {
                    id: 1,
                    name: "Technology.jpg",
                    category: "Technology",
                    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
                    date: "Aug 21, 2026"
                },

                {
                    id: 2,
                    name: "Digital World.jpg",
                    category: "Technology",
                    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
                    date: "Aug 20, 2026"
                },

                {
                    id: 3,
                    name: "Mountain.jpg",
                    category: "Nature",
                    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80",
                    date: "Aug 19, 2026"
                },

                {
                    id: 4,
                    name: "Landscape.jpg",
                    category: "Nature",
                    url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",
                    date: "Aug 18, 2026"
                },

                {
                    id: 5,
                    name: "Abstract Flow.jpg",
                    category: "Abstract",
                    url: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=900&q=80",
                    date: "Aug 17, 2026"
                },

                {
                    id: 6,
                    name: "Gradient.jpg",
                    category: "Abstract",
                    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80",
                    date: "Aug 16, 2026"
                }

            ];


            this.saveToStorage();

        },


        // =========================
        // SAVE TO STORAGE
        // =========================

        saveToStorage() {

            localStorage.setItem(
                "devora_images",
                JSON.stringify(this.images)
            );

        },


        // =========================
        // FILTERED IMAGES
        // =========================

        get filteredImages() {

            let result = this.images;


            // =========================
            // SEARCH
            // =========================

            if (this.search.trim()) {

                const query = this.search
                    .toLowerCase()
                    .trim();


                result = result.filter(image =>

                    image.name
                        .toLowerCase()
                        .includes(query)

                    ||

                    image.category
                        .toLowerCase()
                        .includes(query)

                );

            }


            // =========================
            // CATEGORY FILTER
            // =========================

            if (this.filter !== "all") {

                result = result.filter(
                    image =>
                        image.category === this.filter
                );

            }


            return result;

        },


        // =========================
        // IMAGE COUNT
        // =========================

        get imageCount() {

            return this.images.length;

        },


        // =========================
        // PREVIEW IMAGE
        // =========================

        previewImage(image) {

            this.selectedImage = image;
            this.showPreview = true;

        },


        // =========================
        // CLOSE PREVIEW
        // =========================

        closePreview() {

            this.showPreview = false;
            this.selectedImage = null;

        },


        // =========================
        // DELETE IMAGE
        // =========================

        deleteImage(id) {

            const confirmed = confirm(
                "Are you sure you want to delete this image?"
            );


            if (!confirmed) {
                return;
            }


            this.images = this.images.filter(
                image =>
                    image.id !== id
            );


            this.saveToStorage();


            // Close preview if deleted image
            if (
                this.selectedImage &&
                this.selectedImage.id === id
            ) {
                this.closePreview();
            }

        },


        // =========================
        // UPLOAD IMAGE
        // =========================

        uploadImage(event) {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            // =========================
            // VALIDATE IMAGE
            // =========================

            if (!file.type.startsWith("image/")) {

                alert(
                    "Please select a valid image."
                );

                event.target.value = "";

                return;

            }


            // =========================
            // FILE READER
            // =========================

            const reader = new FileReader();


            reader.onload = () => {

                const newImage = {

                    id: Date.now(),

                    name: file.name,

                    category: "Technology",

                    url: reader.result,

                    date: new Date()
                        .toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                            }
                        )

                };


                // Add image to beginning
                this.images.unshift(newImage);


                // Save
                this.saveToStorage();


                // Reset file input
                event.target.value = "";

            };


            reader.onerror = () => {

                alert(
                    "Failed to read the image."
                );

                event.target.value = "";

            };


            reader.readAsDataURL(file);

        }

    }));

});