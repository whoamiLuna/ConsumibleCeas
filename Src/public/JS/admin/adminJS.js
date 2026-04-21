import btnShowForm from "../btnShowForm.js"
import formSubmit from "../formSubmit.js"


const d=document

//? addusers fecht

const optionsFetchAddUsers={
    method:"POST",
    url: "/signUp"
}



d.addEventListener("DOMContentLoaded",e=>{
    btnShowForm(".adminUser__containerList-adduser",".formContainerShow","formContainerShow-active", ".showForm__crossClose")
    formSubmit({form:"#addUsers",fetchOptions:optionsFetchAddUsers})
    console.log("Admin")
})