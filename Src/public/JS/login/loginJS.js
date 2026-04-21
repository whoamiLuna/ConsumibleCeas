import formSubmit from "../formSubmit.js";


const d= document;

const fetchOptionsLogin={
    method:"POST",
    url: "/",
}


d.addEventListener("DOMContentLoaded", e =>{
    formSubmit({form:"#formLogin", fetchOptions: fetchOptionsLogin})
    console.log("login")
})