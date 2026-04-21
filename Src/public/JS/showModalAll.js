



function showModalAll({btnAllSelector, classStringActive, btnCloseOnlySelector, classStringModal}){
    

    const $bntShow= document.querySelectorAll(btnAllSelector)

    const $btnClose= document.querySelector(btnCloseOnlySelector)

    const $modal= document.querySelector(classStringModal)

    $bntShow.forEach(btn =>{
        
        btn.addEventListener("click", e=>{
            e.preventDefault()

        
            return $modal.classList.add(classStringActive)
            

        })

    
    })

    $btnClose.addEventListener("click", e=>{
        
       return $modal.classList.remove(classStringActive)
    })


}


export default showModalAll