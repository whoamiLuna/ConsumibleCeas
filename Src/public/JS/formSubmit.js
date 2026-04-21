import fetchRequest from "./fechtRequest.js"



const d = document


async function formSubmit({form, fetchOptions}){

   
    const $form = d.querySelector(form)
    
    const optFetch={
         ...fetchOptions,
         dataBody: $form
    }


    $form.addEventListener("submit",e=>{
        
        e.preventDefault()


        fetchRequest(optFetch)

    

        $form.reset()

    })

    


}


export default formSubmit