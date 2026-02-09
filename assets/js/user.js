document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, {});


  const addUserButton = document.getElementById('add_user_button')
 addUserButton.addEventListener('click', ()=>{
   document.querySelector('.add_user_modal').classList.add('show')
   document.querySelector('.add_user_modal_back').classList.remove('dis-none')
})

    document.querySelector('.add_user_modal_back').addEventListener('click', (e)=>{
        document.querySelector('.add_user_modal').classList.remove('show')
        e.target.classList.add('dis-none')
    })

// setTimeout(function(){
//   console.log("start...");
// fetch('https://jsonplaceholder.typicode.com/users')
//   .then((response) => response.json())
//   .then((json) => {
//     console.log("end...");
//      console.log(json)

//        let html = "" 

//      for (const user of json){

//     html = html + `<tr>
//                    <td>${user.id}</td>
//                    <td> ${user.name} </td>
//                    <td>${user.username}</td>
//                    <td>${user.phone}</td>
//                    <td>${user.email}</td>
//                    <td>${user.address.city}</td>
//                    <td><i class="material-icons red-text darken-3  m-r-5 m-r-5 pos-relative top-7">delete_forever</i>
//                    <i class="material-icons green-text darken-3  m-l-5 m-r-5 pos-relative top-7 " >edit</i></td>
//                </tr>` 

//      }

//       document.querySelector('.desktop_table_body').innerHTML = html


    

// });
// },5000)
  
  });     