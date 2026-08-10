
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
            number:"",
            email:"",
            address: {
             street: "",
             city:""
            },
         },
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

    // بستن Modal
    this.showAddModal = false;

    // خالی کردن فرم
    this.newUserInfo = {
        name: "",
        username: "",
        number: "",
        email: "",
        address: {
            street: "",
            city: ""
        },
        description: ""
    };

    console.log("ALL USERS:", this.users);
    console.log("PAGE USERS:", this.pageUsers);
}}))

})