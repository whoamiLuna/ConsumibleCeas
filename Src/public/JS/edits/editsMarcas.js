import formSubmit from "../formSubmit.js"

 
 const d= document

 const $dataId= d.querySelector("#editMarca").dataset.id


const optFetchMarcasEdit={
        method:"POST",
        url:`/admin/equipos/marcas/edit/${$dataId}`
    }






d.addEventListener("DOMContentLoaded", e=>{
    
formSubmit({fetchOptions:optFetchMarcasEdit, form:"#editMarca"})

})