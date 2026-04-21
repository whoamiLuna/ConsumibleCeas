import formSubmit from "../formSubmit.js";
import tomSelectCustom from "../tomSelect.js";


const d=document

const form=d.querySelector("#editEquipo").dataset.id


const optFetchEquipos={
    method:"POST",
    url:`/admin/equipos/equipo/edit/${form}`
}

const optionsSelect={
    maxItems:null, //ilimitado
    plugins:["remove_button"],
    searchField:["text"],
}



d.addEventListener("DOMContentLoaded",e=>{
    formSubmit({form:"#editEquipo",fetchOptions:optFetchEquipos})
    tomSelectCustom("#consumibleEdit",optionsSelect)
})
