import btnShowForm from "../btnShowForm.js"
import BtnMenuToogle from "../btnMenuToogle.js"

const d=document



d.addEventListener("DOMContentLoaded",e=>{
    btnShowForm(".adminUser__containerList-adduser",".formContainerShow","formContainerShow-active", ".showForm__crossClose")
    BtnMenuToogle(".btn__notification", "notifications__active",".notifications")
    console.log("Admin")
})