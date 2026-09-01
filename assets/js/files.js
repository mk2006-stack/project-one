/* =========================================
   DEVORA - FILE MANAGER
   files.js
========================================= */

document.addEventListener("alpine:init", () => {

    Alpine.data("filesData", () => ({

        /* =====================================
           STATE
        ===================================== */

        files: [],

        search: "",

        filter: "all",

        sortOrder: "newest",

        viewMode: "list",

        showCategoryMenu: false,

        showUploadModal: false,

        selectedFile: null,

        selectedFileDetails: null,

        newCategory: "Document",

        db: null,

        dbName: "DevoraFilesDB",

        storeName: "files",


        /* =====================================
           INIT
        ===================================== */

        async init() {


            const savedSettings = JSON.parse(
    localStorage.getItem("devora_settings") || "{}"
);

if (
    savedSettings.files &&
    ["grid", "list"].includes(savedSettings.files.view)
) {
    this.viewMode = savedSettings.files.view;
}

            try {

                await this.openDatabase();

                const savedFiles = await this.getFilesFromDB();

                if (savedFiles.length === 0) {

                    await this.createDemoFiles();

                }

                await this.refreshFiles();

            } catch (error) {

                console.error(
                    "Files initialization error:",
                    error
                );

                /*
                 * Fallback:
                 * If IndexedDB is unavailable,
                 * keep the page usable.
                 */

                this.files = this.getDemoFiles();

            }

        },


        setViewMode(mode) {

    if (!["grid", "list"].includes(mode)) {
        return;
    }

    this.viewMode = mode;

    try {
        const settings = JSON.parse(
            localStorage.getItem("devora_settings") || "{}"
        );

        settings.files = settings.files || {};

        settings.files.view = mode;

        localStorage.setItem(
            "devora_settings",
            JSON.stringify(settings)
        );
    } catch (error) {
        console.error("Unable to save file view preference:", error);
    }
},


        /* =====================================
           INDEXED DB
        ===================================== */

        openDatabase() {

            return new Promise((resolve, reject) => {

                const request = indexedDB.open(
                    this.dbName,
                    1
                );


                request.onupgradeneeded = (event) => {

                    const db = event.target.result;


                    if (!db.objectStoreNames.contains(
                        this.storeName
                    )) {

                        const store =
                            db.createObjectStore(
                                this.storeName,
                                {
                                    keyPath: "id"
                                }
                            );


                        store.createIndex(
                            "name",
                            "name",
                            {
                                unique: false
                            }
                        );


                        store.createIndex(
                            "updatedAt",
                            "updatedAt",
                            {
                                unique: false
                            }
                        );

                    }

                };


                request.onsuccess = (event) => {

                    this.db =
                        event.target.result;

                    resolve(this.db);

                };


                request.onerror = () => {

                    reject(
                        request.error
                    );

                };

            });

        },


        /* =====================================
           GET FILES
        ===================================== */

        getFilesFromDB() {

            return new Promise((resolve, reject) => {

                if (!this.db) {

                    resolve([]);

                    return;

                }


                const transaction =
                    this.db.transaction(
                        this.storeName,
                        "readonly"
                    );


                const store =
                    transaction.objectStore(
                        this.storeName
                    );


                const request =
                    store.getAll();


                request.onsuccess = () => {

                    resolve(
                        request.result || []
                    );

                };


                request.onerror = () => {

                    reject(
                        request.error
                    );

                };

            });

        },


        /* =====================================
           ADD FILE
        ===================================== */

        addFileToDB(file) {

            return new Promise((resolve, reject) => {

                if (!this.db) {

                    reject(
                        new Error(
                            "Database is not available."
                        )
                    );

                    return;

                }


                const transaction =
                    this.db.transaction(
                        this.storeName,
                        "readwrite"
                    );


                const store =
                    transaction.objectStore(
                        this.storeName
                    );


                const request =
                    store.add(file);


                request.onsuccess = () => {

                    resolve(file);

                };


                request.onerror = () => {

                    reject(
                        request.error
                    );

                };

            });

        },


        /* =====================================
           DELETE FILE FROM DB
        ===================================== */

        deleteFileFromDB(id) {

            return new Promise((resolve, reject) => {

                if (!this.db) {

                    reject(
                        new Error(
                            "Database is not available."
                        )
                    );

                    return;

                }


                const transaction =
                    this.db.transaction(
                        this.storeName,
                        "readwrite"
                    );


                const store =
                    transaction.objectStore(
                        this.storeName
                    );


                const request =
                    store.delete(id);


                request.onsuccess = () => {

                    resolve();

                };


                request.onerror = () => {

                    reject(
                        request.error
                    );

                };

            });

        },


        /* =====================================
           REFRESH
        ===================================== */

        async refreshFiles() {

            const files =
                await this.getFilesFromDB();


            this.files =
                files.sort(
                    (a, b) =>
                        new Date(b.updatedAt)
                        -
                        new Date(a.updatedAt)
                );

        },


        /* =====================================
           FILTERED FILES
        ===================================== */

        get filteredFiles() {

            let result =
                [...this.files];


            /* SEARCH */

            if (this.search.trim()) {

                const query =
                    this.search
                        .trim()
                        .toLowerCase();


                result =
                    result.filter(file =>

                        file.name
                            .toLowerCase()
                            .includes(query)

                        ||

                        file.extension
                            .toLowerCase()
                            .includes(query)

                        ||

                        file.category
                            .toLowerCase()
                            .includes(query)

                    );

            }


            /* CATEGORY FILTER */

            if (this.filter !== "all") {

                result =
                    result.filter(file =>
                        file.category ===
                        this.filter
                    );

            }


            /* SORT */

            result.sort((a, b) => {

                const first =
                    new Date(a.updatedAt);

                const second =
                    new Date(b.updatedAt);


                if (
                    this.sortOrder ===
                    "newest"
                ) {

                    return second - first;

                }


                return first - second;

            });


            return result;

        },


        /* =====================================
           CATEGORY COUNT
        ===================================== */

        get categoryCount() {

            const categories =
                new Set(
                    this.files.map(
                        file => file.category
                    )
                );


            return categories.size;

        },


        /* =====================================
           TOTAL SIZE
        ===================================== */

        get totalSize() {

            return this.files.reduce(
                (total, file) =>
                    total +
                    Number(file.size || 0),
                0
            );

        },


        /* =====================================
           LATEST FILE
        ===================================== */

        get latestLabel() {

            if (!this.files.length) {

                return "—";

            }


            const latest =
                [...this.files].sort(
                    (a, b) =>
                        new Date(b.updatedAt)
                        -
                        new Date(a.updatedAt)
                )[0];


            return this.formatRelativeDate(
                latest.updatedAt
            );

        },


        /* =====================================
           OPEN UPLOAD
        ===================================== */

        openUpload() {

            this.selectedFile = null;

            this.newCategory =
                "Document";

            this.showUploadModal = true;

        },


        /* =====================================
           CLOSE UPLOAD
        ===================================== */

        closeUpload() {

            this.showUploadModal = false;

            this.selectedFile = null;

            this.newCategory =
                "Document";

        },


        /* =====================================
           SELECT FILE
        ===================================== */

        handleFileSelect(event) {

            const files =
                event.target.files;


            if (
                !files ||
                !files.length
            ) {

                this.selectedFile = null;

                return;

            }


            const file =
                files[0];


            this.selectedFile =
                file;


            this.newCategory =
                this.detectCategory(
                    file.name,
                    file.type
                );

        },


        /* =====================================
           DETECT CATEGORY
        ===================================== */

        detectCategory(name, mimeType = "") {

            const extension =
                this.getExtension(name);


            if (
                extension === "pdf"
            ) {

                return "PDF";

            }


            if (
                [
                    "xls",
                    "xlsx",
                    "csv"
                ].includes(extension)
            ) {

                return "Spreadsheet";

            }


            if (
                [
                    "ppt",
                    "pptx"
                ].includes(extension)
            ) {

                return "Presentation";

            }


            if (
                [
                    "zip",
                    "rar",
                    "7z",
                    "tar",
                    "gz"
                ].includes(extension)
            ) {

                return "Archive";

            }


            if (
                [
                    "doc",
                    "docx",
                    "txt",
                    "rtf"
                ].includes(extension)
            ) {

                return "Document";

            }


            if (
                mimeType.startsWith(
                    "text/"
                )
            ) {

                return "Document";

            }


            return "Other";

        },


        /* =====================================
           SAVE UPLOAD
        ===================================== */

        async saveUpload() {

            if (!this.selectedFile) {

                return;

            }


            try {

                const original =
                    this.selectedFile;


                const extension =
                    this.getExtension(
                        original.name
                    );


                const fileObject = {

                    id:
                        this.generateId(),

                    name:
                        original.name,

                    extension:
                        extension || "file",

                    category:
                        this.newCategory,

                    size:
                        original.size,

                    mimeType:
                        original.type ||
                        "application/octet-stream",

                    updatedAt:
                        new Date().toISOString(),

                    createdAt:
                        new Date().toISOString(),

                    blob:
                        original

                };


                await this.addFileToDB(
                    fileObject
                );


                await this.refreshFiles();


                this.closeUpload();


                this.notify(
                    "File uploaded successfully."
                );


            } catch (error) {

                console.error(
                    "Upload error:",
                    error
                );


                this.notify(
                    "Could not save the file.",
                    "error"
                );

            }

        },


        /* =====================================
           PREVIEW / DETAILS
        ===================================== */

        previewFile(file) {

            if (!file) {

                return;

            }


            this.selectedFileDetails =
                file;

        },


        /* =====================================
           DOWNLOAD
        ===================================== */

        downloadFile(file) {

            if (
                !file ||
                !file.blob
            ) {

                this.notify(
                    "This file cannot be downloaded.",
                    "error"
                );

                return;

            }


            try {

                const url =
                    URL.createObjectURL(
                        file.blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href = url;

                link.download =
                    file.name;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                setTimeout(() => {

                    URL.revokeObjectURL(
                        url
                    );

                }, 1000);


            } catch (error) {

                console.error(
                    "Download error:",
                    error
                );


                this.notify(
                    "Could not download the file.",
                    "error"
                );

            }

        },


        /* =====================================
           DELETE
        ===================================== */

        async deleteFile(id) {

            const file =
                this.files.find(
                    item =>
                        item.id === id
                );


            if (!file) {

                return;

            }


            const confirmed =
                window.confirm(
                    `Delete "${file.name}"?`
                );


            if (!confirmed) {

                return;

            }


            try {

                await this.deleteFileFromDB(
                    id
                );


                if (
                    this.selectedFileDetails &&
                    this.selectedFileDetails.id === id
                ) {

                    this.selectedFileDetails =
                        null;

                }


                await this.refreshFiles();


                this.notify(
                    "File deleted."
                );


            } catch (error) {

                console.error(
                    "Delete error:",
                    error
                );


                this.notify(
                    "Could not delete the file.",
                    "error"
                );

            }

        },


        /* =====================================
           SORT
        ===================================== */

        toggleSort() {

            this.sortOrder =
                this.sortOrder === "newest"
                    ? "oldest"
                    : "newest";

        },


        /* =====================================
           FILE ICON
        ===================================== */

        fileIcon(extension) {

            const ext =
                String(extension || "")
                    .toLowerCase();


            const icons = {

                pdf:
                    "picture_as_pdf",

                doc:
                    "description",

                docx:
                    "description",

                txt:
                    "article",

                rtf:
                    "article",

                xls:
                    "table_chart",

                xlsx:
                    "table_chart",

                csv:
                    "table_chart",

                ppt:
                    "slideshow",

                pptx:
                    "slideshow",

                zip:
                    "folder_zip",

                rar:
                    "folder_zip",

                "7z":
                    "folder_zip",

                tar:
                    "folder_zip",

                gz:
                    "folder_zip"

            };


            return (
                icons[ext] ||
                "insert_drive_file"
            );

        },


        /* =====================================
           EXTENSION
        ===================================== */

        getExtension(name) {

            if (!name) {

                return "";

            }


            const cleanName =
                name
                    .split("?")[0]
                    .split("#")[0];


            const parts =
                cleanName.split(".");


            if (
                parts.length < 2
            ) {

                return "";

            }


            return parts
                .pop()
                .toLowerCase();

        },


        /* =====================================
           FORMAT BYTES
        ===================================== */

        formatBytes(bytes) {

            const value =
                Number(bytes || 0);


            if (value === 0) {

                return "0 B";

            }


            const units = [
                "B",
                "KB",
                "MB",
                "GB",
                "TB"
            ];


            const index =
                Math.floor(
                    Math.log(value)
                    /
                    Math.log(1024)
                );


            const safeIndex =
                Math.min(
                    index,
                    units.length - 1
                );


            const size =
                value /
                Math.pow(
                    1024,
                    safeIndex
                );


            return (
                size.toFixed(
                    safeIndex === 0
                        ? 0
                        : 1
                )
                +
                " "
                +
                units[safeIndex]
            );

        },


        /* =====================================
           FORMAT DATE
        ===================================== */

        formatDate(date) {

            if (!date) {

                return "—";

            }


            const value =
                new Date(date);


            if (
                Number.isNaN(
                    value.getTime()
                )
            ) {

                return "—";

            }


            return value.toLocaleDateString(
                undefined,
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            );

        },


        /* =====================================
           RELATIVE DATE
        ===================================== */

        formatRelativeDate(date) {

            if (!date) {

                return "—";

            }


            const target =
                new Date(date);


            const now =
                new Date();


            const difference =
                now.getTime()
                -
                target.getTime();


            const minutes =
                Math.floor(
                    difference /
                    (1000 * 60)
                );


            const hours =
                Math.floor(
                    minutes / 60
                );


            const days =
                Math.floor(
                    hours / 24
                );


            if (minutes < 1) {

                return "Just now";

            }


            if (minutes < 60) {

                return (
                    minutes +
                    " min ago"
                );

            }


            if (hours < 24) {

                return (
                    hours +
                    "h ago"
                );

            }


            if (days === 1) {

                return "Yesterday";

            }


            if (days < 7) {

                return (
                    days +
                    " days ago"
                );

            }


            return this.formatDate(
                date
            );

        },


        /* =====================================
           GENERATE ID
        ===================================== */

        generateId() {

            return (
                Date.now()
                +
                "-"
                +
                Math.random()
                    .toString(36)
                    .substring(2, 10)
            );

        },


        /* =====================================
           NOTIFICATION
        ===================================== */

        notify(message, type = "success") {

            /*
             * Materialize toast if available.
             */

            if (
                typeof M !== "undefined" &&
                typeof M.toast === "function"
            ) {

                M.toast({
                    html:
                        `<span>${this.escapeHtml(message)}</span>`,
                    classes:
                        type === "error"
                            ? "red darken-2"
                            : "green darken-2"
                });

                return;

            }


            console.log(
                `[${type}]`,
                message
            );

        },


        /* =====================================
           ESCAPE HTML
        ===================================== */

        escapeHtml(value) {

            return String(value)
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        },


        /* =====================================
           DEMO FILES
        ===================================== */

        async createDemoFiles() {

            const demoFiles =
                this.getDemoFiles();


            for (
                const file of demoFiles
            ) {

                /*
                 * Demo files contain small
                 * text blobs so they can
                 * actually be downloaded.
                 */

                const content =
                    this.demoContent(
                        file.extension,
                        file.name
                    );


                file.blob =
                    new Blob(
                        [content],
                        {
                            type:
                                file.mimeType
                        }
                    );


                await this.addFileToDB(
                    file
                );

            }

        },


        /* =====================================
           DEMO FILE DATA
        ===================================== */

        getDemoFiles() {

            const now =
                Date.now();


            return [

                {

                    id:
                        "demo-pdf",

                    name:
                        "Devora_Project_Brief.pdf",

                    extension:
                        "pdf",

                    category:
                        "PDF",

                    size:
                        284000,

                    mimeType:
                        "application/pdf",

                    updatedAt:
                        new Date(
                            now -
                            1000 * 60 * 35
                        ).toISOString(),

                    createdAt:
                        new Date(
                            now -
                            1000 * 60 * 35
                        ).toISOString()

                },


                {

                    id:
                        "demo-docx",

                    name:
                        "User_Management_Spec.docx",

                    extension:
                        "docx",

                    category:
                        "Document",

                    size:
                        1260000,

                    mimeType:
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

                    updatedAt:
                        new Date(
                            now -
                            1000 * 60 * 60 * 4
                        ).toISOString(),

                    createdAt:
                        new Date(
                            now -
                            1000 * 60 * 60 * 4
                        ).toISOString()

                },


                {

                    id:
                        "demo-xlsx",

                    name:
                        "Analytics_Report.xlsx",

                    extension:
                        "xlsx",

                    category:
                        "Spreadsheet",

                    size:
                        842000,

                    mimeType:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

                    updatedAt:
                        new Date(
                            now -
                            1000 * 60 * 60 * 18
                        ).toISOString(),

                    createdAt:
                        new Date(
                            now -
                            1000 * 60 * 60 * 18
                        ).toISOString()

                },


                {

                    id:
                        "demo-pptx",

                    name:
                        "Devora_Presentation.pptx",

                    extension:
                        "pptx",

                    category:
                        "Presentation",

                    size:
                        3820000,

                    mimeType:
                        "application/vnd.openxmlformats-officedocument.presentationml.presentation",

                    updatedAt:
                        new Date(
                            now -
                            1000 * 60 * 60 * 30
                        ).toISOString(),

                    createdAt:
                        new Date(
                            now -
                            1000 * 60 * 60 * 30
                        ).toISOString()

                },


                {

                    id:
                        "demo-zip",

                    name:
                        "Project_Backup.zip",

                    extension:
                        "zip",

                    category:
                        "Archive",

                    size:
                        14800000,

                    mimeType:
                        "application/zip",

                    updatedAt:
                        new Date(
                            now -
                            1000 * 60 * 60 * 48
                        ).toISOString(),

                    createdAt:
                        new Date(
                            now -
                            1000 * 60 * 60 * 48
                        ).toISOString()

                },


                {

                    id:
                        "demo-txt",

                    name:
                        "Release_Notes.txt",

                    extension:
                        "txt",

                    category:
                        "Document",

                    size:
                        8400,

                    mimeType:
                        "text/plain",

                    updatedAt:
                        new Date(
                            now -
                            1000 * 60 * 60 * 72
                        ).toISOString(),

                    createdAt:
                        new Date(
                            now -
                            1000 * 60 * 60 * 72
                        ).toISOString()

                }

            ];

        },


        /* =====================================
           DEMO CONTENT
        ===================================== */

        demoContent(
            extension,
            name
        ) {

            return `
Devora File Manager
===================

File: ${name}
Type: ${extension.toUpperCase()}

This is a demo file generated
for the Devora File Manager.

Replace this demo content with
your real project files when needed.
            `.trim();

        }

    }));

});

