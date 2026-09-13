import fetchExcel from "../fecthExcel.js";
import btnOnlyFetch from "../btnIOnlyFetch.js";

const d= document



d.addEventListener("DOMContentLoaded",e =>{
    
    btnOnlyFetch({nameBtnSelector:".btnExportStock", fetchFunction: ()=> (fetchExcel({url:"/capturista/stock/export", nameExcel:"Stock",redirectSuccess:"/capturista/stock"}))})

})           