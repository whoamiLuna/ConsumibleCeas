import btnShowForm from "../btnShowForm.js";
import formSubmit from "../formSubmit.js";
import showModalAll from "../showModalAll.js";
import modalShowDelete from "../modalShowDelete.js";
import fetchFunction from "../fetchFunction.js";

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
    showModalAll({btnAllSelector:".container__item-deleteContainer", classStringActive:"modalActive",btnCloseOnlySelector:".cancel", classStringModal:".modalContainer"})   
    modalShowDelete({btnFetch:".container__item-deleteContainer"})  
    fetchFunction({method:"POST", btn:".acept"})
})