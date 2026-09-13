    import PDFDocument from "pdfkit-table"
    import { dirname, join } from "path"
    import { fileURLToPath } from "url"

    const ruteAbsolute = dirname(fileURLToPath(import.meta.url))



    async function pdfKitLayout({res,ifEntrada= false, entradas, entradaFolio, ifSalida=false, salidaFolio, salidasConsumibles, salidasEquipos, totalEntrada, totalSalida}){

    try {
        
         const doc= new PDFDocument({
        size:"letter",
        margin:40,
        font:"Helvetica" //? rute ?
    })


    res.setHeader("Content-Type", "application/pdf")


    res.setHeader("Content-Disposition", "inline")


    doc.pipe(res)




    //TODO  Header Render
    doc.image(join(ruteAbsolute,"../public/IMG/Logo_CEAS.png"), 30, 45, {width: 60})

    doc.fontSize(18.5).text("COMISION ESTATAL DE AGUA Y SANEAMIENTO", 40, 50, {
        align:"center",

    })

    doc.image(join(ruteAbsolute,"../public/IMG/logo_tabasco.png"), 530, 45,{width:50})


    doc.fontSize(16).text("DIRECCION DE ADMINISTRACIÓN",{
        align:"center"
    })


    doc.fontSize(14).text("DEPARTAMENTO DE INFORMÁTICA",{align:"center"})

    doc.moveDown(2)


    //?TABLE HEADER GENERATED



    if(ifEntrada=== true || ifSalida=== true){

    await doc.table(
        {
            headers:[{
                align:"center",
                label:"Folio",
                property:"folio",
                padding:2.5
            },{
                align:"center",
                label:"Fecha",
                property:"fecha_entrada",
                padding:2.5
            },{
                align:"center",
                label:"Movimiento",
                property:"entrada",
                padding:2.5
            }],
            rows: [[ifEntrada=== true ? entradaFolio[0].folio : salidaFolio[0].folio, ifEntrada===true ? entradaFolio[0].fecha_entrada : salidaFolio[0].fecha_salidas, ifEntrada===true ? "Entrada" : "Salida"]],
            
        },{
            
            prepareHeader: ()=>{
                doc.fontSize(11)
            }
        })


    }


    doc.moveDown(2)



    //! RENDER CONTENT TABLE


    if(ifEntrada=== true || ifSalida=== true){
        
    await doc.table({
            headers:[{
            align:"center",
            label:"No.",
            property:"No.",
            padding:2.3,
            },{
                align:"center",
                label:"Consumible",
                padding:2.3,
            },{
                align:"center",
                label:"Cantidad",
                padding:2.3,
            }
        ],
            rows: ifEntrada === true ? entradas : salidasConsumibles
        },{
            prepareHeader: ()=>{
                doc.fontSize(11)
            }
        })


        doc.moveDown()

        //? TOTALS CONSUMIBLES
        
        doc.font("Helvetica-Bold").fontSize(8.5).text(`Total de Consumibles ${ifEntrada === true ? totalEntrada.total : totalSalida.total}`,{align:"left "})
    
           
        if(ifSalida=== true){
            
            doc.moveDown(1)
            doc.fontSize(14).text("Para ser Utilizado en los equipos")
            doc.moveDown(1)

        await doc.table({
                headers: [{
                    align:"center",
                    label:"No.",
                    padding:2.3
                    
                },{
                    align:"center",
                    label:"Tipo de Equipo",
                    padding:2.3
                    
                },{
                    align:"center",
                    label: "Modelo",
                    padding:2.3,
                },{
                    align:"center",
                    label:"Inventario",
                    padding:2.3
                },{
                    align:"center",
                    label:"Area",
                    padding:2.3
                }],
                rows:salidasEquipos
            },{ prepareHeader: ()=> { doc.fontSize(11).font("Helvetica")}})
            
            
            //TODO FIRMAS
            if(salidaFolio[0].status_salida === "CANCELADO"){
                
                doc.moveDown(2)
                doc.fillColor("red").fontSize(32).text("CANCELADO",{align:"center",})
            }
            doc.moveDown(1)

            const firmaY = doc.y
            
            //?LINEAS
            doc.moveTo(70,firmaY).lineTo(250, firmaY).stroke()
            
            doc.moveTo(360, firmaY).lineTo(540, firmaY).stroke()
    
            doc.moveDown(1)
            doc.fillColor("black").fontSize(10).text("Firma de Responsable de Salida",88, firmaY + 2)
            
            doc.fillColor("black").fontSize(10).text("Firma de Recibido", 335, firmaY + 2, {align: "center"})
            
            
        }
        
    }
    
    
    //TODO CANCEL RENDER
     if(ifEntrada === true && entradaFolio[0].status_entrada === "CANCELADO"){
 
         doc.moveDown(2)
         doc.fillColor("red").fontSize(32).text("CANCELADO",{align:"center",})
 
 
     }
    


    doc.end()



    } catch (error) {
        
        console.log(error)
    }
   


    }





    export default pdfKitLayout