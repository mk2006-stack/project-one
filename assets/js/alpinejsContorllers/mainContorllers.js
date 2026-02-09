
document.addEventListener('alpine:init', () => {
    Alpine.data('mainData', () => (
      {
         message:' i love you' ,
          names: ['mmd' , 'amir' , 'ali'] ,
     testFunc(){
      alert(this.message)
    }
}))
   
})