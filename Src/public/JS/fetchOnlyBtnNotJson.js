


async function fetchRequestNotJson({method,url, formiD}){
    
    const $form= document.querySelector(formiD)
    
    
    $form.addEventListener("submit", async e=>{
        
        e.preventDefault()

        const formData = new FormData($form) //?URLENCODED EXPRESS TRUE

        
        const request= await fetch(url,{
         method,
         body: formData,
    })

    const response= await request.json()

    try {
        
        const $divItemSucces= document.createElement("div")

        const $panelNotification= document.querySelector(".notifications__panel")

        const $divContainerNotifications= document.querySelector(".notifications__msg")

        //?success response message
        if(request.ok){
            if(response.message.length > 0){

                $divItemSucces.classList.add("notifications__msg-message", "success")
                $divItemSucces.innerHTML=`
                <i class="msg__message-icon fas fa-check"></i>
                <span class="msg__message-content">${response.message}</span>
                `
                
                $divContainerNotifications.appendChild($divItemSucces)
                
                $panelNotification.classList.add("notifications__active")
                
            }

            $panelNotification.dataset.redirect= response.redirect
            


        }else{ //? error response message 
        
            if(response.message?.length > 0){        
                $divItemSucces.classList.add("notifications__msg-message", "error")
                $divItemSucces.innerHTML=`
                <i class="msg__message-icon fas fa-exclamation"></i>
                <span class="msg__message-content">${response.message}</span>
                `
                
                $divContainerNotifications.appendChild($divItemSucces)
                 
                $panelNotification.classList.add("notifications__active")
                
            }
            
            if(response.messageValidator?.length > 0){
                
                const $fragment= document.createDocumentFragment()
                
                response.messageValidator.forEach(err => {
                    const $div= document.createElement("div")
                    $div.classList.add("notifications__msg-message", "error")
                    $div.innerHTML=`
                    <i class="msg__message-icon fas fa-exclamation"></i>
                    <span class="msg__message-content">${err}</span>
                    `
                    
                    $fragment.appendChild($div)
                    
                });
                
                $panelNotification.classList.add("notifications__active")
                $divContainerNotifications.appendChild($fragment)

            }


           $panelNotification.dataset.redirect= response.redirect
            
            
        }





    } catch (error) {
        
        console.log(error)
    }   






    })
    
    


}

export default fetchRequestNotJson