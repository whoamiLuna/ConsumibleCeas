import formSubmit from "../formSubmit.js";





const d=document;

const idDataDireccion= d.querySelector("#editDireccion").dataset.id


const optFetchDireccion= {
    method:"POST",
    url:`/admin/areas/direccion/edit/${idDataDireccion}`
}




d.addEventListener("DOMContentLoaded",e=>{
    formSubmit({form:"#editDireccion",fetchOptions:optFetchDireccion})

})