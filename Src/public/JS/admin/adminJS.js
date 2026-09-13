import btnShowForm from "../btnShowForm.js"
import formSubmit from "../formSubmit.js"
import showModalAll from "../showModalAll.js"
import modalShowDelete from "../modalShowDelete.js"

const d=document

//? addusers fecht

const optionsFetchAddUsers={
    method:"POST",
    url: "/signUp"
}



d.addEventListener("DOMContentLoaded",e=>{
    btnShowForm(".adminUser__containerList-adduser",".formContainerShow","formContainerShow-active", ".showForm__crossClose")
    formSubmit({form:"#addUsers",fetchOptions:optionsFetchAddUsers})
    showModalAll({btnAllSelector:".delete", classStringActive:"modalActive",btnCloseOnlySelector:".cancel", classStringModal:".modalContainer"})
    modalShowDelete({btnFetch:".delete"})

    console.log("Admin")
})