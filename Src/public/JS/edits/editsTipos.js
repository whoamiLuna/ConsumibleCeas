import formSubmit from "../formSubmit.js"

const d= document

 const $dataIdTipo= d.querySelector("#editTipo").dataset.id
 
const optFetchTiposEdit={
    method:"POST",
    url:`/admin/equipos/tipos/edit/${$dataIdTipo}`
}



d.addEventListener("DOMContentLoaded",e=>{
    
formSubmit({fetchOptions:optFetchTiposEdit, form:"#editTipo"})

})