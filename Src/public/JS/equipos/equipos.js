import btnShowForm from "../btnShowForm.js"
import formSubmit from "../formSubmit.js"
import tomSelectCustom from "../tomSelect.js"
import btnOnlyFetch from "../btnIOnlyFetch.js"
import fetchExcel from "../fecthExcel.js"
import showModalAll from "../showModalAll.js"
import modalShowDelete from "../modalShowDelete.js"

const d= document

const fetchOptionsMarcas={
url: `/admin/marcas/equipo`,
method: "POST"
}

const fetchOptionsModelos={
    url:"/admin/marcas/modelo",
    method:"POST"
}


const fetchOptionsTipos={
    url:"/admin/marcas/tipo",
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
    tomSelectCustom("#consumibleSelect",optionsSelect)
    formSubmit({form:"#formAddMarca",fetchOptions:fetchOptionsMarcas})
    formSubmit({form:"#formAddModelo",fetchOptions:fetchOptionsModelos})
    formSubmit({form:"#formAddTipos",fetchOptions:fetchOptionsTipos})
    formSubmit({form:"#formAddEquipo",fetchOptions:fetchOptionsEquipos})
    btnShowForm(".marcasBtn", ".marcaFormShow","formContainerShow-active",".marcaCloseBtn")
    btnShowForm(".modelosBtn", ".modeloFormShow","formContainerShow-active",".modeloCloseBtn")
    btnShowForm(".tipoBtn", ".tipoFormShow","formContainerShow-active",".tipoCloseBtn")
    btnShowForm(".btn_addEquipo", ".equipoFormShow","formContainerShow-active",".equipoCloseBtn")
    btnOnlyFetch({nameBtnSelector:".btnExportEquipo",fetchFunction:()=> {fetchExcel({url:"/admin/equipos/export",nameExcel:"Equipos Totales"})}})
    showModalAll({btnAllSelector:".delete", classStringActive:"modalActive",btnCloseOnlySelector:".cancel", classStringModal:".modalContainer"})
    showModalAll({btnAllSelector:".container__item-deleteContainer", classStringActive:"modalActive",btnCloseOnlySelector:".cancel", classStringModal:".modalContainer"})
    modalShowDelete({btnFetch:".container__item-deleteContainer"})

})