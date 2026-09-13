import fetchRequestNotJson from "../fetchOnlyBtnNotJson.js"
import formSubmit from "../formSubmit.js"
import tomSelectCustom from "../tomSelect.js"
fetchRequestNotJson
const d= document

 const $dataIdTipo= d.querySelector("#editTipo").dataset.id
 
const optFetchTiposEdit={
    method:"POST",
    url:`/admin/equipos/tipos/edit/${$dataIdTipo}`
}



d.addEventListener("DOMContentLoaded",e=>{
 tomSelectCustom("#consumibleEdit", {
    maxItems:null, //ilimitado
    plugins:["remove_button"],
    searchField:["text"],
})
//formSubmit({fetchOptions:optFetchTiposEdit, form:"#editTipo"})
fetchRequestNotJson({method:"POST", url:`/admin/equipos/tipos/edit/${$dataIdTipo}`,formiD:"#editTipo"})
})