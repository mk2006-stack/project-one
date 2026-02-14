
document.addEventListener('alpine:init', () => {
    Alpine.data('usersData', ()=>({
         users:[],
         pageUsers: [],
         isLoading: false,
         showAddModal : false,
         pageCount: 1,
         itemsCount: 4,
         currentPage: 3,
         getUsers(){
             this.isLoading = true
             axios.get("https://jsonplaceholder.typicode.com/users").then((res)=>{
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
        }
     }))

})