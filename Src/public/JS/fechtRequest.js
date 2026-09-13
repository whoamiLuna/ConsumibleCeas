

const $divItemSucces= document.createElement("div")

const $panelNotification= document.querySelector(".notifications__panel")

const $divContainerNotifications= document.querySelector(".notifications__msg")




async function fetchRequest({method,dataBody,url}){
    

    const formData = new FormData(dataBody)


    const data = {}

    formData.forEach((value, key) => {
        if (key.endsWith("[]")) {
            if (!data[key]) {
                data[key] = []
            }
            data[key].push(value)
        } else {
            data[key] = value
        }
    })

    const bodyJson = JSON.stringify(data)

    console.log("data", bodyJson)
    
    const request= await fetch(url,{
         method,
         body: bodyJson,
         headers:{
            "Content-Type": "application/json"
         }
        
    })

    const response= await request.json()

    try {
        
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


}

export default fetchRequest