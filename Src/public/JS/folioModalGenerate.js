



async function modalGenerate({modalClass, btnActiveModal, btnCreateConsumible, btnCreateEquipo, sectionConsumsibles, sectionEquipos, equipos= false, tipoEdit= null , btnEditAll, mode, urlSubmit }){



const $modal= document.querySelector(modalClass)
const $sectionConsumible= document.querySelector(sectionConsumsibles)
const $sectionEquipos= document.querySelector(sectionEquipos)
const $btnAddConsumibles= document.querySelector(btnCreateConsumible)
const $btnAddEquipos=document.querySelector(btnCreateEquipo)
const $btnActiveModal= document.querySelector(btnActiveModal)
const $btnCloseModal= document.querySelector(".formFolio__actions-cancel")
const $btnEdit= document.querySelectorAll(btnEditAll)
const $formIDChange= document.querySelector("#formFolio")
const $statusSelect= document.querySelector(".form__statusContainer-select")

let consumibles=[]
let equiposAll= []
let consumiblesIndex= 0 //? contador indenticador de div para delete
let idTarget= null //? id for POST REQUEST 


//todo variables render notification
const $divItemSucces= document.createElement("div")

const $panelNotification= document.querySelector(".notifications__panel")

const $divContainerNotifications= document.querySelector(".notifications__msg")


//TODO DELETE FUNCTION RECICLE
async function  deleteConsumible($div){
   
    const $btnDeleteConsumible= $div.querySelector(".consumibleDelete")   

    $btnDeleteConsumible.addEventListener("click", e=> $div.remove())     

    
   }
   
   
   //TODO LOAD DATA MODE CONDITION
   
   async function loadData(){ //?request data both consumible and equipos
      
      const request = await fetch(equipos=== true ? "/capturista/salidas/loadData" : "/capturista/entradas/loadData")
      
      if (request.ok){
         
         const dataJson= await request.json()
         
         
         console.log(dataJson)
         
         consumibles= dataJson.consumibles
         
         equiposAll= dataJson.equipos
         
         
         return consumibles, equiposAll
         
      }else{
         //*render notification bad response
         
         const dataJson= await request.json()    
         
         $divItemSucces.classList.add("notifications__msg-message", "error")
         $divItemSucces.innerHTML=`
         <i class="msg__message-icon fas fa-exclamation"></i>
         <span class="msg__message-content">${dataJson.message}</span>
         `
         
         $divContainerNotifications.appendChild($divItemSucces)
         
         $panelNotification.classList.add("notifications__active")
         
         $panelNotification.dataset.redirect= dataJson.redirect
         
         
         return
      }
   }
   
   
   
   
   
   async function addConsumibles(){
      
      await loadData()
      
      const booster= consumiblesIndex++ //? aumentador
      
      const $div= document.createElement("div")
      
      $div.classList.add("formFolio__addConsumibles-inputContainer")
      
      $div.innerHTML=`
      
      <div class="addConsumibles__inputContainer-container">
      <select class="inputContainer__container-select" name="consumibles[${booster}][id_consumible]" required>
      <option disabled selected>Seleccione un Consumible</option>
      ${ //todo iteration data select
         consumibles.map(c=>{
            return `<option value=${c.id_consumible}>${c.consumible}</option>`
            
         }).join("")
      }
      
      </select>
      <input type="number" required name="consumibles[${booster}][cantidad]" min=1 placeholder="Cantidad" class="inputContainer__container-cantidad">
      </div>
      <div class="addConsumibles__inputContainer-delete">
      <i class="fas fa-times consumibleDelete"></i>   
      </div>   
      
      `
      
      deleteConsumible($div)

      $sectionConsumible.appendChild($div)
      
      
   }
   
   
   
   

async function addEquipos(){ //? addEquipos render


   //? LOAD DATA

   await loadData()

   const $div= document.createElement("div")

   $div.classList.add("formFolio__addEquipos-inputContainerEquipo")
   
   if($sectionEquipos.querySelector(".formFolio__addEquipos-inputContainerEquipo")){ return}


    $div.innerHTML=`
      
      <div class="addEquipos__inputContainerEquipo-container">
         <select class="inputContainerEquipo__container-select" name="equipos" multiple required>
         <option disabled selected>Seleccione un Equipo</option>
         ${ //todo iteration data select
            
            equiposAll.map(e=>{
               return `<option value=${e.id_equipo}>${e.inventario}</option>`
               
            }).join("")
         }  
         
         </select>
      </div>
      `
      
      $sectionEquipos.appendChild($div)
      
      
      new TomSelect($div.querySelector(".inputContainerEquipo__container-select"),{
         maxItems:null,
         plugins: ["remove_button"],
         searchField: ["text"]
      })


}







//!MODAL EDIT
   
async function editFolio() {


$btnEdit.forEach( btn => {
   btn.addEventListener("click", async e=> {

      e.preventDefault()

      const id=e.currentTarget.dataset.id

      idTarget= id


      //?LOAD DATA CONSUMIBLES AND EQUIPOS

       await loadData()

      //?CHANGE MODE EDIT
      mode=  "edit"

      //?addclassList
      $modal.classList.add("formFolio__active")


      //?RESET SECTIONS
      $sectionConsumible.innerHTML= " "
      
      consumiblesIndex= 0

      if(equipos===true){

         $sectionEquipos.innerHTML= " "
         
      }

      const requestEditData= await fetch(tipoEdit === "Entrada" ? `/capturista/entradas/edit/${id}` : `/capturista/salidas/edit/${id}`)
      
      if(requestEditData.ok){
         
         const responseJson= await requestEditData.json()


         const $fragmentConsumible= document.createDocumentFragment()


         //?CHANGE STATUS SELECT

         $statusSelect.children[0].value= tipoEdit=== "Entrada" ? responseJson.status[0].status_entrada : responseJson.status[0].status_salida

         $statusSelect.children[0].textContent= tipoEdit=== "Entrada" ? responseJson.status[0].status_entrada : responseJson.status[0].status_salida
         
      //?CONSUMIBLES RENDER
         if(responseJson.consumibles){
            responseJson.consumibles.forEach( consumable => {

               const $div= document.createElement("div")
               const $boosterEditConsumible= consumiblesIndex++
               $div.classList.add("formFolio__addConsumibles-inputContainer")
                
               $div.innerHTML= `
                  <div class="addConsumibles__inputContainer-container">
                   <select class="inputContainer__container-select" name="consumibles[${$boosterEditConsumible}][id_consumible]" required>
                     <option disabled selected value=${consumable.id_consumible}>${consumable.consumible}</option>
                     ${ //todo iteration data select
                        consumibles.map(c=>{
                        return `<option value=${c.id_consumible}>${c.consumible}</option>`
                        
                        }).join("")
                     }
                     
                  </select>
                  <input type="number" required name="consumibles[${$boosterEditConsumible}][cantidad]" min=1 placeholder="Cantidad" class="inputContainer__container-cantidad" value=${consumable.cantidad}>
               </div>
               <div class="addConsumibles__inputContainer-delete">
                  <i class="fas fa-times consumibleDelete"></i>   
               </div>    
               `
               deleteConsumible($div)

               $fragmentConsumible.appendChild($div)
         });

         $sectionConsumible.appendChild($fragmentConsumible)
         
         }

         //?EQUIPOS RENDER

         if(responseJson.equipos){
            
            console.log(responseJson.equipos)

            const $div= document.createElement("div")

         $div.classList.add("formFolio__addEquipos-inputContainerEquipo")
         
         if($sectionEquipos.querySelector(".formFolio__addEquipos-inputContainerEquipo")){ return}

         $div.innerHTML=`
            
            <div class="addEquipos__inputContainerEquipo-container">
               <select class="inputContainerEquipo__container-select" name="equipos" multiple required>
               ${ //todo iteration data select response edit
                  responseJson.equipos.map(e=>{
                     return `<option value=${e.id_equipo} selected>${e.inventario}</option>`
                     
                  }).join("")
               }  
               ${//todo iteration data load response
                  equiposAll.map(e =>{
                     return `<option value=${e.id_equipo}>${e.inventario}</option>`
                  }).join("")
               }
               </select>
            </div>
            `
            
            $sectionEquipos.appendChild($div)
            
            
            new TomSelect($div.querySelector(".inputContainerEquipo__container-select"),{
               maxItems:null,
               plugins: ["remove_button"],
               searchField: ["text"]
            })
               }

      }



   })

})

                 
}










//TODO PRINCIPAL MODAL ACTION 
$btnActiveModal.addEventListener("click",async e =>{
   
   e.preventDefault()
   
   
   $modal.classList.add("formFolio__active")
   

   //todo reset section

   $sectionConsumible.innerHTML=` `
   
   if(equipos===true) {
      $sectionEquipos.innerHTML= ` `
   }


   //TODO RESET SELECT STATUS LABEL

   $statusSelect.children[0].textContent= "Selecciona un Estatus"
      


})


   //*create consumible
   $btnAddConsumibles.addEventListener("click", e =>{
      addConsumibles()
   })

   
   //*create equipo
   if(equipos===true){
      $btnAddEquipos.addEventListener("click", e => {
         addEquipos()

      })
   }

   //*close modal
   $btnCloseModal.addEventListener("click", e => {
      
      e.preventDefault()
      
      $modal.classList.remove("formFolio__active")

   })


   //TODO EDIT OPTION  
   
   if(tipoEdit){

      editFolio()


   }



   //!SUBMIT SEND FETCH   

   $formIDChange.addEventListener("submit", async e =>{

       e.preventDefault()

        
  
        const formData = new FormData($formIDChange) //?URLENCODED EXPRESS TRUE

        
        const request= await fetch(mode==="create" ? `${urlSubmit}` : `${urlSubmit}/edit/${idTarget}` ,{
         method:"POST",
         body: formData,
    })

    const response= await request.json()

    console.log(request)
    console.log(response)

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

   })





}






export default modalGenerate





