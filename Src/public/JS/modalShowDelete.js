



//todo consult delete values





async function modalShowDelete({ btnFetch}){

    const $modalContentData=document.querySelector(".modalDelete__contentData")
    const $fragmentValuesDelete= document.createDocumentFragment()
    const $deleteBtnAll= document.querySelectorAll(btnFetch)

    
    $deleteBtnAll.forEach(btn => {
        
        
        btn.addEventListener("click", async e=>{
            
            e.preventDefault()
            console.log(e.currentTarget)
            
            const urlBtn= e.currentTarget.dataset.url

            const request= await fetch(`${urlBtn}`)

            
                if (request.ok){    
                    const response= await request.json()
                    
                    if(response.dataTotals && response.dataTotals.length > 0){

                        $modalContentData.innerHTML=`  `
                        
                        response.dataTotals.forEach(total => {
                            
                            const $divModalData= document.createElement("div")
                            $divModalData.classList.add("modalDelete__contentData-data")
                            
                            $divModalData.innerHTML=`
                            <span class="contentData__data-data key">${total.label}</span>
                            <span class="contentData__data-data value">${total.value}</span>
                            `
                            
                            $fragmentValuesDelete.appendChild($divModalData)
                            
                        });

                        $modalContentData.appendChild($fragmentValuesDelete)

                    }
                
                }else{
                    
                
                    alert("Hubo un error de consulta para eliminar")
                }

    })








        })

    
        



      






}

export default modalShowDelete