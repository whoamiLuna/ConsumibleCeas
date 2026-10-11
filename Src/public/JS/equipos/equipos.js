import btnShowForm from "../btnShowForm.js"
import formSubmit from "../formSubmit.js"
import tomSelectCustom from "../tomSelect.js"
import btnOnlyFetch from "../btnIOnlyFetch.js"
import fetchExcel from "../fecthExcel.js"
import fetchRequestNotJson from "../fetchOnlyBtnNotJson.js"

const d= document

const fetchOptionsMarcas={
url: `/admin/marcas/equipo`,
method: "POST"
}

const fetchOptionsModelos={
    url:"/admin/marcas/modelo",
    method:"POST"
}


const fetchOptionsEquipos={
    url:"/admin/equipos/equipo",
    method:"POST"
}


//! select custom TOM SELECT JS 

const optionsSelect={
    maxItems:null, //ilimitado
    plugins:["remove_button"],
    searchField:["text"],
}



   
d.addEventListener("DOMContentLoaded", e =>{
    tomSelectCustom("#selectConsumiblesAdd",optionsSelect)
    formSubmit({form:"#formAddMarca",fetchOptions:fetchOptionsMarcas})
    formSubmit({form:"#formAddModelo",fetchOptions:fetchOptionsModelos})
    fetchRequestNotJson({formiD:"#formAddTipos", method:"POST", url:"/admin/marcas/tipo"})
    formSubmit({form:"#formAddEquipo",fetchOptions:fetchOptionsEquipos})
    btnShowForm(".marcasBtn", ".marcaFormShow","formContainerShow-active",".marcaCloseBtn")
    btnShowForm(".modelosBtn", ".modeloFormShow","formContainerShow-active",".modeloCloseBtn")
    btnShowForm(".tipoBtn", ".tipoFormShow","formContainerShow-active",".tipoCloseBtn")
    btnShowForm(".btn_addEquipo", ".equipoFormShow","formContainerShow-active",".equipoCloseBtn")
    btnOnlyFetch({nameBtnSelector:".btnExportEquipo",fetchFunction:()=> {fetchExcel({url:"/admin/equipos/export",nameExcel:"Equipos Totales", redirectSuccess:"/admin/equipos"})}})

})