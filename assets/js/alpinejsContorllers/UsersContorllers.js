
document.addEventListener('alpine:init', () => {
    Alpine.data('usersData', ()=>({
         mainUsers: [],
         users:[],
         pageUsers: [],
         isLoading: false,
         showAddModal : false,
         pageCount: 1,
         itemsCount: 5,
         currentPage: 1,
         searchChar:"",
         newUserInfo:{
            name:"",
            username:"",
            email:"",
         },
         userIdToEdit: null,
         getUsers(){
             this.isLoading = true
             axios.get("https://jsonplaceholder.typicode.com/users").then((res)=>{
               this.mainUsers= res.data
               this.users= res.data
               this.pagination()
             }).finally(()=>{
                 this.isLoading = false 
             }) 
         },
         pagination(){
            this.pageCount = Math.ceil(this.users.length / this.itemsCount)
            let start = (this.currentPage * this.itemsCount ) - this.itemsCount
            let end = this.currentPage * this.itemsCount
            this.pageUsers = this.users.slice(start,end)
            console.log(this.pageUsers);
         },
        nextPage(){
           this.currentPage++
           if (this.currentPage > this.pageCount) this.currentPage = this.pageCount
           this.pagination() 
        },
        prevPage(){
            this.currentPage--
             if (this.currentPage < 1 ) this.currentPage = 1
            this.pagination() 
        },
        handleChangeItemsCount(value){
            this.currentPage = 1
         if ( value < 1) this.itemsCount = 1 
         if ( value > this.users.length) this.itemsCount =this.users.length
         this.pageUsers()
        },
        handleSearch(value){
               const search = value.toLowerCase().trim()   
               this.users = this.mainUsers.filter(user=> (user.name?.toLowerCase().includes(search) || user.username?.toLowerCase().includes(search)  ||user.email?.toLowerCase().includes(search)))  
               this.currentPage = 1 
               this.pagination()
        },
        handleSubmitAddUserForm() {

    const newUser = {
        id: this.users.length + 1,

        name: this.newUserInfo.name,
        username: this.newUserInfo.username,

        // برای جدول
        number: this.newUserInfo.number,

        email: this.newUserInfo.email,

        address: {
            street: "",
            city: ""
        }
    };

    console.log("USER TO ADD:", newUser);

    // اضافه کردن به users
    this.users = [...this.users, newUser];

    // تعداد صفحات
    this.pageCount = Math.ceil(
        this.users.length / this.itemsCount
    );

    // رفتن به آخرین صفحه
    this.currentPage = this.pageCount;

    // ساخت دوباره pageUsers
    let start =
        (this.currentPage - 1) * this.itemsCount;

    let end =
        this.currentPage * this.itemsCount;

    this.pageUsers = this.users.slice(start, end);


    M.toast({html: 'User Created Successfully ', classes: 'rounded green'});

    // بستن Modal
    this.showAddModal = false;

    // خالی کردن فرم
    this.newUserInfo = {
        name: "",
        username: "",
        email: "",
    };

    console.log("ALL USERS:", this.users);
    console.log("PAGE USERS:", this.pageUsers);
       },
        handleDeleteUser(userId){
         var toastHTML = '<span>Are You Sure? ('+userId+') </span><button class="btn-flat toast-action" x-on:click=handconfirmDeleteUser('+userId+') >Delete</button>';
         M.toast({html: toastHTML});
       },
       handconfirmDeleteUser(userId){
        this.isLoading = true
        axios.delete("https://jsonplaceholder.typicode.com/users/"+userId).then((res)=>{
            if (res.status === 200) {
                this.mainUsers = this.mainUsers.filter(user=>user.id !== userId)
                this.users = this.users.filter(user=>user.id !== userId)
                this.pagination()
                M.toast({html: 'User Delete Successfully ...', classes: 'red'});
            }
        }).finally(()=> {
            this.isLoading = false })

       },
       handleUpdateUser(user){
        axios.get("https://jsonplaceholder.typicode.com/users/"+user.id).then(res=>{
            if (res.status ===200) {
                this.newUserInfo={
            name:res.data.name,
            username:res.data.username,
            email:res.data.email,
              }
              this.userIdToEdit = res.data.id
            }
        })

        this.showAddModal = true

       },
       handleConfirmEditUser(){
         this.isLoading = true
        axios.put("https://jsonplaceholder.typicode.com/users/"+this.userIdToEdit, this.newUserInfo).then((res)=>{
            if (res.status === 200) {
                const userIndex = this.mainUsers.findIndex(user=>user.id === this.userIdToEdit)
                this.mainUsers[userIndex] = res.data
                this.showAddModal= false
                this.userIdToEdit = null
                this.pagination()
                M.toast({html: 'User Update Successfully ...', classes: 'Orange'});
            }
        }).finally(()=> {
            this.isLoading = false })

       }
}))

})