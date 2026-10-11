import btnShowForm from "../btnShowForm.js";
import formSubmit from "../formSubmit.js";

const d = document


const fetchOptionsTiposConsumibles={
    method:"POST",
    url: "/admin/consumibles/tipos"
}

const fetchOptionsMarcasConsumibles={
    method:"POST",
    url:"/admin/consumibles/marca"
}

const fetchOptionsConsumibles={
    method:"POST",
    url: "/admin/consumibles/consumible"
}


d.addEventListener("DOMContentLoaded",e=>{
    formSubmit({form:"#formAddTipoConsumible", fetchOptions:fetchOptionsTiposConsumibles})
    formSubmit({form:"#formAddMarcaConsumible", fetchOptions:fetchOptionsMarcasConsumibles})
    formSubmit({form:"#formAddConsumible", fetchOptions:fetchOptionsConsumibles})
    btnShowForm(".tipoConsumibleBtn",".tipoConsumibleFormShow","formContainerShow-active",".tipoConsumibleCloseBtn")
    btnShowForm(".marcaConsumibleBtn",".marcaConsumibleFormShow","formContainerShow-active",".marcaConsumibleCloseBtn")
    btnShowForm(".ConsumibleBtn",".ConsumibleFormShow","formContainerShow-active",".ConsumibleCloseBtn")
})