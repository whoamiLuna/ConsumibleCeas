import formSubmit from "../formSubmit.js";



const d=document

const formAreaSet=d.querySelector("#editArea").dataset.id


const optFetchAreas={
    method:"POST",
    url:`/admin/areas/areas/edit/${formAreaSet}`
}


d.addEventListener("DOMContentLoaded",e=>{
    formSubmit({form:"#editArea",fetchOptions:optFetchAreas})
})

