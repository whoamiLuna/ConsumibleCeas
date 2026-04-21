
const d= document;



function btnClose({btnClose,classRemove,classSelectorClose}){
     
    const $btnClose= d.querySelector(btnClose);
    const $TagClose= d.querySelector(classSelectorClose)
    const $panelNotification= d.querySelector(".notifications__panel")
    
    
    $btnClose.addEventListener("click", e =>{
        
        $TagClose.classList.remove(classRemove)

        setTimeout(()=>{
                window.location.href= $panelNotification.dataset.redirect
            },600)
    
    })

}


export default btnClose