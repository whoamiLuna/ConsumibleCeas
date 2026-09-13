


const $divItemSucces= document.createElement("div")

const $panelNotification= document.querySelector(".notifications__panel")

const $divContainerNotifications= document.querySelector(".notifications__msg")




async function  fetchFunction({ method, btn}) {
    

    const btnAll= document.querySelectorAll(btn)


    btnAll.forEach(async btn => {

        btn.addEventListener("click",async e => {
               
            e.preventDefault()
            
            const urlbtn= e.currentTarget.dataset.url
            

            const request= await fetch(urlbtn,{
                method:method
            })
            
            
            if (request.ok){
                
                 const jsonData= await request.json()
                 
                 $divItemSucces.classList.add("notifications__msg-message", "success")
                 $divItemSucces.innerHTML=`
                 <i class="msg__message-icon fas fa-check"></i>
                 <span class="msg__message-content">${jsonData.message}</span>
                 `
                 $divContainerNotifications.appendChild($divItemSucces)
                 
                 $panelNotification.classList.add("notifications__active")
                 
                 $panelNotification.dataset.redirect= jsonData.redirect
                 
                 return //?end response
                 
                }else{
                    
                const jsonData= await request.json()
                
                $divItemSucces.classList.add("notifications__msg-message", "error")
                $divItemSucces.innerHTML=`
                <i class="msg__message-icon fas fa-exclamation"></i>
                <span class="msg__message-content">${jsonData.message}</span>
                `
                
                $divContainerNotifications.appendChild($divItemSucces)
                
                $panelNotification.classList.add("notifications__active")
                
                $panelNotification.dataset.redirect= jsonData.redirect
                
                
                return
            }
            
            
            }) 
            
        })
        
    }
    
    
    
export default fetchFunction