import formSubmit from "../formSubmit.js";


const d=document

const form=d.querySelector("#editEquipo").dataset.id


const optFetchEquipos={
    method:"POST",
    url:`/admin/equipos/equipo/edit/${form}`
}


d.addEventListener("DOMContentLoaded",e=>{
    formSubmit({form:"#editEquipo",fetchOptions:optFetchEquipos})
})
