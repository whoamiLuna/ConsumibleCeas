
import { Router } from "express";
import pool from "../Helpers/conecctionsdb.js";
import isAuthLogin from "../Helpers/isAutenticate.js";
import bodyValidateEntradas from "../public/JS/entradas/bodyValidateEntradas.js";
import validateExpressErrors from "../Helpers/expressValidatorErrors.js";
import validateIdExist from "../Helpers/validateIdExist.js";
import formaterTimeStamp from "../Helpers/formaterTimeStamp.js";
import pdfKitLayout from "../Helpers/pdfKit_layout.js";
import excelExport from "../Helpers/excelExport.js";
import bodyValidateSalidas from "../public/JS/salidas/bodayValidateSalidas.js";



const routeCapturista= Router()


routeCapturista.get("/", isAuthLogin(2), (req, res)=>{
    
    res.redirect("/capturista/entradas")//? redirect to principal view

})







routeCapturista.get("/entradas",isAuthLogin(2),async(req, res)=>{
    

    let page= parseInt(req.query.page || 1)
    const folio= req.query.folio
    const status= req.query.status
    const limit= 10   //?rango de busqueda
    const offset= (page -1) * limit //?donde empiza la busqueda (ignora desde y traeme los siguientes)

    let entradasAll= []
    let totalEntradas= 0


    //? RENDER DATA LIST SEARCH ENTRADAS QUERYS
    
    const [folios]= await pool.query("select folio from entradas order by folio desc")

     //? STATUS SEARCH
    
    if(status && status.length > 0){
        
        const [entradaStatusSearch]= await pool.query(`select e.id_entradas, e.folio, e.fecha_entrada, e.status_entrada, e.modificacion, u.fullname from entradas e inner join users u on u.id_user= e.user where e.status_entrada= ? order by e.status_entrada desc limit ? offset ?`, [status, limit, offset])
    
        const [[{totalFolios:count}]]= await pool.query("select count(*) as totalFolios from entradas where status_entrada= ?", [status])

        entradasAll= entradaStatusSearch.map(e=>(
            {
                ...e,
                fecha_entrada:formaterTimeStamp({date:e.fecha_entrada}),
                modificacion: formaterTimeStamp({date:e.modificacion})
            }
        ))
        
        
        totalEntradas= count
        
    }else if (folio && folio.length > 0){
        
        const [entradaSearch]= await pool.query(`select e.id_entradas,e.folio,e.fecha_entrada, e.status_entrada, e.modificacion, u.fullname from entradas e inner join users u on u.id_user= e.user where e.folio= ?` , [folio])
        
        const [[{totalFolios:count}]]= await pool.query("select count(*) as totalFolios from entradas where folio= ?", [folio])
        
        entradasAll= entradaSearch.map(e=>( { 
            ...e,
            fecha_entrada: formaterTimeStamp({date:e.fecha_entrada}),
            modificacion: formaterTimeStamp({date:e.modificacion})
        }))
        totalEntradas= count
        
    }else{
        
        const [entradas]= await pool.query(`select e.id_entradas, e.folio, e.fecha_entrada, e.status_entrada, e.modificacion, u.fullname from entradas e inner join users u on u.id_user= e.user order by e.status_entrada desc limit ? offset ?`, [limit, offset])
        
        const [[{totalFolios:count}]]= await pool.query("select count(*) as totalFolios from entradas")
        
        entradasAll= entradas.map((e)=>{
            return {
                ...e,
                fecha_entrada: formaterTimeStamp({date:e.fecha_entrada}),
                modificacion: formaterTimeStamp({date:e.modificacion})
            }
            
        })
        
        totalEntradas= count
        
    }
    
    
    
    if(page < 1){
        page = 1
    }
    
    const totalPage= Math.ceil(totalEntradas/ limit)
    
    if (page > totalPage && totalPage > 0) {
        return res.redirect(`/capturista/entradas?page=${totalPage}`) 
        //?redireccion a al ultima pagina
    }







    res.render("capturista/capturistaEntradas.pug", {
        titles:"Entradas",
        description: "Entradas de Consumibles",
        style:"/CSS/capturistaEntradas.css",
        Script: "/JS/entradas/capturistaEntradas.js",
        page,
        totalPage,
        entradasAll,
        entradas: true, //? MODAL GENERATED ENTRADAS AND CSS  
        equipos:false, //? MODAL GENERATE ENTRADAS PUG
        navItems:[ //? icons nav render role
            
             {
                class_icon: "fas fa-truck-loading",
                spanTitle:"Entradas",
                hrefNav:"/capturista/entradas",
                
             },{
                class_icon:"fas fa-dolly",
                spanTitle:"Salidas",
                hrefNav:"/capturista/salidas",
             },
            {
                class_icon:"fas fa-people-carry",
                spanTitle:"Stock",
                hrefNav:"/capturista/stock",
            },{
                class_icon:"fas fa-chart-area",
                spanTitle:"Estadistica",
                hrefNav:"/capturista/chart",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  

            //? DATA CONTENT TABLE
            idField:"id_entradas",
        dataHead:[ //!options table render users
            {key:"folio", valueHeadText:"folio" },
            {key:"fecha_entrada", valueHeadText:"fecha entrada" },
            {key:"status_entrada", valueHeadText:"Status",cellClass: (value)=> value==="VERIFICADO" ? "Verificado" : "" || value==="PENDIENTE" ? "Pendiente" : "" || value=== "CANCELADO" ? "Cancelado" : ""},
            {key:"fullname", valueHeadText:"capturista"},
            {key:"modificacion", valueHeadText:"Modificacion"},
        ],
        actions:[
           {
            type:"edit",
            icon:"far fa-edit",
            href:"/capturista/entradas/edit/",
            visible:(row) => row.status_entrada !== "CANCELADO" && row.status_entrada !=="VERIFICADO"
           },{
            type:"archive",
            icon:"fas fa-archive",
            href:"/capturista/entradas/cancel/",
            visible:(row) => row.status_entrada !== "CANCELADO"
           },{
            type:"details",
            icon:"fas fa-eye",
            href:"/capturista/entradas/details/" 

           }
            
        ],

        //? DATA LIST SEARCH ENTRADAS QUERYS

        dataListSearch:{ //!serach dataList Form
            action:"/capturista/entradas",
            method:"GET",
            name:"folio", //?req.query
            id:"folioList",
            placeholderSearch:"Buscar por Folio...",
            submit:"Buscar"
        },
        optionsDataSearch:folios.map(f=> f.folio),//*Reacondicion de consulta para datalistseach(un solo valor)}
        
        //? DATA LIST SEARCH ENTRADAS STATUS
        dataListSearch2:{ //!serach dataList Form
            action:"/capturista/entradas",
            method:"GET",
            name:"status", //?req.query
            id:"statusList",
            placeholderSearch:"Buscar por Status...",
            submit:"Buscar"
        },
        optionsDataSearch2:["VERIFICADO", "PENDIENTE", "CANCELADO"],//*Reacondicion de consulta para datalistseach(un solo valor)}

         //? totals btn agregar btns

        totals:[{
            value:"Agregar Entrada",
            action:"#",
            classIcon:"fas fa-plus",
            classActive:"btn_addEntrada"
        }, {
            value:"Descargar",
            action:"/capturista/entradas/export",
            classIcon:"fas fa-download",
            classActive: "btnExportEntradas"
        }],

    })
})




//TODO POST ENTRADAS

routeCapturista.post("/entradas",isAuthLogin(2),bodyValidateEntradas,validateExpressErrors("/capturista/entradas"), async (req,res)=>{


    const {status_entrada,consumibles}=req.body

    const connection= await pool.getConnection()


    try {
        
        await connection.beginTransaction()
        

        //TODO VALIDATE EXIST IN DB AND  ID REPEAT ? CHECK STOCK
        const validation= await validateIdExist({table:"consumibles", column_name:"id_consumible", connection, idField:"id_consumible", arrayData: consumibles})


        if(!validation.ok){
            
            await connection.rollback()
            
            return res.status(400).json({
                ok:false,
                message: validation.message,
                redirect:"/capturista/entradas"
            })    

        }



        //?VALIDATE STATUS CANCEL


        if(status_entrada=== "CANCELADO"){

            await connection.rollback()

            return res.status(400).json({
                ok:false,
                message: "El folio esta cancelado, sin modificaciones",
                redirect:"/capturista/entradas"
            })
        }




        const [entradaAdd]= await connection.query("insert into entradas (status_entrada, user) values (?,?) ",[status_entrada, req.user.id_user])
        
        //!QUERYS ADD ENTRADA
        if(entradaAdd.affectedRows > 0){
            
            //TODO MODIFED FOLIO ADD IN ENTRADAS
            
            const folio= `ENCOM-${String(entradaAdd.insertId).padStart(4,"0")}`

            const [addFolio]= await connection.query("update  entradas set folio= ? where id_entradas = ? ", [folio, entradaAdd.insertId])

            
            if (addFolio.affectedRows  > 0){

                const idInsertEntrada=parseInt(entradaAdd.insertId)
                
                const consumiblesEntradas= consumibles.map(c => [parseInt(c.id_consumible), parseInt(idInsertEntrada), parseInt(c.cantidad),])

                const [entradaAddConsumible]= await connection.query("insert into entrada_consumible (id_consumible, id_entrada, cantidad) values ?", [consumiblesEntradas])

                //TODO ADD ENTRADA IN PIVOTE TABLE 
                if (entradaAddConsumible.affectedRows > 0){

                    //?VALIDATE STATUS PENDIENTE ADD FOLIO NOT STOCK

                    if(status_entrada==="PENDIENTE"){
                        
                        await connection.commit()

                        return res.status(200).json({
                            ok:true,
                            message:"Entrada agregada, PENDIENTE VALIDAR PARA STOCK",
                            redirect:"/capturista/entradas"
                        })
                    }

                    //TODO ADD STOCK ENTRADA COMMIT

                    const stockData= consumibles.map(c => [Number(c.id_consumible), Number(c.cantidad)])
                    
                    const [addStock]= await connection.query("insert into stock (id_consumible, cantidad) values ? on duplicate key update cantidad= cantidad + values(cantidad)", [stockData])
                    
                    if(!addStock.affectedRows){
                        
                        await connection.rollback()
                        
                        return res.status(400).json({
                            ok:false,
                            message:`Error en la operacion de agregar la entrada al stock`,
                            redirect:"/capturista/entradas"
                        })
                    }

                    await connection.commit()
                    
                    return res.status(200).json({
                        ok:true,
                        message:`Entrada agregada satisfactoriamente`,
                        redirect:"/capturista/entradas"
                    })
                }else{
                    
                    await connection.rollback()

                    return res.status(400).json({
                        ok:false,
                        message:"Error al agregar entrada",
                        redirect:"/capturista/entradas"
                    })


                }

                
            }else{

                await connection.rollback()
                
                return res.status(400).json({
                    ok:false,
                    message:`Error al insertar el folio correspondiente`,
                    redirect:"/capturista/entradas"
                })

            }
           
            

        }else{
            
            await connection.rollback()

            return  res.status(400).json({
                 ok:false,
                 message:`Error al crear folio de entrada`,
                 redirect:"/capturista/entradas"
            })


        }


        
    } catch (error) {

        await connection.rollback()

        return res.status(500).json({
            ok:false,
            message: `Error de servidor: ${error}`,
            redirect:"/capturista/entradas"
        })

    }finally{
        connection.release()

    }





})




//TODO GET DATA EDIT


routeCapturista.get("/entradas/edit/:id", isAuthLogin(2),async (req,res)=>{

const id= parseInt(req.params.id)

const [consumibles]= await pool.query("select c.consumible, ec.id_consumible, ec.cantidad from entrada_consumible ec inner join consumibles c on c.id_consumible = ec.id_consumible where ec.id_entrada= ?", [id])

const [status]= await pool.query("select id_entradas, status_entrada from entradas where id_entradas= ?", [id])

if(consumibles.length > 0){

    return res.status(200).json({
        ok:true,
        consumibles,
        status
    })


}else{
    
    return res.status(400).json({
        ok:false,
        message:`Hubo un error en la extración de datos o no existe ID`,
        redirect:"/capturista/entradas"

    })


}})






//TODO POST EDIT ENTRADA

routeCapturista.post("/entradas/edit/:id",isAuthLogin(2),bodyValidateEntradas, validateExpressErrors("/capturista/entradas"), async (req,res)=> {
     

const id= req.params.id

const {status_entrada, consumibles}= req.body

const updateEntrada= {
    status_entrada,
    user: req.user.id_user
}

const [[entradaFolioStatus]]= await pool.query("select id_entradas, status_entrada from entradas where id_entradas = ?", [id])



const connection = await pool.getConnection()


try {
    
    await connection.beginTransaction()
    
    const [idEntradas]= await connection.query("select id_entradas from entradas")

    //?VALIDATE CANCEL STATUS
    
    if(entradaFolioStatus.status_entrada === "CANCELADO"){
        
        await connection.rollback()

        return res.status(400).json({
            ok:false,
            message:"El folio esta cancelado, sin modificación",
            redirect:"/capturista/entradas"
        })

    }


    //?VALIDATE VERIFICADO ENTRADA
    if(entradaFolioStatus.status_entrada==="VERIFICADO"){
        
        await connection.rollback()

        return res.status(400).json({
            ok:false,
            message:"La entrada ya esta verificada, sin modificaciones",
            redirect:"/capturista/entradas"
        })
    }
    
    //?VALIDATE ID

    const validatation= await validateIdExist({arrayData: consumibles, idField:"id_consumible", column_name:"id_consumible", table:"consumibles", connection})


    if(!validatation.ok){
        
        await connection.rollback()


        return res.status(400).json({
            ok:false,
            message: validatation.message,
            redirect:"/capturista/entradas"
         })
    }



    //?UPDATE ENTRADA (STATUS AND DATA)

    const [update]= await connection.query("update entradas set ? where id_entradas= ?", [updateEntrada, id])


     if(!update.affectedRows){
        
        await connection.rollback()

        return res.status(400).json({
            
            ok:false,
            message: `Hubo un error al Actualizar el status ${status_entrada}`,
            redirect:"/capturista/entradas"
        })

     }




     //?DELETE OLD DATA

    const [deleteEntrada]= await connection.query("delete from entrada_consumible where id_entrada = ?", [id])

    if(deleteEntrada.affectedRows === 0){

        await connection.rollback()

        return res.status(400).json({
            ok:false,
            message:`Error al borrar los datos de entrada`,
            redirect:"/capturista/entradas"
        })

    }



    //? INSERT UPDATE DATA 

    const consumiblesUpdate= consumibles.map(c => [id, parseInt(c.id_consumible), parseInt(c.cantidad)])

    const [insertNewEntrada]=await connection.query("insert into entrada_consumible (id_entrada,id_consumible, cantidad) values ?", [consumiblesUpdate])

    if(insertNewEntrada.affectedRows === 0){
        
        await connection.rollback()

        return res.status(400).json({
            ok:false,
            message:`Error al agregar los consumibles`,
            redirect:"/capturista/entradas"
        })

    }


    //!VALIDATE STATUS PENDIENTE

    if(status_entrada==="PENDIENTE"){

        await connection.commit()

        return res.status(200).json({
            ok:true,
            message:"Entrada pendiente actualizada correctamente",
            redirect:"/capturista/entradas"
        })
    }




    //? INSERT NEW CONSUMIBLE IN STOCK

    const stockNew= consumibles.map(c => [parseInt(c.id_consumible), parseInt(c.cantidad)])

    const [updateStock]= await connection.query("insert into stock (id_consumible, cantidad) values ? on duplicate key update cantidad= cantidad + values(cantidad)",[stockNew])

    if(updateStock.affectedRows === 0){
        
        await connection.rollback()

        return res.status(400).json({
            ok:false,
            message:"Error al agrear los consumibles al stock",
            redirect:"/capturista/entradas"
        })


    }

    //TODO VALIDATION VERIFICADO  

    if(status_entrada==="VERIFICADO"){

        await connection.commit()
    
        return res.status(200).json({
            ok:true,
            message:`Entrada Modificada correctamente`,
            redirect:"/capturista/entradas"
        })

    }




} catch (error) {
    
await connection.rollback()


return res.status(400).json({
    ok:false,
    message:`Error: ${error}`,
    redirect:"/capturista/entradas"
})

}finally{

connection.release()



}

})






//TODO CANCEL ENTRADA ROUTE

routeCapturista.get("/entradas/cancel/:id", isAuthLogin(2), async (req, res)=>{
    
const id= parseInt(req.params.id)

const [idEntradas]= await pool.query("select id_entradas from entradas where id_entradas= ?", [id])


if(idEntradas.length === 0){
    
    return res.status(400).json({
        ok:false,
        message:"No existe la entrada seleccionada",
        redirect:"/capturista/entradas"
    })
    
}


const [consumiblesCancel]= await pool.query("select c.consumible,ec.cantidad from entrada_consumible ec inner join consumibles c on c.id_consumible = ec.id_consumible where ec.id_entrada= ?", [id])


const dataTotals= consumiblesCancel.map( c => ({
    label: c.consumible ,
    value: c.cantidad
}))


if(consumiblesCancel.length === 0){
    
    return res.status(400).json({
        ok:false,
        message:"No se obtuvo los datos para esta entrada, no disponible para borrar",
        redirect:"/capturista/entradas"
    })
    
    
}


return res.status(200).json({
    ok:true,
    dataTotals
})



})




//TODO POST DELETE (CANCEL) FOLIO ENTRADAS


routeCapturista.post("/entradas/cancel/:id", isAuthLogin(2),async (req,res)=>{
    
    const id= parseInt(req.params.id)
    
    const user= parseInt(req.user.id_user)

    const [folioCancelFind]= await pool.query("select id_entradas, status_entrada from entradas where id_entradas= ?", [id])
    
    if(folioCancelFind.length === 0){
        
        return res.status(400).json({
            ok:false,
            message:`La entrada seleccionada no existe`,
            redirect:"/capturista/entradas"
        })
    }


    const connection= await pool.getConnection()


    try {
        
        await connection.beginTransaction()
        
        
        const [consumiblesSearchFolio]= await connection.query("select id_consumible,cantidad from entrada_consumible where id_entrada= ?", [id])
        
        
        if(consumiblesSearchFolio.length === 0) throw {message:"La entrada seleccionada no existe, consumibles no validos"}

        //?CANCEL MODE PENDIENTE
        
        if (folioCancelFind[0].status_entrada === "PENDIENTE"){
            
            const [entradaUpdateStatusPendiente]= await connection.query("update entradas set status_entrada ='CANCELADO' where id_entradas = ?", [id])

            if(entradaUpdateStatusPendiente.affectedRows === 0) throw {message:"Error al cancelar la entrada pendiente"}

            await connection.commit()

            return res.status(200).json({
                ok:false,
                message: "Entrada pendiente cancelada satisfactoriamente",
                redirect:"/capturista/entradas"
            })
        
        }
        
        //?DESCOUNT STOCK

        for(let c of consumiblesSearchFolio){

            const [stockNow]= await connection.query("update stock set cantidad= cantidad - ? where id_consumible= ? and cantidad >= ?", [parseInt(c.cantidad),parseInt(c.id_consumible), parseInt(c.cantidad)])

            if(stockNow.affectedRows === 0){
                
                const [[searchConsumibleError]]= await pool.query("select consumible from consumibles where id_consumible = ?", [parseInt(c.id_consumible)])

                throw({message:`El consumible ${searchConsumibleError.consumible} ya no tiene el stock necesario para cancelar`})
            }

        }
 
        const [entradaUpdateStatus]= await connection.query("update entradas set status_entrada ='CANCELADO', user= ? where id_entradas = ?", [user,id])


        if(entradaUpdateStatus.affectedRows === 0){
            
            await connection.rollback()

            return res.status(400).json({
                ok:false,
                message: "Entrada no cancelada, verifique con el Administrador",
                redirect:"/capturista/entradas"
            })
        }

        //? SEND SUCCESS
        
        await connection.commit()

        return res.status(200).json({
            ok:true,
            message:"Entrada cancelada satisfactoriamente",
            redirect:"/capturista/entradas"
        })



    } catch (error) {
        
        await connection.rollback()

        return res.status(400).json({
            ok:false,
            message: error.message,
            redirect: "/capturista/entradas"
        })

    }finally{

        connection.release()

    }

})




//TODO EXCEL LOAD ENTRADAS

routeCapturista.get("/entradas/export", isAuthLogin(2), async (req,res, next)=>{


     const [entradas]= await pool.query("select e.fecha_entrada,e.folio, e.status_entrada, e.user, u.fullname, group_concat(concat(c.consumible,': ',ec.cantidad) separator ', ') as consumibles from entradas e inner join entrada_consumible ec on ec.id_entrada = e.id_entradas inner join consumibles c on c.id_consumible = ec.id_consumible inner join users u on u.id_user= e.user group by e.id_entradas")
    
     if(entradas.length === 0){
        
        return res.status(400).json({
            ok:false,
            message:"No hay datos que importar aun",
            redirect: "/capturista/entradas"
        })
     }

     
    const columns= [
        {header: "fecha de Entrada", key:"fecha_entrada", width: 11 },
        {header: "Folio de Entrada", key:"folio", width: 11 },
        {header: "Status de Entrada", key:"status_entrada", width: 11 },
        {header: "Capturista", key:"fullname", width: 30 },
        {header: "Consumibles", key:"consumibles", width: 30 }
    
    ]
   

     await excelExport({name:"Entradas Consumibles", columnsArray:columns, dataArray:entradas, res})






})















//! RUTE GET STOCK

routeCapturista.get("/stock",isAuthLogin(2),async(req, res)=>{
    

    let page= parseInt(req.query.page || 1)
    const consumible= req.query.consumible
    const modelo= req.query.modelo
    const limit= 8   //?rango de busqueda
    const offset= (page -1) * limit //?donde empiza la busqueda (ignora desde y traeme los siguientes)

    let stockAll= []
    let totalStock= 0


    //?render modelos query
    
    const [modelosEquipos]=  await pool.query("select id_modelo_equipo, modelo from modelo_equipos")

    const [consumiblesStock]= await pool.query("select s.id_consumible, c.consumible from stock s inner join consumibles c on c.id_consumible= s.id_consumible")

     //? 
    
    if(consumible && consumible.length > 0){
        
        const [stockConsumiblesCosumible]= await pool.query("SELECT mc.marca_consumible, tc.tipo_consumible, c.consumible, s.cantidad,IFNULL(GROUP_CONCAT(me.modelo SEPARATOR ', '),'Sin modelo asignado') AS equipos, s.modificacion FROM stock s INNER JOIN consumibles c ON c.id_consumible = s.id_consumible INNER JOIN tipo_consumibles tc ON tc.id_tipo_consumibles = c.tipo_consumible INNER JOIN marca_consumibles mc ON mc.id_marca_consumible = c.marca_consumible LEFT JOIN consumible_modelos cm ON cm.id_consumible = c.id_consumible LEFT JOIN tipo_equipos t ON t.id_tipo_equipo = cm.id_tipo_equipo LEFT JOIN modelo_equipos me ON me.id_modelo_equipo = t.modelo_equipo where c.consumible= ? GROUP BY c.id_consumible, mc.marca_consumible, tc.tipo_consumible, c.consumible, s.cantidad", [consumible])


        const [[{totalStock:count}]]= await pool.query("select count(*) as totalStock from stock s inner join consumibles c on c.id_consumible= s.id_consumible where c.consumible= ? ", [consumible])


        totalStock= count

        stockAll= stockConsumiblesCosumible.map(e => ({
            ...e,
            modificacion:formaterTimeStamp({date:e.modificacion})            
        }))

    }else if(modelo && modelo.length > 0){
                 
        const [stockConsumiblesModelo]= await pool.query("SELECT mc.marca_consumible, tc.tipo_consumible, c.consumible, s.cantidad,IFNULL(GROUP_CONCAT(me.modelo SEPARATOR ', '),'Sin modelo asignado') AS equipos, s.modificacion FROM stock s INNER JOIN consumibles c ON c.id_consumible = s.id_consumible INNER JOIN tipo_consumibles tc ON tc.id_tipo_consumibles = c.tipo_consumible INNER JOIN marca_consumibles mc ON mc.id_marca_consumible = c.marca_consumible LEFT JOIN consumible_modelos cm ON cm.id_consumible = c.id_consumible LEFT JOIN tipo_equipos t ON t.id_tipo_equipo = cm.id_tipo_equipo LEFT JOIN modelo_equipos me ON me.id_modelo_equipo = t.modelo_equipo where me.modelo = ? GROUP BY c.id_consumible, mc.marca_consumible, tc.tipo_consumible, c.consumible, s.cantidad", [modelo])


        const [[{totalStock: count}]]= await pool.query("select count(*) as totalStock from stock s inner join consumibles c on c.id_consumible= s.id_consumible inner join consumible_modelos cm on cm.id_consumible= c.id_consumible inner join tipo_equipos tp on tp.id_tipo_equipo = cm.id_tipo_equipo inner join modelo_equipos me on me.id_modelo_equipo= tp.modelo_equipo where me.modelo= ?",[modelo])
        
        totalStock= count
        
        stockAll= stockConsumiblesModelo.map(e => ({
            ...e,
            modificacion:formaterTimeStamp({date:e.modificacion})
        }))


    }else{
        const [stockConsumiblesStock]= await pool.query("SELECT mc.marca_consumible, tc.tipo_consumible, c.consumible, s.cantidad,IFNULL(GROUP_CONCAT(me.modelo SEPARATOR ', '),'Sin modelo asignado') AS equipos, s.modificacion FROM stock s INNER JOIN consumibles c ON c.id_consumible = s.id_consumible INNER JOIN tipo_consumibles tc ON tc.id_tipo_consumibles = c.tipo_consumible INNER JOIN marca_consumibles mc ON mc.id_marca_consumible = c.marca_consumible LEFT JOIN consumible_modelos cm ON cm.id_consumible = c.id_consumible LEFT JOIN tipo_equipos t ON t.id_tipo_equipo = cm.id_tipo_equipo LEFT JOIN modelo_equipos me ON me.id_modelo_equipo = t.modelo_equipo GROUP BY c.id_consumible, mc.marca_consumible, tc.tipo_consumible, c.consumible, s.cantidad order by mc.marca_consumible, c.consumible asc limit ? offset ?", [limit,offset])
        
        const[[{totalStock:count}]]= await pool.query("select count(*) totalStock from stock")        

        totalStock= count

        stockAll=stockConsumiblesStock.map(e => ({
            ...e,
            modificacion:formaterTimeStamp({date:e.modificacion})

        }))
    }
    
    
     
    if(page < 1){
        page = 1
    }
    
    const totalPage= Math.ceil(totalStock/ limit)
    
    if (page > totalPage && totalPage > 0) {
        return res.redirect(`/capturista/stock?page=${totalPage}`) 
        //?redireccion a al ultima pagina
    }



    res.render("capturista/stock.pug", {
        titles:"Stock",
        description: "Stock de Consumibles",
        style:"/CSS/capturistaStock.css",
        Script: "/JS/entradas/stockCapturista.js",
        page,
        totalPage,
        stockAll,
        navItems:[ //? icons nav render role
            
             {
                class_icon: "fas fa-truck-loading",
                spanTitle:"Entradas",
                hrefNav:"/capturista/entradas",
                
             },{
                class_icon:"fas fa-dolly",
                spanTitle:"Salidas",
                hrefNav:"/capturista/salidas",
             },
            {
                class_icon:"fas fa-people-carry",
                spanTitle:"Stock",
                hrefNav:"/capturista/stock",
            },{
                class_icon:"fas fa-chart-area",
                spanTitle:"Estadistica",
                hrefNav:"/capturista/chart",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  

            //? DATA CONTENT TABLE
            idField:"id_consumible",
        dataHead:[ //!options table render users
            {key:"marca_consumible", valueHeadText:"Marca Consumible" },
            {key:"tipo_consumible", valueHeadText:"Tipo Consumible", cellClass:(value)=> value==="TINTA" ? "tinta" : "" || value=== "TONER" ? "toner" : "" || value=== "CARTUCHOS" ? "cartuchos" : "" || value=== "TAMBOR" ? "tambor" : ""},
            {key:"consumible", valueHeadText:"Consumible" },
            {key:"cantidad", valueHeadText:"Stock"},
            {key:"equipos", valueHeadText:"Modelos"},
            {key:"modificacion", valueHeadText:"Modificacion"},
        ],
        actions:[],
        //? DATA LIST SEARCH STOCK QUERYS

        dataListSearch:{ //!serach dataList Form
            action:"/capturista/stock",
            method:"GET",
            name:"consumible", //?req.query
            id:"consumibleList",
            placeholderSearch:"Buscar por consumible...",
            submit:"Buscar"
        },
        optionsDataSearch:consumiblesStock.map(e=> e.consumible),//*Reacondicion de consulta para datalistseach(un solo valor)}
        
        //? DATA LIST SEARCH STOCK EQUIPO
        dataListSearch2:{ //!serach dataList Form
            action:"/capturista/stock",
            method:"GET",
            name:"modelo", //?req.query
            id:"modeloList",
            placeholderSearch:"Buscar por modelo de equipo...",
            submit:"Buscar"
        },
        optionsDataSearch2: modelosEquipos.map(m=> m.modelo),

         //? totals btn agregar btns

        totals:[{
            value:"Descargar",
            action:"/capturista/stock/export",
            classIcon:"fas fa-download",
            classActive: "btnExportStock"
        }],

    })
})




///TODO STOCK EXCEL EXPORT
routeCapturista.get("/stock/export", isAuthLogin(2), async (req,res, next)=>{


    const [stock]=  await pool.query("SELECT mc.marca_consumible, tc.tipo_consumible, c.consumible, s.cantidad,IFNULL(GROUP_CONCAT(me.modelo SEPARATOR ', '),'Sin modelo asignado') AS equipos, s.modificacion FROM stock s INNER JOIN consumibles c ON c.id_consumible = s.id_consumible INNER JOIN tipo_consumibles tc ON tc.id_tipo_consumibles = c.tipo_consumible INNER JOIN marca_consumibles mc ON mc.id_marca_consumible = c.marca_consumible LEFT JOIN consumible_modelos cm ON cm.id_consumible = c.id_consumible LEFT JOIN tipo_equipos t ON t.id_tipo_equipo = cm.id_tipo_equipo LEFT JOIN modelo_equipos me ON me.id_modelo_equipo = t.modelo_equipo GROUP BY c.id_consumible, mc.marca_consumible, tc.tipo_consumible, c.consumible, s.cantidad order by mc.marca_consumible, c.consumible asc ")
    
     if(stock.length === 0){
        
        return res.status(400).json({
            ok:false,
            message:"No hay datos que importar aun",
            redirect: "/capturista/stock"
        })
     }

     
    const columns= [
        {header: "Marca Consumible", key:"marca_consumible", width: 30 },
        {header: "Tipo Consumible", key:"tipo_consumible", width: 30 },
        {header: "Consumible", key:"consumible", width: 30 },
        {header: "Cantidad", key:"cantidad", width: 30 },
        {header: "Equipos", key:"equipos", width: 50},
        {header: "Modificacion", key:"modificacion", width: 70 }
    
    ]
   

    
    
    await excelExport({name:"Consumibles Stock", columnsArray:columns, dataArray:stock, res})




})















//!SALIDAS

routeCapturista.get("/salidas",isAuthLogin(2),async(req, res)=>{
    

    let page= parseInt(req.query.page || 1)
    const folio= req.query.folio
    const status= req.query.status
    const inventario= req.query.inventario
    const limit=10   //?rango de busqueda
    const offset= (page -1) * limit //?donde empiza la busqueda (ignora desde y traeme los siguientes)

    let salidasAll= []
    let totalSalidas= 0


    //TODO RENDER QUERYS DATASEARCH

    const [inventarios]= await pool.query("select distinct se.id_equipo,e.inventario from salida_equipo se inner join equipos e on e.id_equipo= se.id_equipo")

    const [folios]= await pool.query("select folio from salidas")

     //? STATUS SEARCH
    
    if(status && status.length > 0){
        
        const [salidaStatusSearch]= await pool.query(`select s.id_salida, s.folio, s.fecha_salida, s.status_salida, s.modificacion, u.fullname from salidas s inner join users u on u.id_user= s.user where s.status_salida= ? order by s.status_salida desc limit ? offset ?`, [status, limit, offset])
    
        const [[{totalFolios:count}]]= await pool.query("select count(*) as totalFolios from salidas where status_salida= ?", [status])

        salidasAll= salidaStatusSearch.map(e=>(
            {
                ...e,
                fecha_salida:formaterTimeStamp({date:e.fecha_salida}),
                modificacion: formaterTimeStamp({date:e.modificacion})
            }
        ))
        
        
        totalSalidas= count
        
    }else if (folio && folio.length > 0){
        
        const [salidaSearch]= await pool.query(`select s.id_salida,s.folio,s.fecha_salida, s.status_salida, s.modificacion, u.fullname from salidas s inner join users u on u.id_user= s.user where s.folio= ?` , [folio])
        
        const [[{totalFolios:count}]]= await pool.query("select count(*) as totalFolios from salidas where folio= ?", [folio])
        
        salidasAll= salidaSearch.map(e=>( { 
            ...e,
            fecha_salida: formaterTimeStamp({date:e.fecha_salida}),
            modificacion: formaterTimeStamp({date:e.modificacion})
        }))
        totalSalidas= count
        
    }else if(inventario && inventario.length > 0){
        
        const [salidaInventarioSearch]= await pool.query(`select s.id_salida, s.folio, s.fecha_salida, s.status_salida, s.modificacion, u.fullname from salidas s inner join users u on u.id_user= s.user inner join salida_equipo se on se.id_salida= s.id_salida inner join equipos e on e.id_equipo= se.id_equipo where e.inventario= ? order by s.status_salida desc limit ? offset ?`, [inventario, limit, offset])
        
        const [[{totalFolios:count}]]= await pool.query("select count(*) as totalFolios from salidas s inner join salida_equipo se on se.id_salida= s.id_salida inner join equipos e on e.id_equipo= se.id_equipo where e.inventario= ?", [inventario])
        
        salidasAll= salidaInventarioSearch.map(e=>( { 
            ...e,
            fecha_salida: formaterTimeStamp({date:e.fecha_salida}),
            modificacion: formaterTimeStamp({date:e.modificacion})
        }))
        totalSalidas= count

    }else{
        
        const [salidas]= await pool.query(`select s.id_salida, s.folio, s.fecha_salida, s.status_salida, s.modificacion, u.fullname from salidas s inner join users u on u.id_user= s.user order by s.status_salida desc limit ? offset ?`, [limit, offset])
        
        const [[{totalFolios:count}]]= await pool.query("select count(*) as totalFolios from salidas")
        
        salidasAll= salidas.map((e)=>{
            return {
                ...e,
                fecha_salida: formaterTimeStamp({date:e.fecha_salida}),
                modificacion: formaterTimeStamp({date:e.modificacion})
            }
            
        })
        
        totalSalidas= count
        
    }
    
    
    
    if(page < 1){
        page = 1
    }
    
    const totalPage= Math.ceil(totalSalidas/ limit)
    
    if (page > totalPage && totalPage > 0) {
        return res.redirect(`/capturista/salidas?page=${totalPage}`) 
        //?redireccion a al ultima pagina
    }







    res.render("capturista/capturistaSalidas.pug", {
        titles:"Salidas",
        description: "Salidas de Consumibles",
        style:"/CSS/capturistaSalidas.css",
        Script: "/JS/salidas/capturistaSalidas.js",
        page,
        totalPage,
        salidasAll,
        entradas: false, //? MODAL GENERATED ENTRADAS AND CSS  
        equipos:true, //? MODAL GENERATE ENTRADAS PUG
        navItems:[ //? icons nav render role
            
             {
                class_icon: "fas fa-truck-loading",
                spanTitle:"Entradas",
                hrefNav:"/capturista/entradas",
                
             },{
                class_icon:"fas fa-dolly",
                spanTitle:"Salidas",
                hrefNav:"/capturista/salidas",
             },
            {
                class_icon:"fas fa-people-carry",
                spanTitle:"Stock",
                hrefNav:"/capturista/stock",
            },{
                class_icon:"fas fa-chart-area",
                spanTitle:"Estadistica",
                hrefNav:"/capturista/chart",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  

            //? DATA CONTENT TABLE
            idField:"id_salida",
        dataHead:[ //!options table render users
            {key:"folio", valueHeadText:"folio" },
            {key:"fecha_salida", valueHeadText:"fecha de Salida" },
            {key:"status_salida", valueHeadText:"Status",cellClass: (value)=> value==="VERIFICADO" ? "Verificado" : "" || value==="PENDIENTE" ? "Pendiente" : "" || value=== "CANCELADO" ? "Cancelado" : ""},
            {key:"fullname", valueHeadText:"capturista"},
            {key:"modificacion", valueHeadText:"Modificacion"},
        ],
        actions:[
           {
            type:"edit",
            icon:"far fa-edit",
            href:"/capturista/salidas/edit/",
            visible:(row) => row.status_salida !== "CANCELADO" && row.status_salida !=="VERIFICADO"
           },{
            type:"archive",
            icon:"fas fa-archive",
            href:"/capturista/salidas/cancel/",
            visible:(row) => row.status_salida !== "CANCELADO"
           },{
            type:"details",
            icon:"fas fa-eye",
            href:"/capturista/salidas/details/" 

           }
            
        ],

        //? DATA LIST SEARCH SALIDAS QUERYS

        dataListSearch:{ //!serach dataList Form
            action:"/capturista/salidas",
            method:"GET",
            name:"folio", //?req.query
            id:"folioList",
            placeholderSearch:"Buscar por Folio...",
            submit:"Buscar"
        },
        optionsDataSearch:folios.map(folio => folio.folio),//*Reacondicion de consulta para datalistseach(un solo valor)}
        
        //? DATA LIST SEARCH ENTRADAS STATUS
        dataListSearch2:{ //!serach dataList Form
            action:"/capturista/salidas",
            method:"GET",
            name:"status", //?req.query
            id:"statusList",
            placeholderSearch:"Buscar por Status...",
            submit:"Buscar"
        },
        optionsDataSearch2:["VERIFICADO", "PENDIENTE", "CANCELADO"],//*Reacondicion de consulta para datalistseach(un solo valor)}

        //?DATA LIST SEARCH SALIDAS INVENTARIO
        dataListSearch3:{ //!serach dataList Form
            action:"/capturista/salidas",
            method:"GET",
            name:"inventario", //?req.query
            id:"inventarioList",
            placeholderSearch:"Buscar por Inventario...",
            submit:"Buscar"
        },
        optionsDataSearch3:inventarios.map(i => i.inventario),//*Reacondicion de consulta para datalistseach(un solo valor)}

         //? totals btn agregar btns

        totals:[{
            value:"Agregar Salida",
            action:"#",
            classIcon:"fas fa-plus",
            classActive:"btn_addSalida"
        }, {
            value:"Descargar",
            action:"/capturista/salidas/export",
            classIcon:"fas fa-download",
            classActive: "btnExportSalidas"
        }],

    })
})





//TODO POST SALIDAS

routeCapturista.post("/salidas", isAuthLogin(2),bodyValidateSalidas,validateExpressErrors("/capturista/salidas"), async (req, res)=> {


const {consumibles, equipos,status_salida}= req.body
              

//? convert array 
const equiposBody= Array.isArray(equipos) ? equipos : [equipos]


//?covert id equipos

const equiposBodyNumbers= equiposBody.map(Number)

const [equiposIds]= await pool.query("select id_equipo,estado_equipo,inventario from equipos where id_equipo in(?)", [equiposBodyNumbers])

const equiposIdSetNumbers= new Set(equiposIds.map(e => Number(e.id_equipo))) 

const [equiposIdInventarios]= await pool.query("select id_equipo, inventario from equipos")
//? covert id consumibles

const consumiblesBodyIdSet= new Set(consumibles.map(c => Number(c.id_consumible)))

const consumiblesBodyidNumbers= consumibles.map(c => Number(c.id_consumible))

const consumiblesDB= await pool.query("select id_consumible, consumible from consumibles")
//TODO VALIDATE EQUIPOS EXIST

const equiposValidateId= equiposBodyNumbers.filter( id => !equiposIdSetNumbers.has(id))


if(equiposValidateId.length > 0){
    
    return res.status(400).json({
        ok:false,
        message:"Uno de los equipos seleccionados no existen",
        redirect:"/capturista/salidas"
    })

}




//TODO VALIDATE EQUIPO ESTADO

const findEstadoEquipo= equiposIds.filter(e => e.estado_equipo === "MALO" )


if(findEstadoEquipo.length > 0){
    
    return res.status(400).json({
        ok:false,
        message: `Los equipos ${findEstadoEquipo.map(e => e.inventario)} en estados malos`,
        redirect:"/capturista/salidas"
    })
}



//TODO VALIDATE CONSUMIBLE IN EQUIPOS

const [compatibilidadEquipos]= await pool.query("select e.id_equipo,e.inventario, cm.id_consumible from consumible_modelos cm inner join tipo_equipos tp on tp.id_tipo_equipo= cm.id_tipo_equipo inner join equipos e on e.tipo_equipo= tp.id_tipo_equipo where e.id_equipo in(?)", [equiposBodyNumbers])


//*preguntar existe equipo y existe un consumible seleccionado
const equiposFindNotConsumible= equiposBodyNumbers.filter(idBodyEquipo => {

    return !compatibilidadEquipos.some(idQuery=>

        Number(idQuery.id_equipo) === Number(idBodyEquipo) && consumiblesBodyIdSet.has(Number(idQuery.id_consumible))

    )

})



//*obtener los inventarios que salieron mal 

const searchInventarioNotConsumible= equiposIdInventarios.filter(id => equiposFindNotConsumible.includes(Number(id.id_equipo))).map(e=> e.inventario)


if(searchInventarioNotConsumible.length > 0){

    return res.status(400).json({
        ok:false,
        message:`Los equipos ${searchInventarioNotConsumible.join(", ")} no tienen consumibles validos seleccionados`,
        redirect:"/capturista/salidas"
    })
}


//TODO VALIDATE CONSUMIBLES EXIST IN EQUIPOS SELECT

const consumiblesNotEquipo= consumiblesBodyidNumbers.filter(idBodyConsumible=>{
    return !compatibilidadEquipos.some(relacion => idBodyConsumible === Number(relacion.id_consumible) && equiposBodyNumbers.includes(Number(relacion.id_equipo)))
})

const findConsumibleNotEquipo= consumiblesDB.filter(c => consumiblesNotEquipo.includes(Number(c.id_consumible))).map(c=> c.consumible)


if(findConsumibleNotEquipo.length > 0){
    return res.status(400).json({
        ok:false,
        message:`Los consumibles ${findConsumibleNotEquipo.join(", ")} no pertenecen a los equipos`
    })
}



//TODO  VALIDATE CANCEL


if(status_salida==="CANCELADO"){
    
    return res.status(400).json({
        ok:false,
        message:"Salida cancelada, sin agregar",
        redirect:"/capturista/salidas"
    })
}




const connection= await pool.getConnection()


try {
    
    await connection.beginTransaction()

    //TODO VALIDATE MOUNT STOCK CONSUMIBLES
    const validationSalidas= await validateIdExist({arrayData:consumibles, column_name: "id_consumible", connection, idField:"id_consumible", table:"consumibles", validateStock:true})

    if(!validationSalidas.ok){
        
        await connection.rollback()
        
        throw new Error(validationSalidas.message)
    }


    //TODO POST 

    const salidaPreview={
        user: parseInt(req.user.id_user),
        status_salida
    }

    const [salidaInsertPreview]= await connection.query("insert into salidas SET ? ", [salidaPreview])

    if(salidaInsertPreview.affectedRows === 0){
        
        await connection.rollback()

        throw new Error("Error al crear el preview de la salida")
    }

        //?custom folio

    const folioSalida= `SADCOM-${String(salidaInsertPreview.insertId).padStart(4,0)}`

    const [salidaInsertFolio]= await connection.query("update salidas set folio= ? where id_salida= ?", [folioSalida, parseInt(salidaInsertPreview.insertId)])

    if(salidaInsertFolio.affectedRows === 0){
         await connection.rollback()

         throw new Error(`Error al agregar el folio ${folioSalida}`)
    }


    //TODO POST PIVOTE TABLES

        //?equipos
        const equiposAddObject= equiposBodyNumbers.map(e => [parseInt(salidaInsertPreview.insertId), e])

        const [equiposAddPivote]= await connection.query("insert into salida_equipo(id_salida,id_equipo) values ?", [equiposAddObject] )

        //?consumibles

        const consumiblesAddObject= consumibles.map(c=> [parseInt(salidaInsertPreview.insertId), parseInt(c.id_consumible), parseInt(c.cantidad)])
  
        const [consumiblesAddPivote]= await connection.query("insert into salida_consumible(id_salida, id_consumible, cantidad) values ?", [consumiblesAddObject])

    if(equiposAddPivote.affectedRows === 0 || consumiblesAddPivote.affectedRows === 0){

        await connection.rollback()

        throw new Error("Error al agregar los datos correspondientes de equipos y consumibles")
    }


    //!SALIDA STATUS PENDIENTE

    if(status_salida==="PENDIENTE"){
        
        await connection.commit()

        return res.status(200).json({
            ok:true,
            message:`Se agredo salida ${folioSalida}, pendiente verificar`,
            redirect:"/capturista/salidas"
        })
    }


    //TODO REST STOCK 

if(status_salida==="VERIFICADO"){

    for(const c of consumibles){

        const [restStock]= await connection.query("update stock set cantidad= cantidad - ? where id_consumible= ?",[parseFloat(c.cantidad), parseInt(c.id_consumible)])

        if(restStock.affectedRows === 0){

        throw new Error("Error al descontar el consumible en el stock")
        }

    }

    await connection.commit()

     return res.status(200).json({
        ok:true,
        message:`Entrada ${folioSalida} agregada y verificada`,
        redirect:"/capturista/salidas"
    })
}


} catch (error) {

    await connection.rollback()

    console.log(error)
     
    return res.status(400).json({
        ok:false,
        message: error.message ? error.message : "Error en el servidor, contacte a soporte",
        redirect: "/capturista/salidas"

    })

}





})









//TODO GET EDIT SALIDA

routeCapturista.get("/salidas/edit/:id", isAuthLogin(2),async (req,res)=>{

const id= parseInt(req.params.id)

const [consumibles]= await pool.query("select c.consumible, sc.id_consumible, sc.cantidad from salida_consumible sc inner join consumibles c on c.id_consumible = sc.id_consumible where sc.id_salida = ?", [id])

const [status]= await pool.query("select id_salida, status_salida from salidas where id_salida= ?", [id])

const [equipos]= await pool.query("select se.id_equipo, e.inventario from salida_equipo se inner join equipos e on e.id_equipo = se.id_equipo where id_salida = ?", [id])

console.log(equipos)

console.log(consumibles)

if(consumibles.length > 0 && equipos.length > 0){
    

    return res.status(200).json({
        ok:true,
        consumibles,
        status,
        equipos
    })




}else{
    
    return res.status(400).json({
        ok:false,
        message:`Hubo un error en la extración de datos o no existe ID`,
        redirect:"/capturista/entradas"

    })


}})







//TODO POST EDIT SALIDAS

routeCapturista.post("/salidas/edit/:id", isAuthLogin(2), bodyValidateSalidas, validateExpressErrors("/capturista/salidas"), async (req,res)=>{


const id= parseInt(req.params.id)

const {consumibles, equipos, status_salida}= req.body

//?convert arrays

const equiposBodyNumber= (Array.isArray(equipos) ? equipos : [equipos]).map(Number)

//TODO CONSULT SALIDA DATA REFERENCE
const consumiblesBodyIdSet= new Set(consumibles.map(e=> Number(e.id_consumible)))

const consumiblesBodyId= consumibles.map(c => Number(c.id_consumible))

const [consumiblesDB]= await pool.query("select id_consumible, consumible from consumibles")

const [[salidaSearch]]= await pool.query("select id_salida, status_salida, folio from salidas where id_salida= ?", [id])

const [equiposIdTipos]= await pool.query("select id_equipo, inventario, estado_equipo from equipos where id_equipo in(?)", [equiposBodyNumber])

const [equiposIdInventarios]= await pool.query("select id_equipo, inventario from equipos")

//TODO VALIDATE EQUIPOS ESTATUS

const equiposIdMalos= equiposIdTipos.filter(e => e.estado_equipo === "MALO")

if(equiposIdMalos.length  > 0){

    return res.status(400).json({
        ok:false,
        message: `Los equipos ${equiposIdMalos.map(e => e.inventario)} en estados malos`,
        redirect:"/capturista/salidas"
    })
}



//TODO VALIDATE EQUIPOS EXIST

const equiposFindExist= new Set( equiposIdTipos.map(e => Number(e.id_equipo)))

const equipoFind= equiposBodyNumber.filter(e => !equiposFindExist.has(Number(e)))


if(equipoFind.length > 0){

    return res.status(400).json({
        ok:false,
        message:"Uno de los equipos no existe",
        redirect:"/capturista/salidas"
    })
}

//TODO VALIDATE EXIST CONSUMIBLES IN EQUIPOS

const [compatibilidadEquipos]= await pool.query("select e.id_equipo,e.inventario, cm.id_consumible from consumible_modelos cm inner join tipo_equipos tp on tp.id_tipo_equipo= cm.id_tipo_equipo inner join equipos e on e.tipo_equipo= tp.id_tipo_equipo where e.id_equipo in(?)", [equiposBodyNumber])


//*preguntar existe equipo y existe un consumible seleccionado
const equiposFindNotConsumible= equiposBodyNumber.filter(idBodyEquipo => {

    return !compatibilidadEquipos.some(idQuery=>

        Number(idQuery.id_equipo) === Number(idBodyEquipo) && consumiblesBodyIdSet.has(Number(idQuery.id_consumible))

    )

})


//*obtener los inventarios que salieron mal 

const searchInventarioNotConsumible= equiposIdInventarios.filter(id => equiposFindNotConsumible.includes(Number(id.id_equipo))).map(e=> e.inventario)


if(searchInventarioNotConsumible.length > 0){

    return res.status(400).json({
        ok:false,
        message:`Los equipos ${searchInventarioNotConsumible.join(", ")} no tienen consumibles validos seleccionados`,
        redirect:"/capturista/salidas"
    })
}


//TODO VALIDATE CONSUMIBLES SELECT EXIST IN EQUIPOS

const consumibleNotEquipo= consumiblesBodyId.filter(bodyConsumible=> {

    return !compatibilidadEquipos.some( idConsumible=> bodyConsumible === Number(idConsumible.id_consumible) && equiposBodyNumber.includes(Number(idConsumible.id_equipo)))
})


const findConsumibleNotEquipo= consumiblesDB.filter(id=> consumibleNotEquipo.includes(Number(id.id_consumible))).map(c => c.consumible)


if(findConsumibleNotEquipo.length  > 0){
    
    return res.status(400).json({
        ok:false,
        message:`Los consumibles ${findConsumibleNotEquipo.join(", ")} no pertenecen a los equipos`,
        redirect:"/capturista/salidas"
    })
}




//TODO CONSULT SALIDA DATA CANCEL

if (salidaSearch.status_salida=== "CANCELADO"){
    
    return res.status(400).json({
        ok:false,
        message:`La salida ${salidaSearch.folio} esta cancelada, sin modificaciones`,
        redirect:"/capturista/salidas"
    })
}


//TODO VEFICADO

if(salidaSearch.status_salida === "VERIFICADO"){
    
    return res.status(400).json({
        ok:false,
        message:`La salida ${salidaSearch.folio} ya esta verificada, sin modificaciones`,
        redirect:"/capturista/salidas"
    })
}



//!TRANSACTION
const connection = await pool.getConnection()


try {

await connection.beginTransaction()


//TODO UPDATE SALIDA

const [updateSalida]= await connection.query("Update salidas set user= ?, status_salida= ? where id_salida = ?", [parseInt(req.user.id_user), status_salida, id])

if(updateSalida.affectedRows === 0){ throw new Error(`Hubo un error al actualizar el status del folio ${salidaSearch.folio}`)}
 

//TODO DESCOUNT CONSUMIBLES AND EQUIPOS OLD DATA

const [deleteConsumibles]= await connection.query("delete from salida_consumible where id_salida= ?", [id])

const [deleteEquipos]= await connection.query("delete from salida_equipo where id_salida= ?", [id])

if(deleteEquipos.affectedRows === 0 || deleteConsumibles.affectedRows === 0){ throw new Error("Error al editar los datos anteriores de la salida")}


//TODO VALIDATION NEW DATA

const validatation= await validateIdExist({arrayData:consumibles, column_name:"id_consumible", connection, idField:"id_consumible",table:"consumibles", validateStock:true})

if(!validatation.ok){ throw new Error(validatation.message)}


//TODO INSERT NEW DATA 

const consumbiblesInsert= consumibles.map(c => [id,parseInt(c.id_consumible), parseInt(c.cantidad)])

const equiposInsert= equiposBodyNumber.map(e => [id,parseInt(e)])

const [updateConsumibles]= await connection.query("insert into salida_consumible(id_salida,id_consumible, cantidad) values ?",[consumbiblesInsert])

const [updateEquipos]= await connection.query("insert into salida_equipo(id_salida,id_equipo) values ?", [equiposInsert])

if(updateConsumibles.affectedRows === 0 || updateEquipos.affectedRows === 0){ throw new Error("Hubo un error al insertar los datos de la modificacion")}


//TODO PENDIENTE COMMIT

if(status_salida==="PENDIENTE"){

    await connection.commit()

    return res.status(200).json({
        ok:false,
        message:`Salida ${salidaSearch.folio} modificada, pendiente`,
        redirect:"/capturista/salidas"
    })

}


//TODO INSERT STOCK DATA
if(status_salida==="VERIFICADO"){


for(const c of consumibles){

    const [stockLess]= await connection.query("update stock set cantidad= cantidad - ? where id_consumible= ?", [parseInt(c.cantidad), parseInt(c.id_consumible)])

    if(stockLess.affectedRows=== 0){throw new Error("Hubo un error al descontar los consumibles en el stock")}
      
}



await connection.commit()

return res.status(200).json({
    ok:true,
    message: `Salida ${salidaSearch.folio} actualizada y verificada`,
    redirect:"/capturista/salidas"
})



}




} catch (error) {
    
console.log(error)

await connection.rollback()

return res.status(400).json({
    ok:false,
    message: error.message || error,
    redirect:"/capturista/salidas"
})


}finally{

    connection.release()
    

}



})







//TODO DATA GETE CANCEL SALIDAS

routeCapturista.get("/salidas/cancel/:id", isAuthLogin(2), async (req, res)=> {
    
    const id=parseInt(req.params.id)

    //TODO VALIDATE EXIST ID SALIDA

    const [salidaSearch]= await pool.query("select id_salida, folio from salidas where id_salida= ?", [id])

    if(salidaSearch.length === 0){

        return res.status(400).json({
            ok:false,
            message:"La salida que intenta cancelar no existe",
            redirect:"/capturista/salidas"
        })

    }


    //TODO LOAD DATA GET

    const [salidaData]= await pool.query("select c.consumible, sc.cantidad from salida_consumible sc inner join consumibles c on c.id_consumible= sc.id_consumible where sc.id_salida = ?", [id])

    if(salidaData.length === 0){

        return res.status(400).json({
            ok:false,
            message:"Hubo un error al consultar los datos de cancelación"
        })
    }


    const dataTotals= salidaData.map(c => ({
        label:c.consumible,
        value:c.cantidad
    }))


    return res.status(200).json({
        ok:true,
        dataTotals
    })



})



//TODO POST DELETE SALIDAS


routeCapturista.post("/salidas/cancel/:id", isAuthLogin(2), async (req,res)=>{
    
    const id= parseInt(req.params.id)

    const user= parseInt(req.user.id_user)

    //TODO VALIDATE EXIST ID
    const [salidaSearch]= await pool.query("select id_salida, folio, status_salida from salidas where id_salida = ?", [id])

    if(salidaSearch.length === 0){
        
        return res.status(400).json({
            ok:false,
            message:"La salida que selecciono no existe",
            redirect:"/capturista/salidas"
        })

    }

    //TODO LOAD DATA CANCEL IN STOCK  

    const [consumiblesSearch]= await pool.query("select id_salida,id_consumible, cantidad from salida_consumible where id_salida= ?", [id])

    if(consumiblesSearch.length === 0){
        return res.status(400).json({
            ok:false,
            message:`Hubo un error la consultar los datos de los consumibles de la salida ${salidaSearch[0].folio}`
        })
    }

    const connection= await pool.getConnection()


    try {
        
        await connection.beginTransaction()

        //?FOLIO CANCEL ROLLBACK

        if(salidaSearch[0].status_salida === "CANCELADO") throw new Error(`La salida ${salidaSearch[0].folio} ya esta cancelada`)


        //?CHANCE STATUS SALIDA AND UPDATE

        const [updateStatusSalida]= await connection.query("update salidas set status_salida= 'CANCELADO', user= ? where id_salida= ?",[user,id])

        if(updateStatusSalida.affectedRows === 0) throw new Error(`Error al actualizar el estatus de la salida ${salidaSearch[0].folio}`)

        //? FOLIO PENDIENTE COMMIT

        if(salidaSearch[0].status_salida === "PENDIENTE"){

            await connection.commit()

            return res.status(200).json({
                ok:true,
                message:`Se ha cancelado la salida ${salidaSearch[0].folio} pendiente sastisfactoriamente`,
                redirect:"/capturista/salidas"
            })

        }


        //?SALIDA VERIFICADA STOCK REST

        if(salidaSearch[0].status_salida === "VERIFICADO"){
            
            for(const c of consumiblesSearch){

            const[stockRest]= await connection.query("update stock set cantidad = cantidad + ? where id_consumible = ?", [parseInt(c.cantidad), parseInt(c.id_consumible)])

            if(stockRest.affectedRows === 0) throw new Error("Error al agregar al stock")

            
            }

            await connection.commit()

            return res.status(200).json({
                ok:true,
                message:`La salida ${salidaSearch[0].folio} se ha cancelado satisfactoriamente`,
                redirect:"/capturista/salidas"
            })
        }

    
    return res.status(400).json({
        ok:false,
        message:`Error al cancelar la salida ${salidaSearch[0].folio}`,
        redirect:"/capturista/salidas"
    })



    } catch (error) {
        
        await connection.rollback()

        return res.status(400).json({
            ok:false,
            message: error.message || error,
            redirect:"/capturista/salidas"
        })

    }finally{

        connection.release()


    }




})




//TODO GET EXPORT EXCEL SALIDAS
routeCapturista.get("/salidas/export", isAuthLogin(2), async (req,res, next)=>{


    const [salidas]= await pool.query("select s.fecha_salida,s.folio,s.status_salida,u.fullname,group_concat(c.consumible) as consumibles from salidas s inner join consumibles c on c.id_consumible = s.id_salida inner join users u on u.id_user= s.user group by s.id_salida")
    
     if(salidas.length === 0){
        
        return res.status(400).json({
            ok:false,
            message:"No hay datos que importar aun",
            redirect: "/capturista/salidas"
        })
     }

     
    const columns= [
        {header: "fecha de Salida", key:"fecha_salida", width: 30 },
        {header: "Folio de Salida", key:"folio", width: 30 },
        {header: "Status de Salida", key:"status_salida", width: 30 },
        {header: "Capturista", key:"fullname", width: 50},
        {header: "Consumibles", key:"consumibles", width: 70 }
    
    ]
   

    
    
    await excelExport({name:"Salidas Consumibles", columnsArray:columns, dataArray:salidas, res})




})

























//TODO GET PDF ENTRADAS RUTE

routeCapturista.get("/entradas/details/:id", isAuthLogin(2), async (req, res)=>{


const id= parseInt(req.params.id)

const [findEntrada]= await pool.query("select id_entradas, folio, fecha_entrada, status_entrada from entradas where id_entradas= ? ", [id])

const findEntradaTimeStamp= findEntrada.map(e=> ({...e,fecha_entrada: formaterTimeStamp({date:e.fecha_entrada})}))

const [entrada_consumible]= await pool.query("select en.id_entrada,c.consumible, en.cantidad from entrada_consumible en inner join consumibles c on c.id_consumible = en.id_consumible where en.id_entrada = ?", [id])

const [[total_entradas]]= await pool.query("select sum(cantidad) as total from entrada_consumible where id_entrada= ?", [id])



const rowEntradasPDF= entrada_consumible.map((e,index) => [index + 1, e.consumible, e.cantidad])



if(!findEntrada.length > 0){

    return res.status(400).json({
        ok:false,
        message:`El folio de la entrada no existe`,
        redirect:"/capturista/entradas"
    })

}


if(findEntrada[0].status_entrada === "PENDIENTE"){
    
    return res.status(400).json({
        ok:false,
        message:`El folio ${findEntradaTimeStamp[0].folio} esta aun pendiente de realizar`,
        redirect:"/capturista/entradas"
    })
}


return await pdfKitLayout({res, ifEntrada:true, entradaFolio:findEntradaTimeStamp, entradas: rowEntradasPDF, totalEntrada:total_entradas})

    
})





//TODO PDF SALIDAS RUTE

routeCapturista.get("/salidas/details/:id", isAuthLogin(2), async (req, res)=>{

const id= parseInt(req.params.id)

const [findSalida]= await pool.query("select id_salida, folio, fecha_salida, status_salida from salidas where id_salida= ? ", [id])

const finndStampSalida= findSalida.map(s=> ({...s,fecha_salidas:formaterTimeStamp({date:s.fecha_salida})}))

//todo query consumibles salidas

const [salidaConsumible]= await pool.query("select c.consumible, sc.cantidad from salida_consumible sc inner join consumibles c on c.id_consumible = sc.id_consumible where sc.id_salida= ?", [id])

const salidasConsumiblePDF= salidaConsumible.map((e,index) => [index + 1, e.consumible, e.cantidad])
//todo query equipos salidas

const [salidasEquipos]= await pool.query("select t.tipo_de_equipo,m.modelo, e.inventario, a.area from salida_equipo se inner join equipos e on e.id_equipo= se.id_equipo inner join tipo_equipos t on t.id_tipo_equipo = e.tipo_equipo inner join modelo_equipos m on m.id_modelo_equipo= t.modelo_equipo inner join areas a on a.id_area= e.area where se.id_salida= ?", [id])

const salidaEquiposPDF= salidasEquipos.map((e,index)=>[index +1, e.tipo_de_equipo, e.modelo, e.inventario, e.area])

//todo query total consumibles salidas

const [[totalSalidas]]= await pool.query("select sum(cantidad) as total from salida_consumible where id_salida=?", [id])

console.log(salidaConsumible)
console.log(salidasEquipos)

console.log(salidasConsumiblePDF)


if(!findSalida.length > 0){

    return res.status(400).json({
        ok:false,
        message:`El folio de la salida no existe`,
        redirect:"/capturista/salidas"
    })

}


if(findSalida[0].status_salida === "PENDIENTE"){
    
    return res.status(400).json({
        ok:false,
        message:`El folio ${finndStampSalida[0].folio} esta aun pendiente de realizar`,
        redirect:"/capturista/salidas"
    })
}


//todo render PDF SALIDAS

await pdfKitLayout({res, ifEntrada:false, salidaFolio:finndStampSalida, salidasConsumibles:salidasConsumiblePDF, salidasEquipos:salidaEquiposPDF,totalSalida:totalSalidas,ifSalida:true})


})















 

//todo loadDATA Selects folios entradas and salidas
routeCapturista.get("/entradas/loadData",isAuthLogin(2), async (req,res)=>{
    

const [equipos]= await pool.query("select id_equipo, inventario from equipos")

const [consumibles]= await pool.query("select id_consumible, consumible from consumibles")


if(equipos.length > 0 && consumibles.length > 0){

    return res.status(200).json({ ok:true, equipos, consumibles })


}else{
    
    return res.status(400).json({
        ok:false,
        message: "Error al cargar los datos para el folio correspondiente",
        redirect:"/capturista/entradas"
    })


}

})

//TODO SALIDAS LOAD DATA

//todo loadDATA Selects folios entradas and salidas
routeCapturista.get("/salidas/loadData",isAuthLogin(2), async (req,res)=>{
    

const [equipos]= await pool.query("select id_equipo, inventario from equipos")

const [consumibles]= await pool.query("select id_consumible, consumible from consumibles")


if(equipos.length > 0 && consumibles.length > 0){

    return res.status(200).json({ ok:true, equipos, consumibles })


}else{
    
    return res.status(400).json({
        ok:false,
        message: "Error al cargar los datos para el folio correspondiente",
        redirect:"/capturista/salidas"
    })


}

})


    


export default routeCapturista