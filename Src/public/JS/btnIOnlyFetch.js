





function btnOnlyFetch({nameBtnSelector, fetchFunction}){


    const $btn= document.querySelector(nameBtnSelector)

    $btn.addEventListener("click", e=> {
        
        e.preventDefault()

        fetchFunction()

    })




}


export default btnOnlyFetch