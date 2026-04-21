import formSubmit from "../formSubmit.js";





const d=document;

const idDataTipoConsumible= d.querySelector("#editTipoConsumible").dataset.id


const optFetchDireccion= {
    method:"POST",
    url:`/admin/consumibles/tipo/edit/${idDataTipoConsumible}`
}




d.addEventListener("DOMContentLoaded",e=>{
    formSubmit({form:"#editTipoConsumible",fetchOptions:optFetchDireccion})

})