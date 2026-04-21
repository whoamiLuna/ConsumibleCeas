import formSubmit from "../formSubmit.js";



const d=document

const form=d.querySelector("#editConsumible").dataset.id


const optFetchAreas={
    method:"POST",
    url:`/admin/consumibles/consumible/edit/${form}`
}


d.addEventListener("DOMContentLoaded",e=>{
    formSubmit({form:"#editConsumible",fetchOptions:optFetchAreas})
})

