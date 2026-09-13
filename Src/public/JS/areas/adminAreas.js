
import btnShowForm from "../btnShowForm.js"
import formSubmit from "../formSubmit.js"
import showModalAll from "../showModalAll.js"
import modalShowDelete from "../modalShowDelete.js"
import btnOnlyFetch from "../btnIOnlyFetch.js"
import fetchFunction from "../fetchFunction.js"

console.log("AREAS")

const d= document



//? direccion
const optionsFetchDireccion={
method:"POST",
url:"/admin/areas/direccion"    

}

const optionsFetchAreas={
    method:"POST",
    url:"/admin/areas/areas"
}

    

d.addEventListener("DOMContentLoaded",e=>{ 
    formSubmit({form:"#formAddDireccion",fetchOptions:optionsFetchDireccion})
    formSubmit({form:"#formAddArea",fetchOptions:optionsFetchAreas})
    btnShowForm(".DireccionBtn",".FormDireccion","formContainerShow-active",".closeDireccion")
    btnShowForm(".areaBtn",".formAreas","formContainerShow-active",".formAreaClose")
    showModalAll({btnAllSelector:".container__item-deleteContainer", classStringActive:"modalActive",btnCloseOnlySelector:".cancel", classStringModal:".modalContainer"})
    modalShowDelete({btnFetch:".container__item-deleteContainer"})
    fetchFunction({method:"POST", btn:".acept"})
})