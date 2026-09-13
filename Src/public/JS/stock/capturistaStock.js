import fetchExcel from "../fecthExcel.js";
import btnOnlyFetch from "../btnIOnlyFetch.js";

const d= document



d.addEventListener("DOMContentLoaded",e =>{
    
    btnOnlyFetch({nameBtnSelector:".btnExportStock", fetchFunction: ()=> (fetchExcel({url:"/client/stock/export", nameExcel:"Stock",redirectSuccess:"/client/stock"}))})

})           