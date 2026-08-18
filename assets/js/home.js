document.addEventListener('alpine:init', () => {

    Alpine.data('homeData', () => ({

        users: [],

        isLoading: false,

        getUsers() {

            console.log("getUsers called");

            this.isLoading = true;

            axios.get("https://jsonplaceholder.typicode.com/users")
                .then((res) => {

                    console.log("USERS:", res.data);

                    this.users = res.data;

                    console.log("USER COUNT:", this.users.length);

                })
                .catch((error) => {

                    console.log("ERROR:", error);

                })
                .finally(() => {

                    this.isLoading = false;

                });
        }

    }));

});