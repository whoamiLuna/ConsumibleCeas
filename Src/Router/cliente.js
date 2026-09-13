import {Router} from "express"
import pool from "../Helpers/conecctionsdb.js"
import isAuthLogin from "../Helpers/isAutenticate.js"
import formaterTimeStamp from "../Helpers/formaterTimeStamp.js"
import excelExport from "../Helpers/excelExport.js"


const clienteRouter= Router()


clienteRouter.get("/",isAuthLogin(3),(req,res)=>{

    res.redirect("/client/stock")

})




clienteRouter.get("/stock",isAuthLogin(3),async(req, res)=>{
    

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
        Script: "/JS/entradas/capturistaStock.js",
        page,
        totalPage,
        stockAll,
        navItems:[ //? icons nav render role
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
            action:"/client/stock",
            method:"GET",
            name:"consumible", //?req.query
            id:"consumibleList",
            placeholderSearch:"Buscar por consumible...",
            submit:"Buscar"
        },
        optionsDataSearch:consumiblesStock.map(e=> e.consumible),//*Reacondicion de consulta para datalistseach(un solo valor)}
        
        //? DATA LIST SEARCH STOCK EQUIPO
        dataListSearch2:{ //!serach dataList Form
            action:"/client/stock",
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
            action:"/client/stock/export",
            classIcon:"fas fa-download",
            classActive: "btnExportStock"
        }],

    })
})







//TODO STOCK EXCEL EXPORT
clienteRouter.get("/stock/export", isAuthLogin(3), async (req,res, next)=>{


    const [stock]=  await pool.query("SELECT mc.marca_consumible, tc.tipo_consumible, c.consumible, s.cantidad,IFNULL(GROUP_CONCAT(me.modelo SEPARATOR ', '),'Sin modelo asignado') AS equipos, s.modificacion FROM stock s INNER JOIN consumibles c ON c.id_consumible = s.id_consumible INNER JOIN tipo_consumibles tc ON tc.id_tipo_consumibles = c.tipo_consumible INNER JOIN marca_consumibles mc ON mc.id_marca_consumible = c.marca_consumible LEFT JOIN consumible_modelos cm ON cm.id_consumible = c.id_consumible LEFT JOIN tipo_equipos t ON t.id_tipo_equipo = cm.id_tipo_equipo LEFT JOIN modelo_equipos me ON me.id_modelo_equipo = t.modelo_equipo GROUP BY c.id_consumible, mc.marca_consumible, tc.tipo_consumible, c.consumible, s.cantidad order by mc.marca_consumible, c.consumible asc ")
    
     if(stock.length === 0){
        
        return res.status(400).json({
            ok:false,
            message:"No hay datos que importar aun",
            redirect: "/client/stock"
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

















export default clienteRouter