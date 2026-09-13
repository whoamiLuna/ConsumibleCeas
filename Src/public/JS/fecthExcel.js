 


const $divItemSucces= document.createElement("div")

const $panelNotification= document.querySelector(".notifications__panel")

const $divContainerNotifications= document.querySelector(".notifications__msg")




async function fetchExcel({url, nameExcel,redirectSuccess}){
    

    const request= await fetch(url)
    
    //? se pregunta a las cabeceras 
    const contentHeader= request.headers.get("content-type")

    if(contentHeader.includes("application/json")){
        
        const jsonResponse= await request.json()

        $divItemSucces.classList.add("notifications__msg-message", "error")
                    $divItemSucces.innerHTML=`
                    <i class="msg__message-icon fas fa-check"></i>
                    <span class="msg__message-content">${jsonResponse.message}</span>
                    `
                    $divContainerNotifications.appendChild($divItemSucces)
                    
                    $panelNotification.classList.add("notifications__active")

                    $panelNotification.dataset.redirect= jsonResponse.redirect

                    return //?end response
    }


    const blob = await request.blob()

    const urlBlob = window.URL.createObjectURL(blob) //? create url blob file from backend excel in memory

    const a = document.createElement("a") //? force download
    a.href = urlBlob
    a.download = nameExcel
    a.click()

    window.URL.revokeObjectURL(urlBlob) //? delete blob url from memory


    $divItemSucces.classList.add("notifications__msg-message", "success")
                    $divItemSucces.innerHTML=`
                    <i class="msg__message-icon fas fa-check"></i>
                    <span class="msg__message-content">Exportación Exitosa</span>
                    `
                    $divContainerNotifications.appendChild($divItemSucces)
                    
                    $panelNotification.classList.add("notifications__active")

                    $panelNotification.dataset.redirect= redirectSuccess
                
            

}



export default fetchExcel