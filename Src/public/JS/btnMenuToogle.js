

const d=document

/**
 * 
 * @param {string} btnName:inyecta a un queryselector
 * @param {string} classActive: clase que se activa del menu con classlits.add
 * @param {string} headerClass: clase de header o aside que inyecta a un querySelector
 */

function BtnMenuToogle(btnName,classActive,headerClass){
    
    const btn= d.querySelector(btnName)
    const Nav= d.querySelector(headerClass)

    return btn.addEventListener("click",e=>{
        Nav.classList.toggle(classActive)
    })
}


export default BtnMenuToogle