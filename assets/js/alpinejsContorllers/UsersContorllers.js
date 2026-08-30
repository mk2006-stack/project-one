document.addEventListener('alpine:init', () => {

    Alpine.data('usersData', () => ({

        // =========================
        // DATA
        // =========================

        mainUsers: [],
        users: [],
        pageUsers: [],

        isLoading: false,
        apiError: false,

        showAddModal: false,

        pageCount: 1,
        itemsCount: 5,
        currentPage: 1,

        searchChar: "",

        userIdToEdit: null,

        newUserInfo: {
            name: "",
            username: "",
            email: "",
            number:"",
            location:"",
        },

        saveUsersToStorage() {

    localStorage.setItem(
        "devora_custom_users",
        JSON.stringify(
            this.users.filter(user => user.isCustom === true)
        )
    );

},

loadCustomUsers() {

    try {

        const savedUsers =
            JSON.parse(
                localStorage.getItem(
                    "devora_custom_users"
                ) || "[]"
            );

        if (!Array.isArray(savedUsers)) {
            return [];
        }

        const migrationKey =
            "devora_custom_users_id_migrated";

        const alreadyMigrated =
            localStorage.getItem(
                migrationKey
            ) === "true";

        if (!alreadyMigrated) {

            const migratedUsers =
                savedUsers.map(
                    (user, index) => ({
                        ...user,
                        id: 11 + index,
                        isCustom: true
                    })
                );

            localStorage.setItem(
                "devora_custom_users",
                JSON.stringify(
                    migratedUsers
                )
            );

            localStorage.setItem(
                migrationKey,
                "true"
            );

            localStorage.setItem(
                "devora_next_user_id",
                String(
                    11 + migratedUsers.length
                )
            );

            return migratedUsers;
        }

        return savedUsers.map(user => ({
            ...user,
            isCustom: true
        }));

    } catch (error) {

        console.error(
            "Custom users storage error:",
            error
        );

        return [];

    }

},


        // =========================
        // INIT
        // =========================

        init() {

            this.getUsers();

        },


        // =========================
        // LOAD USERS
        // =========================

      getUsers(){

    this.isLoading = true;

    axios.get(
        "https://jsonplaceholder.typicode.com/users"
    )

    .then((res) => {

        const apiUsers = res.data.map(user => ({

    ...user,

    number:
        (user.phone || "")
            .replace(/[^0-9]/g, ""),

    location:
        user.address?.city || "",

    isCustom: false

}));


const customUsers =
    this.loadCustomUsers();


this.mainUsers = [
    ...apiUsers,
    ...customUsers
];


this.users = [
    ...this.mainUsers
];

        this.pagination();

    })

    .catch((error) => {

        console.error(
            "Get Users Error:",
            error
        );

        M.toast({
            html: "Unable To Load Users",
            classes: "red rounded"
        });

    })

    .finally(() => {

        this.isLoading = false;

    });

},


        // =========================
        // CACHE
        // =========================

        saveUsersCache() {

            localStorage.setItem(
                "devora_users_cache",
                JSON.stringify(this.mainUsers)
            );

        },


        saveCustomUsers() {

            const customUsers =
                this.mainUsers.filter(
                    user => user.isCustom === true
                );

            localStorage.setItem(
                "devora_custom_users",
                JSON.stringify(customUsers)
            );

        },


        // =========================
        // PAGINATION
        // =========================

        pagination() {

            this.pageCount = Math.max(
                1,
                Math.ceil(
                    this.users.length /
                    this.itemsCount
                )
            );

            if (
                this.currentPage >
                this.pageCount
            ) {

                this.currentPage =
                    this.pageCount;

            }

            const start =
                (this.currentPage - 1) *
                this.itemsCount;

            const end =
                start +
                this.itemsCount;

            this.pageUsers =
                this.users.slice(
                    start,
                    end
                );

        },


        nextPage() {

            if (
                this.currentPage <
                this.pageCount
            ) {

                this.currentPage++;

                this.pagination();

            }

        },


        prevPage() {

            if (
                this.currentPage > 1
            ) {

                this.currentPage--;

                this.pagination();

            }

        },


        handleChangeItemsCount(value) {

            let count =
                parseInt(value);

            if (
                !count ||
                count < 1
            ) {

                count = 1;

            }

            if (
                this.users.length &&
                count > this.users.length
            ) {

                count =
                    this.users.length;

            }

            this.itemsCount = count;

            this.currentPage = 1;

            this.pagination();

        },


        // =========================
        // SEARCH
        // =========================

        handleSearch(value) {

            const search =
                value
                    .toLowerCase()
                    .trim();

            if (!search) {

                this.users = [
                    ...this.mainUsers
                ];

            } else {

                this.users =
                    this.mainUsers.filter(
                        user =>

                            user.name
                                ?.toLowerCase()
                                .includes(search)

                            ||

                            user.username
                                ?.toLowerCase()
                                .includes(search)

                            ||

                            user.email
                                ?.toLowerCase()
                                .includes(search)

                            ||

                            String(
                                user.number || ""
                            )
                            .toLowerCase()
                            .includes(search)

                            ||

                            user.address?.city
                                ?.toLowerCase()
                                .includes(search)
                    );

            }

            this.currentPage = 1;

            this.pagination();

        },


        clearSearch() {

            this.searchChar = "";

            this.users = [
                ...this.mainUsers
            ];

            this.currentPage = 1;

            this.pagination();

        },


        // =========================
        // RESET FORM
        // =========================

        handleResetForm() {

            this.newUserInfo = {

                name: "",
                username: "",
                number: "",
                email: ""

            };

            this.userIdToEdit = null;

        },

        // =========================
        // CUSTOM USER ID
        // =========================

getNextCustomUserId() {

    const savedNextId =
        Number(
            localStorage.getItem(
                "devora_next_user_id"
            )
        ) || 11;

    const existingIds =
        this.mainUsers
            .map(user => Number(user.id))
            .filter(id => Number.isInteger(id));

    const maxExistingId =
        existingIds.length
            ? Math.max(...existingIds)
            : 10;

    const nextId =
        Math.max(
            savedNextId,
            maxExistingId + 1,
            11
        );

    localStorage.setItem(
        "devora_next_user_id",
        String(nextId + 1)
    );

    return nextId;

},

        // =========================
        // ADD USER
        // =========================

handleSubmitAddUserForm() {

const newUser = {

    id:
        this.getNextCustomUserId(),

    isCustom:
        true,

    isCustom:
        true,

        name:
            this.newUserInfo.name.trim(),

        username:
            this.newUserInfo.username.trim(),

        email:
            this.newUserInfo.email.trim(),

        number:
            this.newUserInfo.number
                .replace(/[^0-9]/g, ""),

        location:
            this.newUserInfo.location.trim(),

        address: {

            street: "",

            city:
                this.newUserInfo.location.trim()

        }

    };


    console.log(
        "USER TO ADD:",
        newUser
    );


    this.users = [
        ...this.users,
        newUser
    ];


    this.mainUsers = [
        ...this.mainUsers,
        newUser
    ];

    this.saveUsersToStorage();

    this.pageCount =
        Math.ceil(
            this.users.length /
            this.itemsCount
        );


    this.currentPage =
        this.pageCount;


    const start =
        (this.currentPage - 1) *
        this.itemsCount;


    const end =
        this.currentPage *
        this.itemsCount;


    this.pageUsers =
        this.users.slice(
            start,
            end
        );


    M.toast({

        html:
            "User Created Successfully",

        classes:
            "rounded green"

    });


    this.showAddModal =
        false;


    this.newUserInfo = {

        name: "",

        username: "",

        email: "",

        number: "",

        location: ""

    };

},


        // =========================
        // DELETE
        // =========================

        handleDeleteUser(userId) {

            const user =
                this.mainUsers.find(
                    user =>
                        user.id === userId
                );

            if (!user) return;


            const confirmed =
                confirm(
                    `Delete ${user.name}?`
                );

            if (!confirmed) return;


            // اگر User از API آمده
            // ID آن را در deleted ذخیره کن
            const deletedUsers =
                JSON.parse(
                    localStorage.getItem(
                        "devora_deleted_users"
                    ) || "[]"
                );


            if (
                !deletedUsers.includes(userId)
            ) {

                deletedUsers.push(userId);

            }


            localStorage.setItem(
                "devora_deleted_users",
                JSON.stringify(
                    deletedUsers
                )
            );


            this.mainUsers =
                this.mainUsers.filter(
                    user =>
                        user.id !== userId
                );

            this.users =
                this.users.filter(
                    user =>
                        user.id !== userId
                );


            this.saveCustomUsers();
            this.saveUsersCache();


            if (
                this.currentPage >
                Math.ceil(
                    this.users.length /
                    this.itemsCount
                )
            ) {

                this.currentPage =
                    Math.max(
                        1,
                        Math.ceil(
                            this.users.length /
                            this.itemsCount
                        )
                    );

            }


            this.pagination();


            M.toast({

                html:
                    "User Deleted Successfully",

                classes:
                    "red rounded"

            });

        },


        // =========================
        // EDIT USER
        // =========================

   handleUpdateUser(user) {

    this.newUserInfo = {

        name:
            user.name || "",

        username:
            user.username || "",

        email:
            user.email || "",

        number:
            (
                user.number ||
                user.phone ||
                ""
            )
            .replace(/[^0-9]/g, ""),

        location:
            user.location ||
            user.address?.city ||
            ""

    };


    this.userIdToEdit =
        user.id;


    this.showAddModal =
        true;

},


        // =========================
        // CONFIRM EDIT
        // =========================

handleConfirmEditUser() {

    this.isLoading = true;

    const updatedUser = {

        name:
            this.newUserInfo.name.trim(),

        username:
            this.newUserInfo.username.trim(),

        email:
            this.newUserInfo.email.trim(),

        number:
            this.newUserInfo.number
                .replace(/[^0-9]/g, ""),

        location:
            this.newUserInfo.location.trim(),

        address: {

            street: "",

            city:
                this.newUserInfo.location.trim()

        }

    };


    const userIndex =
        this.mainUsers.findIndex(
            user =>
                user.id ===
                this.userIdToEdit
        );


    if (userIndex === -1) {

        this.isLoading = false;

        M.toast({
            html:
                "User Not Found",
            classes:
                "red rounded"
        });

        return;

    }


    const existingUser =
        this.mainUsers[userIndex];


    // =========================
    // CUSTOM USER
    // =========================

    if (existingUser.isCustom === true) {

        const finalUser = {

            ...existingUser,

            ...updatedUser,

            id:
                existingUser.id,

            isCustom:
                true

        };


        this.mainUsers[userIndex] =
            finalUser;


        const usersIndex =
            this.users.findIndex(
                user =>
                    user.id ===
                    this.userIdToEdit
            );


        if (usersIndex !== -1) {

            this.users[usersIndex] =
                finalUser;

        }


        this.saveCustomUsers();

        this.saveUsersToStorage();

        this.pagination();


        this.showAddModal =
            false;

        this.userIdToEdit =
            null;


        this.newUserInfo = {

            name: "",
            username: "",
            email: "",
            number: "",
            location: ""

        };


        M.toast({

            html:
                "User Updated Successfully",

            classes:
                "orange rounded"

        });


        this.isLoading = false;

        return;

    }


    // =========================
    // API USER
    // =========================

    axios.put(

        "https://jsonplaceholder.typicode.com/users/" +
        this.userIdToEdit,

        updatedUser

    )

    .then((res) => {

        if (res.status === 200) {

            const finalUser = {

                ...existingUser,

                ...updatedUser,

                id:
                    this.userIdToEdit,

                isCustom:
                    false

            };


            this.mainUsers[userIndex] =
                finalUser;


            const usersIndex =
                this.users.findIndex(
                    user =>
                        user.id ===
                        this.userIdToEdit
                );


            if (usersIndex !== -1) {

                this.users[usersIndex] =
                    finalUser;

            }


            this.pagination();


            this.showAddModal =
                false;

            this.userIdToEdit =
                null;


            this.newUserInfo = {

                name: "",
                username: "",
                email: "",
                number: "",
                location: ""

            };


            M.toast({

                html:
                    "User Updated Successfully",

                classes:
                    "orange rounded"

            });

        }

    })

    .catch((error) => {

        console.error(
            "Update User Error:",
            error
        );

        M.toast({

            html:
                "Unable To Update User",

            classes:
                "red rounded"

        });

    })

    .finally(() => {

        this.isLoading = false;

    });

},
    }));

});