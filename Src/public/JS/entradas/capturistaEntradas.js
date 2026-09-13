import modalGenerate from "../folioModalGenerate.js";
import fetchPDFOpen from "../fetchPDFOpen.js";
import modalShowDelete from "../modalShowDelete.js";
import showModalAll from "../showModalAll.js";
import fetchFunction from "../fetchFunction.js";
import fetchExcel from "../fecthExcel.js";
import btnOnlyFetch from "../btnIOnlyFetch.js";

const d= document



d.addEventListener("DOMContentLoaded",e =>{
    
    modalGenerate({modalClass:".formFolio",btnActiveModal:".btn_addEntrada",btnCreateConsumible:".formFolio__addConsumible-btnAdd", btnCreateEquipo:".formFolio__addEquipos-btnAdd", sectionConsumsibles:".formFolio__addConsumibles-consumibles", sectionEquipos:".formFolio__addEquipos-equipos",equipos:false,tipoEdit:"Entrada",btnEditAll:".edit", mode:"create", urlSubmit:"/capturista/entradas"})
    fetchPDFOpen({method:"GET", btn: ".details"})
    modalShowDelete({btnFetch:".archive"})
    showModalAll({btnAllSelector:".archive", classStringActive:"modalActive",btnCloseOnlySelector:".cancel", classStringModal:".modalContainer"})
    fetchFunction({btn: ".acept", method:"POST"})
    btnOnlyFetch({nameBtnSelector:".btnExportEntradas", fetchFunction: ()=> (fetchExcel({url:"/capturista/entradas/export", nameExcel:"Entradas",redirectSuccess:"/capturista/entradas"}))})

})          