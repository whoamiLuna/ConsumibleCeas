

/**
 * @param  {string} classBtn: Btn que activa el formulario,querySelector
 * @param {string} clasFormShow: clase de formulario, querySelector
 * @param {string} classFormClose: clase de Btn para cerrar formulario, queryselector
 * @param {string} classStyleAdd: clase que se agrega para mostrar formulario, posterior a eliminar
 */
const d= document


function btnShowForm(classBtn, classFormShow,classStyleAdd, classFormClose){
    
    const btnShow= d.querySelector(classBtn)
    const btnClose=d.querySelector(classFormClose)
    const formShow=d.querySelector(classFormShow)

    const open= btnShow.addEventListener("click",(e)=>{
        e.preventDefault()
        
        formShow.classList.add(classStyleAdd)
    })
    
    const close= btnClose.addEventListener("click", (e)=>{
         formShow.classList.remove(classStyleAdd)
    })

    
    return open, close

}

export default btnShowForm