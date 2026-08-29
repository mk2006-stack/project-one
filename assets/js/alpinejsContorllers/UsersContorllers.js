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
            number: "",
            email: ""
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

        async getUsers() {

            this.isLoading = true;
            this.apiError = false;

            try {

                const response = await axios.get(
                    "https://jsonplaceholder.typicode.com/users",
                    {
                        timeout: 8000
                    }
                );

                const apiUsers = response.data || [];

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

                this.mainUsers = [
                    ...filteredApiUsers,
                    ...customUsers
                ];

                this.users = [
                    ...this.mainUsers
                ];

                this.pagination();

                this.saveUsersCache();

            } catch (error) {

                console.error(
                    "Users API Error:",
                    error
                );

                this.apiError = true;

                // اگر API قطع بود، اطلاعات قبلی خود سایت را بخوان
                const cachedUsers =
                    JSON.parse(
                        localStorage.getItem(
                            "devora_users_cache"
                        ) || "[]"
                    );

                this.mainUsers = cachedUsers;
                this.users = [...cachedUsers];

                this.pagination();

            } finally {

                this.isLoading = false;

            }

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
        // ADD USER
        // =========================

        handleSubmitAddUserForm() {

            if (
                !this.newUserInfo.name.trim() ||
                !this.newUserInfo.username.trim() ||
                !this.newUserInfo.email.trim()
            ) {

                M.toast({
                    html:
                        "Please fill in Name, Username and Email.",
                    classes:
                        "red rounded"
                });

                return;

            }


            const ids =
                this.mainUsers.map(
                    user => Number(user.id)
                );

            const newId =
                ids.length
                    ? Math.max(...ids) + 1
                    : 1;


            const newUser = {

                id: newId,

                name:
                    this.newUserInfo.name.trim(),

                username:
                    this.newUserInfo.username.trim(),

                number:
                    this.newUserInfo.number.trim(),

                email:
                    this.newUserInfo.email.trim(),

                address: {

                    street: "",
                    city: ""

                },

                isCustom: true

            };


            this.mainUsers = [

                ...this.mainUsers,
                newUser

            ];

            this.users = [

                ...this.mainUsers

            ];


            this.saveCustomUsers();
            this.saveUsersCache();


            this.itemsCount =
                Number(this.itemsCount) || 5;

            this.pageCount =
                Math.ceil(
                    this.users.length /
                    this.itemsCount
                );

            this.currentPage =
                this.pageCount;


            this.pagination();


            this.showAddModal = false;

            this.handleResetForm();


            M.toast({

                html:
                    "User Created Successfully",

                classes:
                    "green rounded"

            });

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

            this.userIdToEdit =
                user.id;


            this.newUserInfo = {

                name:
                    user.name || "",

                username:
                    user.username || "",

                number:
                    user.number || "",

                email:
                    user.email || ""

            };


            this.showAddModal = true;

        },


        // =========================
        // CONFIRM EDIT
        // =========================

        handleConfirmEditUser() {

            if (
                !this.newUserInfo.name.trim() ||
                !this.newUserInfo.username.trim() ||
                !this.newUserInfo.email.trim()
            ) {

                M.toast({

                    html:
                        "Please fill in Name, Username and Email.",

                    classes:
                        "red rounded"

                });

                return;

            }


            const index =
                this.mainUsers.findIndex(
                    user =>
                        user.id ===
                        this.userIdToEdit
                );


            if (index === -1) return;


            const oldUser =
                this.mainUsers[index];


            const updatedUser = {

                ...oldUser,

                name:
                    this.newUserInfo.name.trim(),

                username:
                    this.newUserInfo.username.trim(),

                number:
                    this.newUserInfo.number.trim(),

                email:
                    this.newUserInfo.email.trim(),

                isCustom:
                    oldUser.isCustom || true

            };


            this.mainUsers[index] =
                updatedUser;


            this.users =
                this.users.map(
                    user =>
                        user.id ===
                        updatedUser.id
                            ? updatedUser
                            : user
                );


            this.saveCustomUsers();
            this.saveUsersCache();


            this.pagination();


            this.showAddModal = false;

            this.userIdToEdit = null;

            this.handleResetForm();


            M.toast({

                html:
                    "User Updated Successfully",

                classes:
                    "orange rounded"

            });

        }

    }));

});