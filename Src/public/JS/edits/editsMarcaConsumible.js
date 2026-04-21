import formSubmit from "../formSubmit.js";





const d=document;

const idDataMarcaConsumible= d.querySelector("#editMarcaConsumible").dataset.id


const optFetchDireccion= {
    method:"POST",
    url:`/admin/consumibles/marca/edit/${idDataMarcaConsumible}`
}




d.addEventListener("DOMContentLoaded",e=>{
    formSubmit({form:"#editMarcaConsumible",fetchOptions:optFetchDireccion})

})