import formSubmit from "../formSubmit.js"

const d= document

 const $dataIdTipo= d.querySelector("#editUsuario").dataset.id
 
const optFetchTiposEdit={
    method:"POST",
    url:`/admin/users/edit/${$dataIdTipo}`
}



d.addEventListener("DOMContentLoaded",e=>{
    
formSubmit({fetchOptions:optFetchTiposEdit, form:"#editUsuario"})

})