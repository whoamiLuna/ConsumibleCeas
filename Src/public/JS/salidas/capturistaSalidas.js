import modalGenerate from "../folioModalGenerate.js";
import fetchPDFOpen from "../fetchPDFOpen.js";
import modalShowDelete from "../modalShowDelete.js";
import showModalAll from "../showModalAll.js";
import fetchFunction from "../fetchFunction.js";
import fetchExcel from "../fecthExcel.js";
import btnOnlyFetch from "../btnIOnlyFetch.js";

const d= document



d.addEventListener("DOMContentLoaded",e =>{
    
    modalGenerate({modalClass:".formFolio",btnActiveModal:".btn_addSalida",btnCreateConsumible:".formFolio__addConsumible-btnAdd", btnCreateEquipo:".formFolio__addEquipos-btnAdd", sectionConsumsibles:".formFolio__addConsumibles-consumibles", sectionEquipos:".formFolio__addEquipos-equipos",equipos:true,tipoEdit:"Salida",btnEditAll:".edit", mode:"create", urlSubmit:"/capturista/salidas"})
    fetchPDFOpen({method:"GET", btn: ".details"})
    modalShowDelete({btnFetch:".archive"})
    showModalAll({btnAllSelector:".archive", classStringActive:"modalActive",btnCloseOnlySelector:".cancel", classStringModal:".modalContainer"})
    fetchFunction({btn: ".acept", method:"POST"})
    btnOnlyFetch({nameBtnSelector:".btnExportSalidas", fetchFunction: ()=> (fetchExcel({url:"/capturista/salidas/export", nameExcel:"Salidas",redirectSuccess:"/capturista/salidas"}))})

})           