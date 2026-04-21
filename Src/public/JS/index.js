import BtnMenuToogle from "./btnMenuToogle.js"
import btnClose from "./btnClose.js"

const d= document


d.addEventListener("DOMContentLoaded",e=>{
    BtnMenuToogle(".aside__iconMenu","aside__active",".aside")
    btnClose({btnClose:".notifications__panel-icon",classRemove:"notifications__active",classSelectorClose:".notifications__panel"})
})