
import btnShowForm from "../btnShowForm.js"
import formSubmit from "../formSubmit.js"

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
})