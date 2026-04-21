
import formSubmit from "../formSubmit.js"

const d= document

 const $dataIdModelo= d.querySelector("#editModelo").dataset.id
 
const optFetchModelosEdit={
    method:"POST",
    url:`/admin/equipos/modelos/edit/${$dataIdModelo}`
}



d.addEventListener("DOMContentLoaded",e=>{
    
formSubmit({fetchOptions:optFetchModelosEdit, form:"#editModelo"})

})