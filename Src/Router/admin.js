import { Router, text } from "express";
import pool from "../Helpers/conecctionsdb.js";
import isAuthLogin from "../Helpers/isAutenticate.js";
import bodyValidateDirecciones from "../public/JS/areas/bodyValidateDirecciones.js";
import validateExpressErrors from "../Helpers/expressValidatorErrors.js";
import bodyValidateDireccionesEdit from "../public/JS/areas/bodyValidateDireccionesEdit.js";
import bodyValidateAreas from "../public/JS/areas/bodyValidateArea.js";
import bodyValidateMarcasEquipos from "../public/JS/equipos/bodyValidateMarcasEquipos.js";
import bodyValidateModelosEquipos from "../public/JS/equipos/bodyValidateModelosEquipos.js";
import bodyValidateTiposEquipos from "../public/JS/equipos/bodyValidateTiposEquipos.js";
import bodyValidateTiposConsumuibles from "../public/JS/consumibles/bodyValidateTiposConsumibles.js";
import bodyValidateMarcasConsumibles from "../public/JS/consumibles/bodyValidateMarcasConsumibles.js";
import { encryptPassword } from "../Helpers/brcript.js";
import bodyValidateConsumible from "../public/JS/consumibles/bodyValidateConsumible.js";
import bodyValidateAddUsers from "../public/JS/admin/bodyValidateAddUsers.js";
import bodyValidateEquipos from "../public/JS/equipos/bodyValidateEquipos.js";
import excelExport from "../Helpers/excelExport.js";



const routeAdmin= Router()


//todo redirect main route 
routeAdmin.get("/",isAuthLogin(1),(req,res)=>{
    
res.redirect("/admin/users")
    
})


//todo principal route pagination

routeAdmin.get("/users", isAuthLogin(1),async (req, res)=>{
    
    let page= parseInt(req.query.page || 1)
    const userSearch= req.query.user
    const limit= 3   //?rango de busqueda
    const offset= (page -1) * limit //?donde empiza la busqueda (ignora desde y traeme los siguientes)
    
    const [usersFullSearch]= await pool.query("select u.id_user, u.fullname from users u where u.fullname != 'Administrador'") || "No hay usuarios disponibles"

    let usersAll= []
    let totalUsers=0

    if(userSearch){
     
        const [searchUsers]= await pool.query(`select u.username, u.fullname, r.role from users u inner join roles r on r.id_role = u.role where r.role != "Admin" and u.fullname = ?`,[userSearch])
        
        const [[{total_users:count}]]= await pool.query(`select count(*) as total_users from users u where u.fullname like ? `,[`%${userSearch}$`])


        usersAll= searchUsers
        totalUsers= count
    }else{
        
        const [[{total_users:count}]]= await pool.query("select count(*) as total_users from users u inner join roles r on u.role = r.id_role where r.role !='Admin' ")
        
        const [users] = await pool.query("select u.id_user, u.username, u.fullname, r.role from users u inner join roles r on u.role = r.id_role where r.role != 'Admin' limit ? offset ? ",[limit,offset])
        
        usersAll= users
        totalUsers=count

    }
    
    if(page < 1){
        page = 1
    }
    
    const totalPage= Math.ceil(totalUsers/ limit)
    
    if (page > totalPage && totalPage > 0) {
        return res.redirect(`/admin/users?page=${totalPage}`) 
        //?redireccion a al ultima pagina
    } 
    
    
    
    //todo render       
    res.render("admin/admin.pug",{
        titles:"USUARIOS",
        description:"USUARIOS DE LA APLICACION",
        style:"/CSS/adminUsers.css",
        Script:"/JS/admin/adminJS.js",
        usersFullSearch, //? users data list
        page,
        totalPage,
        usersAll,
        idField:"id_user",
        dataHead:[ //!options table render users
            {key:"username", valueHeadText:"Usuario" },
            {key:"fullname", valueHeadText:"Nombre Completo" },
            {key:"role", valueHeadText:"Role",
            cellClass: (value)=> value==="Capturista" ? "Capturista" : "" || value==="Cliente" ? "Cliente" : ""},
        ],
        actions:[
           {
            type:"edit",
            icon:"far fa-edit",
            href:"/admin/users/edit/"
           },{
            type:"delete",
            icon:"fas fa-trash-alt",
            href:"/admin/users/delete/"
           }
            
        ],
        navItems:[ //? icons nav render role
            
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
        formShowAdd:{ //?options form show
             idForm:"addUsers",
             title:"Agregar Usuario",
             valueSubmit:"Agregar Usuario", 
             selected:[{
                    id:"selectUserRole",
                    name:"role",
                    class__icon:"fas fa-user-tag",
                    defaultOption:"Selecciona un Role",
                    options:[{ value:2,valueText:"Capturista"},{value:3,valueText:"Cliente"}]
                    
             }] 
        },
        formShowInputs:[{ //? formAdd form show Inputs render
                type:"text",
                name:"username",
                placeholder:"Escribe un nombre de usuario",
                id:"usuario",
                classIcon:"fas fa-user"
        },{
            type:"text",
             name:"fullname",
             placeholder:"Escribe nombre completo de usuario",
             id:"nombre",
             classIcon:"fas fa-user-tie"
        
        },{
            type:"password",
            name:"password",
            id:"Contraseña",
            placeholder:"Escribe una contraseña",
            classIcon:"fas fa-lock"            
        }],
        dataListSearch:{ //!serach dataList Form
            action:"/admin/users",
            method:"GET",
            name:"user", //?req.query
            id:"userList",
            placeholderSearch:"Buscar por Nombre",
            submit:"Buscar"
        },
        optionsDataSearch:usersFullSearch.map(e=> e.fullname)//*Reacondicion de consulta para datalistseach(un solo valor)
          
    })

})




//TODO GET EDIT USERS

routeAdmin.get("/users/edit/:id",isAuthLogin(1), async (req,res)=>{

const id= parseInt(req.params.id)

const [idUsers]= await pool.query("select id_user from users")

const numbers= idUsers.map(u => u.id_user)

if(!numbers.includes(id)){
    
    return res.status(400).json({
        ok:false,
        message:"El usuario no existe",
        redirect:"/admin/users"
    })
    
    
}


const [userSearch]= await pool.query("select u.id_user, u.fullname,u.username, r.role from users u inner join roles r on id_role= u.role where id_user= ?",[id])

const [roles]= await pool.query("select id_role, role from roles where role!= 'Admin'")

res.render("Edits/edits.pug",{
        titles:"USUARIOS",
        description:"USUARIOS DE LA CEAS",
        style:"/CSS/edits.css",
        Script:"/JS/edits/editsUsers.js",
        navItems:[ //? icons nav render role
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
                
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
            valueBtn:"EDITAR",
            titleForm:"EDITAR USUARIO",
            formId:"editUsuario",
            titleHeadForm:"USUARIO",
            idEdit:id,
            inputs:[
                  {
                    type:"text",
                    placeholder:"Escribe el nombre de Usuario...",
                    name:"username",
                    id:"usernameEdit",
                    labelTitle:"Usuario:",
                    value:userSearch[0].username
                },
                {
                    type:"text",
                    placeholder:"Escribe el nombre Completo...",
                    name:"fullname",
                    id:"fullnameEdit",
                    labelTitle:"Nombre:",
                    value:userSearch[0].fullname
                }, {
                    type:"text",
                    placeholder:"Escribe la nueva Contraseña...",
                    name:"password",
                    id:"passwordEdit",
                    labelTitle:"Contraseña:",
                
                },
                {
                    type:"select",
                    name:"role",
                    id:"roleEdit",
                    labelTitle:"Role:",
                    value:userSearch[0].role,
                    options: roles.map(t=> { return {
                        value:t.id_role,
                        text:t.role
                }})
                
            }]

    })


})





//TODO POST USER UPDATE


routeAdmin.post("/users/edit/:id", isAuthLogin(1), bodyValidateAddUsers, async (req, res)=>{


const id= parseInt(req.params.id)

const {username, fullname, role, password}= req.body

const parseRole= parseInt(role)


const [idUsers]= await pool.query("select id_user from users")

const numbers= idUsers.map(u => u.id_user)

if(!numbers.includes(id)){
    
    return res.status(400).json({
        ok:false,
        message:"El usuario no existe",
        redirect:"/admin/users"
    })
    
    
}

const [userSearch]= await pool.query("select id_user,username, fullname, role from users where (username= ? or  fullname= ?) and id_user!= ?",[username,fullname,id])


if (userSearch.length > 0 ){
    
    return  res.status(400).json({
        ok:false,
        message:`El Usuario o Nombre ya existe`,
        redirect:"/admin/users"
    })
}



const newPassword= await encryptPassword(password)

if(!newPassword){ 
    return res.status(400).json({
        ok:false,
        message:"Hubo un error al encriptar la contraseña",
        redirect:"/admin/users"
        
        
    })
}


const newUser={
    username,
    fullname,
    role:parseRole,
    password: newPassword

}

const [updateUser]= await pool.query("update users set ? where id_user= ?", [newUser, id])


if (updateUser.affectedRows > 0){
    
    return res.status(200).json({
        ok:true,
        message: `Se ha actualizado el usuario ${username}`,
        redirect: "/admin/users"
    })

}else{
    return res.status(400).json({
        ok:false,
        message:`Hubo un error al actualizar el usuario${username}`,
        redirect: "/admin/users"
    })
}


})











//!EQUIPOS Y AREAS


routeAdmin.get("/areas",isAuthLogin(1), async (req,res)=>{


    const direccionSearch = req.query.direccion //?query direccion

    const orderDirections= req.query.orderDirections //?query orderDirecciones

    //todo querys content Direcciones
    const [direcciones]= await pool.query("select id_direccion,direccion from direcciones")

    const [orderDirecciones] = await pool.query("select id_direccion,direccion from direcciones order by direccion desc")

    const [direccionSelect]= await pool.query("select id_direccion, direccion from direcciones where direccion= ?",[direccionSearch])

    //todo render content direcciones
    let direccionesALL= []


    if(direccionSearch && direccionSearch.length > 0){

        direccionesALL=direccionSelect
        
    }else if(orderDirections && orderDirections.length > 0){

        direccionesALL= orderDirecciones
    }else{
        direccionesALL=direcciones
        
    }

    

    //todo render direcciones

    let areasAll= []

    const areaSearch = req.query.area

    const orderAreas= req.query.orderAreas
    
    const [areas]= await pool.query("select a.id_area,d.direccion,a.area from areas a inner join direcciones d on d.id_direccion= a.direccion")

    const [areaFind]= await pool.query("select id_area,direccion,area from areas where area= ?",[areaSearch])

    const[areasOrder]= await pool.query("select a.id_area,d.direccion,a.area from areas a inner join direcciones d on d.id_direccion= a.direccion order by a.area asc")

    areasAll= areas

    if(areaSearch?.length > 0 ){
        
        areasAll= areaFind

    }

    if(orderAreas?.length > 0){
        areasAll= areasOrder
    }


    //*render
    
    res.render("admin/areas.pug", {
        titles:"AREAS CEAS",
        description:"AREAS Y DIRECCIONES DE LA CEAS",
        style:"/CSS/adminAreas.css",
        Script:"/JS/areas/adminAreas.js",
        navItems:[ //? icons nav render role
           
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
            containerData:{//?RENDER DATA CONTAINER DIRECTIONS
                title:"Direcciones",
                idField: "id_direccion",   
                hrefRute:"/admin/areas/direccion/edit",
                headTitles:["Direccion"],
                optionsBtn:[{
                    Title:"Agregar",
                    contentText:"Agregar Direccion",
                    href:"#",
                    classIcon:"fas fa-plus-circle",
                    classActiveForm: "DireccionBtn" //?btn class

                },{
                    Title:"Ordenar",
                    contentText:"Ordernar Z-A",
                    href:"/admin/areas/?orderDirections=true",
                    classIcon:"fas fa-sort-alpha-up"
                }],
                    itemsData:direccionesALL // query
                
            },
            dataListSearch1:{//? datalist search
                method:"GET",
                action:"/admin/areas",
                name:"direccion",
                id:"direccionList",
                placeholderSearch:"Buscar Direccion....",
                submit:"Buscar"
            },
            optionsDataSearch1:direccionesALL.map(e=> e.direccion),
            formShowAdd:{//? form direccion
                idForm: "formAddDireccion",
                title:"AGREGAR DIRECCION",
                valueSubmit:"Agregar Area",
                selected:[]
            },
            formShowInputs:[{
                id:"direccion",
                name:"direccion",
                placeholder:"Escribe el nombre de la Direccion",
                classIcon: "fas fa-building"
            }],
            classTarget1:"FormDireccion",
            classClose1:"closeDireccion",
            dataListSearch2:{//?render data list areas
              method:"GET",
              action:"/admin/areas",
              name:"area",
              id:"areaList",
              placeholderSearch:"Buscar Area...",
              submit: "Buscar"

            },
            optionsDataSearch2:areasAll.map(a=>a.area),
            containerData2:{
                title:"AREAS",
                idField:"id_area",
                hrefRute:"/admin/areas/areas/edit",
                headTitles:["Direccion", "Area"],
                optionsBtn:[
                    {
                    Title:"Agregar",
                    contentText:"Agregar Area",
                    href:"#",
                    classIcon:"fas fa-plus-circle",
                    classActiveForm: "areaBtn" //?btn class form

                },{
                    Title:"Ordenar",
                    contentText:"Ordernar Z-A",
                    href:"/admin/areas/?orderAreas=true",
                    classIcon:"fas fa-sort-alpha-up"
                }],
                itemsData: areasAll,
                
            },//? formAdd area
            formShowAdd1:{
                idForm: "formAddArea",
                title:"AGREGAR AREA",
                valueSubmit:"Agregar Area",
                selected:[{
                    id:"areasSelect",
                    class__icon:"fas fa-building",
                    name:"direccion",
                    defaultOption:"Seleccione una Direccion",
                    options:direcciones.map(d => { return {
                        value:d.id_direccion,
                        valueText: d.direccion
                    }})
                }]
            },formShowInputs2:[{
                id:"Area",
                classIcon:"fas fa-school",
                type:"text",
                placeholder:"Escribe un Area",
                name:"area",
            }],
            classTarget2:"formAreas",
            classClose2:"formAreaClose"

        })


})




// TODO ADD AREA

routeAdmin.post("/areas/direccion", isAuthLogin(1),bodyValidateDirecciones,validateExpressErrors("/admin/areas"),  async (req, res) => {

    const { direccion } = req.body;

    const [direccionFind]= await pool.query("select direccion from direcciones where direccion= ?",[direccion]) 

    try {
        
        if(direccionFind.length > 0){
            res.status(400).json({
                ok:false,
                message: `La direccion ${direccion} ya existe, vuleve a intentarlo`,
                redirect:"/admin/areas"
            })  
        }else{
            
        const [areaAdd] = await pool.query("INSERT INTO direcciones SET ?",{ direccion: direccion });

        if (areaAdd.affectedRows > 0) {
        
            res.status(200).json({
                ok:true,
                message:`La direccion ${direccion} se ha creado satisfactoriamente`,
                redirect:"/admin/areas"
            })

        } else {
            res.status(400).json({
                ok:false,
                message:"Error al crear la direccion",
                redirect:"/admin/areas"
            })
            
        } }
        

    } catch (err) {

        console.error("SQL ERROR:", err);

    }

});




//todo EDIT AREA GET Y POST


routeAdmin.get("/areas/direccion/edit/:id",isAuthLogin(1), async (req,res)=>{
    
    const id= parseInt(req.params.id)

    const [direccionEdit]= await pool.query("select id_direccion,direccion from direcciones where id_direccion=?",[id])

    const [getDirecciones]= await pool.query("select id_direccion,direccion from  direcciones")

    const idDirecciones= getDirecciones.map(d=> d.id_direccion)

    if(!idDirecciones.includes(id)){
       return res.redirect("/admin/areas")
    }


    res.render("edits/edits.pug",{
        titles:"AREAS CEAS",
        description:"AREAS Y DIRECCIONES DE LA CEAS",
        style:"/CSS/edits.css",
        Script:"/JS/edits/editsDireccion.js",
        navItems:[ //? icons nav render role
           
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
            valueBtn:"EDITAR",
            titleForm:"EDITAR DIRECCION",
            formId:"editDireccion",
            titleHeadForm:"DIRECCIONES Y AREAS",
            idEdit:id,
            inputs:[
                {
                    type:"text",
                    placeholder:"Direccion del Area...",
                    name:"direccion",
                    id:"direccionEdit",
                    labelTitle:"Direccion:",
                    value:direccionEdit[0].direccion
                    

                },
                
            ]




    })




})





//TODO UPDATE EDIT DIRECCION


routeAdmin.post("/areas/direccion/edit/:id",isAuthLogin(1),bodyValidateDireccionesEdit,validateExpressErrors("/admin/areas"),async (req,res)=>{

    const {direccion} = req.body
    
    const id= parseInt(req.params.id)

    console.log(id)

    const [getDirecciones]= await pool.query("select id_direccion,direccion from  direcciones")

    const idDirecciones= getDirecciones.map(d=> d.id_direccion)

    console.log(idDirecciones)

    if(!idDirecciones.includes(id)){
        return res.status(400).json({
            ok:false,
            message:"Id Invalido",
            redirect:"/admin/areas"
        })

    }

    const [[direccionFind]]=await pool.query("select direccion from direcciones where direccion= ?", [direccion])


        if(!direccionFind){
    
            try {
                const [newDireccion]= await pool.query("update direcciones set direccion= ? where id_direccion= ?",[direccion,id])
                
                if(newDireccion.affectedRows > 0){
                    
                    return res.status(200).json({
                        ok:true,
                        message:`Se actualizo direccion: ${direccion}`,
                        redirect:"/admin/areas"
                    })
                    
                }else{
                    return res.status(400).json({
                        ok:false,
                        message:`No se pudo actualizar direccion: ${direccion}`,
                        redirect:"/admin/areas"
                    })
                }           
                
            } catch (error) {
                
                return res.status(400).json({
                    ok:false,
                    message:"Error en la aplicacion",
                    redirect:"/admin/areas"
                })
                
            }
        }else{
            
            return res.status(400).json({
                ok:false,
                message: `la direccion ha actualizar ${direccion} ya existe`,
                redirect:"/admin/areas"
            })


        }
            
})



//TODO AREAS AREAS ADD

routeAdmin.post("/areas/areas",isAuthLogin(1),bodyValidateAreas,validateExpressErrors("/admin/areas"),async (req,res)=>{
     
    const {area,direccion}=req.body

    parseInt(direccion)

    const [[areaFind]]= await pool.query("Select id_area,direccion, area from areas where area= ?",[area])

    if(areaFind){
        
        return res.status(400).json({
            ok:false,
            message:`El area ${area} ya existe, intente de nuevo`,
            redirect:"/admin/areas"

        })
    }

    const [newArea]= await pool.query("insert into areas set ?",{area,direccion})

    if(newArea.affectedRows > 0){
        return res.status(200).json({
            ok:true,
            message:`Se ha agregado el area ${area}`,
            redirect:"/admin/areas"
        })
    }else{
        return res.status(400).json({
             ok:false,
             message:`Error al agregar ${area}`,
             redirect:"/admin/areas"
        })
    }

})


//TODO GET EDIT AREA


routeAdmin.get("/areas/areas/edit/:id",isAuthLogin(1), async (req,res)=>{
    
     const id = parseInt(req.params.id)
      
    const [idAreas] = await pool.query("select id_area from areas")

    const [[area]]= await pool.query("select a.id_area,d.direccion,a.area from areas a inner join direcciones d on id_direccion = a.direccion where id_area= ?",[id])

    const [direcciones]= await pool.query("select id_direccion, direccion from direcciones")
    
    const idAreasMap= idAreas.map(a => a.id_area)
    
    const direcionesMap=direcciones.map(d => {
        return {
            value: d.id_direccion,
            text:d.direccion
        }
    })

    console.log(direcionesMap)
    console.log(idAreasMap)


    if(!idAreasMap.includes(id)){
        return res.redirect("/admin/areas")
    }



    //?render
    res.render("Edits/edits.pug",{

        titles:"AREAS CEAS",
        description:"AREAS Y DIRECCIONES DE LA CEAS",
        style:"/CSS/edits.css",
        Script:"/JS/edits/editsAreas.js",
        navItems:[ //? icons nav render role
           
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
            valueBtn:"EDITAR",
            titleForm:"EDITAR AREA",
            formId:"editArea",
            titleHeadForm:"DIRECCIONES Y AREAS",
            idEdit:id,
            inputs:[
                {
                    type:"text",
                    labelTitle:"Area",
                    placeholder:"Escribe un Area...",
                    name:"area",
                    id:"areas",
                    value: area.area
                },{
                    type:"select",
                    labelTitle:"Direccion",
                    name:"direccion",
                    id:"Direccion",
                    value:area.direccion,
                    options: direcionesMap
                }
            ]



    })

})



//TODO  update area


routeAdmin.post("/areas/areas/edit/:id", async (req,res)=>{
    
    let {area, direccion}=  req.body

    const id= parseInt(req.params.id)

    direccion=parseInt(direccion)

    const [[areaFind]] = await pool.query("select area from areas where area=? and id_area != ?",[area,id])

    const [idAreas]= await pool.query("select id_area from areas")

    const idAreasMap=idAreas.map(e=> e.id_area)


    if(areaFind){
        return res.status(400).json({ 
            ok:false,
            message:`El area ${area} ha actulizar ya existe`,
            redirect:"/admin/areas"
        })
    }



    if(idAreasMap.includes(id)){
    
        const [updateArea]= await pool.query("update areas set area= ?, direccion= ? where id_area= ?", [area,direccion,id])

        if(updateArea.affectedRows > 0){
            
            return res.status(200).json({
                ok:true,
                message:`Se actualizo el area ${area}`,
                redirect:"/admin/areas"
            })
        }else{
             
            return res.status(400).json({
                ok:false,
                message:"Error al actualizar el area",
                redirect:"/admin/areas"
            })
        }

    }else{
            return res.status(400).json({
                ok:false,
                message:"Id invalido o el area no existe",
                redirect:"/admin/areas"
            })

    }





})






//!EQUIPOS RENDER ADD Y EDIT

routeAdmin.get("/equipos",isAuthLogin(1), async (req,res)=>{

    //todo equipos tablecontent

    let page= parseInt(req.query.page) || 1
    const inventarioQuery= req.query.inventario
    const limit= 10   //?rango de busqueda
    const offset= (page -1) * limit //?donde empiza la busqueda (ignora desde y traeme los siguientes)
    let equiposTotalCount=[]

    //? usersCount Pagination
    const [[{total_equipos:count}]]= await pool.query(`select count(*) as total_equipos from equipos`)
    
    const [[{total_equipos:countSearch}]]= await pool.query(`select count(*) as total_equipos from equipos where inventario= ?`, [inventarioQuery])
    
    if(page < 0) page= 1 

    if (inventarioQuery){    

        equiposTotalCount= countSearch

    }else{
        equiposTotalCount= count
    }


    const totalPage= Math.ceil(equiposTotalCount/ limit)
    

    if (page > totalPage && totalPage > 0) {
        return res.redirect(`/equipos/?page=${totalPage}`) 
        //?redireccion a al ultima pagina
    } 


    
    //? equipos querys render 


    const invetarioSearch= req.query.inventario

    let equiposAll= []


    if(invetarioSearch && invetarioSearch.length  > 0){

        const [equiposSearchs]= await pool.query("select e.id_equipo, t.tipo_de_equipo,ma.marca_equipo, md.modelo ,e.serie, e.inventario, e.estado_equipo, a.area, d.direccion, group_concat(c.consumible separator ',') as consumible,e.observaciones, e.user from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo inner join areas a on a.id_area= e.area inner join direcciones d on d.id_direccion = a.direccion inner join consumible_equipos ce on ce.id_equipo= e.id_equipo inner join consumibles c on c.id_consumible = ce.id_consumible inner join modelo_equipos md on id_modelo_equipo= t.modelo_equipo inner join marca_equipos ma on id_marca_equipo= md.marca_equipo where e.inventario= ? group by id_equipo", [invetarioSearch])
        
        equiposAll= equiposSearchs

    }else{

        const [equipos]= await pool.query("select e.id_equipo, t.tipo_de_equipo,ma.marca_equipo, md.modelo ,e.serie, e.inventario, e.estado_equipo, a.area, d.direccion, group_concat(c.consumible separator ',') as consumible,e.observaciones, e.user from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo inner join areas a on a.id_area= e.area inner join direcciones d on d.id_direccion = a.direccion inner join consumible_equipos ce on ce.id_equipo= e.id_equipo inner join consumibles c on c.id_consumible = ce.id_consumible inner join modelo_equipos md on id_modelo_equipo= t.modelo_equipo inner join marca_equipos ma on id_marca_equipo= md.marca_equipo group by id_equipo limit ? offset ?", [limit, offset])

        equiposAll= equipos

    }

    const [consumibles]= await pool.query("select id_consumible, tipo_consumible, marca_consumible, consumible from consumibles")

    const [areas]= await pool.query("select id_area, direccion, area from areas")

     const [tipos]= await pool.query("select t.id_tipo_equipo, t.tipo_de_equipo, mo.modelo from tipo_equipos t inner join modelo_equipos mo on mo.id_modelo_equipo= t.modelo_equipo")

    //?equipos totals

    const [[totalCPU]]= await pool.query("select t.tipo_de_equipo, count(*) as totalCPU from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo where t.tipo_de_equipo= 'CPU' and e.estado_equipo= 'BUENO'")
    const [[totalAllinOne]]= await pool.query("select t.tipo_de_equipo, count(*) as totalAllinOne from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo where t.tipo_de_equipo= 'ALL IN ONE' and e.estado_equipo= 'BUENO'")
    const [[totalMonitor]]= await pool.query("select t.tipo_de_equipo, count(*) as totalMonitor from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo where t.tipo_de_equipo= 'MONITOR' and e.estado_equipo= 'BUENO'")
    const [[totalImpresora]]= await pool.query("select t.tipo_de_equipo, count(*) as totalImpresora from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo where t.tipo_de_equipo= 'IMPRESORA' and e.estado_equipo= 'BUENO'")
    const [[totalMultifuncional]]= await pool.query("select t.tipo_de_equipo, count(*) as totalMultifuncional from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo where t.tipo_de_equipo= 'MULTIFUNCIONAL' and e.estado_equipo= 'BUENO'")
    const [[totalEquiposActivos]]= await pool.query("select count(*) as totalEquiposActivos from equipos e where e.estado_equipo= 'BUENO' ")


    //todo marcas
const marcaSearch= req.query.marca

const orderMarcas=req.query.orderMarcasEquipos

let marcasAll=[]

const [marcasQuery]=await pool.query("select id_marca_equipo, marca_equipo from marca_equipos")

const [marcaSerachAll] = await pool.query("select id_marca_equipo, marca_equipo from marca_equipos where marca_equipo = ?", [marcaSearch])

const [marcasOrder]= await pool.query("select id_marca_equipo, marca_equipo from marca_equipos order by marca_equipo desc")
 
marcaSearch && marcaSearch.length > 0 ? marcasAll= marcaSerachAll : marcasAll = marcasQuery

orderMarcas && orderMarcas.length > 0 ? marcasAll= marcasOrder : marcasAll= marcasQuery


//todo modelos

const  modeloSearch=req.query.modelo

const orderModelo=req.query.orderModeloEquipos

let modelosAll= []

const [modelosOrder]= await pool.query("select m.id_modelo_equipo, ma.marca_equipo, m.modelo from modelo_equipos m inner join marca_equipos ma on ma.id_marca_equipo= m.marca_equipo order by m.modelo desc")

const [modeloSearchQuery] = await pool.query("select ma.marca_equipo, m.modelo from modelo_equipos m inner join marca_equipos ma on ma.id_marca_equipo= m.marca_equipo where m.modelo = ?", [modeloSearch])

const [modelos]= await pool.query("select m.id_modelo_equipo, ma.marca_equipo, m.modelo from modelo_equipos m inner join marca_equipos ma on ma.id_marca_equipo= m.marca_equipo ")


modeloSearch &&  modeloSearch.length > 0 ? modelosAll=  modeloSearchQuery : modelosAll= modelos

orderModelo && orderModelo.length > 0 ? modelosAll= modelosOrder : modelosAll= modelos


//todo tipos de equipos

const tipoSearch= req.query.tipo

const tipoOrder= req.query.orderTipoEquipos

let tiposAll=[]

const [tiposOrders]= await pool.query("select t.id_tipo_equipo, t.tipo_de_equipo, m.modelo, ma.marca_equipo from tipo_equipos t inner join modelo_equipos m on m.id_modelo_equipo= t.modelo_equipo inner join marca_equipos ma on ma.id_marca_equipo= m.marca_equipo order by t.tipo_de_equipo desc")

const [tipoSearchQuery]= await pool.query("select t.id_tipo_equipo, t.tipo_de_equipo, m.modelo, ma.marca_equipo from tipo_equipos t inner join modelo_equipos m on m.id_modelo_equipo= t.modelo_equipo inner join marca_equipos ma on ma.id_marca_equipo= m.marca_equipo  where t.tipo_de_equipo= ? ", [tipoSearch])

const [tiposEquipos]= await pool.query("select t.id_tipo_equipo, t.tipo_de_equipo, m.modelo, ma.marca_equipo from tipo_equipos t inner join modelo_equipos m on m.id_modelo_equipo= t.modelo_equipo inner join marca_equipos ma on ma.id_marca_equipo= m.marca_equipo ")


tipoSearch && tipoSearch.length > 0 ? tiposAll= tipoSearchQuery : tiposAll= tiposEquipos

tipoOrder && tipoOrder.length > 0 ? tiposAll= tiposOrders : tiposAll= tiposEquipos



res.render("admin/equipos.pug",{
    
        titles:"EQUIPOS",
        description:"MARCAS , MODELOS Y EQUIPOS DE LA CEAS",
        style:"/CSS/equipos.css",
        Script:"/JS/equipos/equipos.js",
        navItems:[ //? icons nav render role
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }], 
            //?equipos and nav pagination
            
             totalPage,
             page,
             equiposAll,
             idField:"id_equipo",
             dataHead:[ //!options table render users
                {key:"tipo_de_equipo", valueHeadText:"Equipo", cellClass: (value)=> value==="MULTIFUNCIONAL" ? "Multifuncional": "" || value==="IMPRESORA" ? "Impresora": "" || value==="CPU" ? "Cpu": "" || value=== "MONITOR" ? "Monitor" : "" || value=== "ALL IN ONE" ? "All in One" : ""},
                {key:"marca_equipo", valueHeadText:"Marca" },
                {key:"modelo", valueHeadText:"Modelo" },
                {key:"serie", valueHeadText:"Serie" },
                {key:"inventario", valueHeadText:"Inventario" },
                {key:"estado_equipo", valueHeadText:"Estatus", cellClass: (value)=> value==="BUENO" ? "Bueno" : "" ||  value==="MALO" ? "Malo" : "" || value==="BAJA" ? "Baja" : ""},
                {key:"area", valueHeadText:"Area" },
                {key:"direccion", valueHeadText:"Direccion" },
                {key:"consumible", valueHeadText:"Consumible" },
                {key:"observaciones", valueHeadText:"Observacion" },
            ],
             actions:[
            {
                type:"edit",
                icon:"far fa-edit",
                href:"/admin/equipos/equipo/edit/"
            },{
                type:"delete",
                icon:"fas fa-trash-alt",
                href:"/admin/equipos/equipo/delete/"
            }
                
            ],
            //? form equipos
             formShowAdd4:{
                idForm: "formAddEquipo",
                title:"AGREGAR EQUIPO",
                valueSubmit:"Agregar Equipo",
                selected:[{
                    id:"tipoEquipoSelect",
                    class__icon:"fas fa-pencil-alt",
                    name:"tipo_equipo",
                    defaultOption:"Seleccione un Tipo de Equipo",
                    options:tipos.map(t => { return {
                        value:t.id_tipo_equipo,
                        valueText: t.modelo
                    }})
                },
            {
                    id:"areaSelect",
                    class__icon:"fas fa-tint",
                    name:"area",
                    defaultOption:"Seleccione un Area",
                    options:areas.map(a => { return {
                        value:a.id_area,
                        valueText: a.area
                    }})
                },{
                    id:"consumibleSelect",
                    class__icon:"fas fa-tint",
                    name:"consumible",
                    defaultOption:"Seleccione un Consumible",
                    multiple:true,
                    options:consumibles.map(c => { return {
                        value:c.id_consumible,
                        valueText: c.consumible
                    }})
                }]
            },formShowInputs4:[{
                id:"serie",
                classIcon:"fas fa-search-location",
                type:"text",
                placeholder:"Escribe la Serie del Equipo",
                name:"serie",
            },{
                id:"inventarios",
                classIcon:"fas fa-globe",
                type:"text",
                placeholder:"Escribe el Inventario del Equipo",
                name:"inventario",
            },{
                id:"estado",
                classIcon:"fas fa-thumbs-up",
                type:"text",
                placeholder:"Escribe el Estado del Equipo",
                name:"estado_equipo",
            },{
                id:"observacion",
                classIcon:"fas fa-notes-medical",
                type:"text",
                placeholder:"Escribe una Observacion del Equipo",
                name:"observaciones",
            }],
            classTarget4:"equipoFormShow",
            classClose4:"equipoCloseBtn",

            dataListSearch4:{ //? DATA SEARACH MARCAS
            action:"/admin/equipos",
            method:"GET",
            name:"inventario", //?req.query
            id:"inventarioList",
            placeholderSearch:"Buscar por Inventario...",
            submit:"Buscar"
        },
        optionsDataSearch4:equiposAll.map(e=> e.inventario),
        totals:[{
            title:"CPU: ",
            value:totalCPU.totalCPU 
        },{title:"Impresoras: ",
            value:totalImpresora.totalImpresora
        }, {title:"Multifuncionales: ",
            value:totalMultifuncional.totalMultifuncional
        }, {title:"Monitores: ",
            value:totalMonitor.totalMonitor
        }, {title:"All in One: ",
            value:totalAllinOne.totalAllinOne
        },{title:"Total: ",
            value:totalEquiposActivos.totalEquiposActivos
        }, {
            value:"Agregar Equipo",
            action:"#",
            classIcon:"fas fa-plus",
            classActive:"btn_addEquipo"
        }, {
            value:"Descargar",
            action:"#",
            classIcon:"fas fa-download",
            classActive: "btnExportEquipo"
        }],


            //?Marca equipos
            formShowAdd:{
                idForm: "formAddMarca",
                title:"AGREGAR MARCA",
                valueSubmit:"Agregar Marca",
                selected:[]
            },formShowInputs:[{
                id:"marcas",
                classIcon:"fas fa-highlighter",
                type:"text",
                placeholder:"Escribe una Marca de Equipo",
                name:"marca_equipo",
            }],
            classTarget:"marcaFormShow",
            classClose:"marcaCloseBtn",

            containerData:{ //? DATA MARCAS RENDER
                title: "MARCAS DE EQUIPOS",
                idField: "id_marca_equipo",
                hrefRute:"/admin/equipos/marcas/edit",
                hrefRuteDelete:"/admin/equipos/marcas/delete",
                headTitles:["Marca de Equipo"],
                optionsBtn: [{
                    Title:"Agregar",
                    contentText:"Agregar Marca",
                    href:"#",
                    classIcon:"fas fa-plus-circle",
                    classActiveForm: "marcasBtn" //?btn class

                },{
                    Title:"Ordenar",
                    contentText:"Ordernar Z-A",
                    href:"/admin/equipos/?orderMarcasEquipos=true",
                    classIcon:"fas fa-sort-alpha-up"
                }],
                itemsData: marcasAll
            } ,
            dataListSearch:{ //? DATA SEARACH MARCAS
            action:"/admin/equipos",
            method:"GET",
            name:"marca", //?req.query
            id:"marcaList",
            placeholderSearch:"Buscar por Marca...",
            submit:"Buscar"
        },
        optionsDataSearch:marcasAll.map(e=> e.marca_equipo),    
        

        //?modelos de equipos
        formShowAdd2:{
            idForm: "formAddModelo",
            title:"AGREGAR MODELO DE EQUIPO",
            selected: [{
                id:"selectModelosAdd",
                class__icon:"fas fa-laptop",
                name:"marca_equipo",
                defaultOption:"Seleccione una Marca",
                options: marcasAll.map(m => { return {value:m.id_marca_equipo, valueText: m.marca_equipo}})
            }]  
        },
        formShowInputs2:[{
                id:"madelo",
                classIcon:"fas fa-pencil-alt",
                type:"text",
                placeholder:"Escribe una Modelo de Equipo",
                name:"modelo",
        }], 
         classTarget2:"modeloFormShow", 
         classClose2:"modeloCloseBtn",
         containerData2:{ //? DATA MARCAS RENDER
                title: "MODELOS DE EQUIPOS",
                idField: "id_modelo_equipo",
                hrefRute:"/admin/equipos/modelos/edit",
                hrefRuteDelete:"/admin/equipos/modelos/delete",
                headTitles:["Marca de Equipo", "Modelo de Equipo"], 
                optionsBtn: [{
                    Title:"Agregar",
                    contentText:"Agregar Modelo",
                    href:"#",
                    classIcon:"fas fa-plus-circle",
                    classActiveForm: "modelosBtn" //?btn class

                },{
                    Title:"Ordenar",
                    contentText:"Ordernar Z-A",
                    href:"/admin/equipos/?orderModeloEquipos=true",
                    classIcon:"fas fa-sort-alpha-up"
                }],
                itemsData: modelosAll
            } ,
            dataListSearch2:{ //? DATA SEARACH MARCAS
            action:"/admin/equipos",
            method:"GET",
            name:"modelo", //?req.query
            id:"modeloList",
            placeholderSearch:"Buscar por Madelo...",
            submit:"Buscar"
        },
        optionsDataSearch2:modelosAll.map(e=> e.modelo),    
        
        

        //?tipo de equipos
        formShowAdd3:{
            idForm: "formAddTipos",
            title:"AGREGAR EL TIPO DE EQUIPO",
            selected: [{
                id:"selectModelAdd",
                class__icon:"fas fa-pencil-alt",
                name:"modelo_equipo",
                defaultOption:"Seleccione un Modelo",
                options: modelosAll.map(m => { return {value:m.id_modelo_equipo, valueText: m.modelo}})
            }]  
        },
        formShowInputs3:[{
                id:"tipo_de_equipo",
                classIcon:"fas fa-mobile-alt",
                type:"text",
                placeholder:"Escribe el Tipo de Equipo",
                name:"tipo_de_equipo",
        }], 
         classTarget3:"tipoFormShow", 
         classClose3:"tipoCloseBtn",
         containerData3:{ //? DATA MARCAS RENDER
                title: "TIPOS DE EQUIPOS",
                idField: "id_tipo_equipo",
                hrefRute:"/admin/equipos/tipos/edit",
                hrefRuteDelete:"/admin/equipos/tipos/delete",
                headTitles:["Tipo de Equipo", "Modelo de Equipo", "Marca de Equipo"],
                optionsBtn: [{
                    Title:"Agregar",
                    contentText:"Agregar Tipo",
                    href:"#",
                    classIcon:"fas fa-plus-circle",
                    classActiveForm: "tipoBtn" //?btn class

                },{
                    Title:"Ordenar",
                    contentText:"Ordernar Z-A",
                    href:"/admin/equipos/?orderTipoEquipos=true",
                    classIcon:"fas fa-sort-alpha-up"
                }],
                itemsData: tiposAll
            } ,
            dataListSearch3:{ //? DATA SEARACH MARCAS
            action:"/admin/equipos",
            method:"GET",
            name:"tipo", //?req.query
            id:"tipoList",
            placeholderSearch:"Buscar por Tipo de Equipo...",
            submit:"Buscar"
        },
        optionsDataSearch3:tiposAll.map(e=> e.modelo),    



})})



//TODO GENERATE EXCEL EXPORT

routeAdmin.get("/equipos/export", isAuthLogin(1), async (req,res, next)=>{


     const [equipos]= await pool.query("select e.id_equipo, t.tipo_de_equipo,ma.marca_equipo, md.modelo ,e.serie, e.inventario, e.estado_equipo, a.area, d.direccion, group_concat(c.consumible separator ',') as consumible,e.observaciones, e.user from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo inner join areas a on a.id_area= e.area inner join direcciones d on d.id_direccion = a.direccion inner join consumible_equipos ce on ce.id_equipo= e.id_equipo inner join consumibles c on c.id_consumible = ce.id_consumible inner join modelo_equipos md on id_modelo_equipo= t.modelo_equipo inner join marca_equipos ma on id_marca_equipo= md.marca_equipo group by id_equipo")
    
     if(equipos.length === 0){
        
        return res.status(400).json({
            ok:false,
            message:"No hay datos que importar aun",
            redirect: "/admin/equipos"
        })
     }

     
    const columns= [
        {header: "id_equipo", key:"id_equipo", with: 10 },
        {header: "Equipo", key:"tipo_de_equipo", with: 20 },
        {header: "Marca", key:"marca_equipo", with: 20 },
        {header: "Modelo", key:"modelo", with: 20 },
        {header: "Serie", key:"serie", with: 20 },
        {header: "No. de Inventario", key:"inventario", with: 20 },
        {header: "Estado del Equipo", key:"estado_equipo", with: 30 },
        {header: "Area", key:"area", with: 20 },
        {header: "Direccion", key:"direccion", with: 40 },
        {header: "Consumible", key:"consumible", with: 40 },
        {header: "Observacion", key:"observaciones", with: 40 }
    
    ]
   
     await excelExport({name:"Equipos Totales", columnsArray:columns, dataArray:equipos, res})






})






//TODO POST EQUIPO

routeAdmin.post("/equipos/equipo",isAuthLogin(1),bodyValidateEquipos, validateExpressErrors("/admin/equipos"), async (req,res)=>{
    

    const {tipo_equipo, serie, inventario, estado_equipo, area,observaciones}= req.body

    const userSession= parseInt(req.user.id_user)

    const parseTipo= parseInt(tipo_equipo)
    
    const parseArea= parseInt(area)

    console.log(`consumible body ${req.body["consumible[]"]}`)

    const NewEquipo={
        tipo_equipo: parseTipo,
        serie,
        inventario,
        estado_equipo: estado_equipo.toUpperCase(),
        area: parseArea,
        observaciones,
        user:userSession
    }



    //?transactions
    const connection = await pool.getConnection()


    try {
        await connection.beginTransaction()

        const consumibles = Array.isArray(req.body["consumible[]"]) ? req.body["consumible[]"] : [req.body["consumible[]"]]
        



        const [equipoSearch] = await connection.query("SELECT id_equipo FROM equipos WHERE serie = ? OR inventario = ?",[serie, inventario])

        if (equipoSearch.length > 0) {
            await connection.rollback()
            return res.status(400).json({
                ok:false,
                message:`Ya existe el equipo ${inventario}`,
                redirect:"/admin/equipos"
            })
        }


        const [addEquipo] = await connection.query("INSERT INTO equipos SET ?",[NewEquipo])

        const idEquipo = addEquipo.insertId

        // ? INSERT MASIVO
        const values = consumibles.map(id => [idEquipo, parseInt(id)])


        await connection.query("INSERT INTO consumible_equipos (id_equipo, id_consumible) VALUES ?",[values])

        await connection.commit()

        return res.json({
            ok:true,
            message: `Se ha guardado el equipo ${inventario}`,
            redirect:"/admin/equipos"
        })

    } catch (err) {
        await connection.rollback()
        

        return res.status(500).json({
            ok:false,
            message:`Error ${err.message}`,
            redirect:"/admin/equipos"
        })

    } finally {
        connection.release()
    }

})







//todo POST ADD MARCA


routeAdmin.post("/marcas/equipo", isAuthLogin(1),bodyValidateMarcasEquipos,validateExpressErrors("/admin/equipos"), async(req,res)=>{

    const {marca_equipo}= req.body

    
    const [marcaFind]= await pool.query("select marca_equipo from marca_equipos where marca_equipo= ?",[marca_equipo])
    
    
    if(marcaFind.length > 0){
        return res.status(400).json({
            ok:false,
            message: `Ya existe la Marca ${marca_equipo}`,
            redirect:"/admin/equipos"
        })
    }


    const [marcaAdd]= await pool.query("insert into marca_equipos set ? ", [{marca_equipo}])
    

    if(marcaAdd.affectedRows > 0 ){
            return res.status(200).json({
                 ok:true,
                 message:`La marca ${marca_equipo} de equipo ha sido agregado`,
                 redirect:"/admin/equipos"
            })

    }

    return res.status(400).json({
        ok:false,
        message:`Hubo un error al crear la marca ${marca_equipo}`
    })



})



//TODO POST ADD MODELO

routeAdmin.post("/marcas/modelo", isAuthLogin(1),bodyValidateModelosEquipos,validateExpressErrors("/admin/equipos"), async (req, res) => {
    
    const {marca_equipo, modelo}= req.body

    const marca= parseInt(marca_equipo)

    const [modelFind]= await pool.query("select modelo from modelo_equipos where modelo = ?", [modelo])

    if(modelFind.length > 0){
        
        return res.status(400).json({
            ok:false,
            message:`El modelo ${modelo} ya existe, ingrese un nuevo modelo`,
            redirect:"/admin/equipos"
        })
    }


    const [modeloAdd] = await pool.query("insert into modelo_equipos set ?",[{marca_equipo: marca, modelo}])
    
    if (modeloAdd.affectedRows > 0) {
        return res.status(200).json({
            ok:true,
            message:`El modelo ${modelo} se ha agregado satisfactoriamente`,
            redirect:"/admin/equipos"
        })
    }

    return res.status(400).json({
        ok:false,
        message: `Error al agregar el modelo ${modelo}`,
        redirect:"/admin/equipos"
    })


} )





//todo POST ADD TIPO DE EQUIPO

routeAdmin.post("/marcas/tipo", isAuthLogin(1),bodyValidateTiposEquipos,validateExpressErrors("/admin/equipos"), async (req,res)=>{
    
    const {tipo_de_equipo, modelo_equipo}= req.body

    const modelo= parseInt(modelo_equipo)

    const tipo=tipo_de_equipo.toUpperCase()

    const [tipoFind]= await pool.query("select modelo_equipo, tipo_de_equipo from tipo_equipos where modelo_equipo= ?",[modelo])
    
    if(tipoFind.length > 0){
        return res.status(400).json({
            ok:false,
            message:`El tipo de equipo ${tipo_de_equipo} ya existe`,
            redirect:"/admin/equipos"
        })
    }

    const [tipoAdd]= await pool.query("insert into tipo_equipos SET ?",[{tipo_de_equipo:tipo, modelo_equipo:modelo}])

    if(tipoAdd.affectedRows > 0){
        return res.status(200).json({
             ok:true,
             message:`Se ha agregado el tipo de equipo ${tipo_de_equipo}`,
             redirect:"/admin/equipos"
        })
    }


    return res.status(400).json({
        ok: false,
        message:`Hubo un error al crear el tipo de equipo ${tipo_de_equipo}`,
        redirect:"/admin/equipos"
    })


})






//TODO GET EDIT EQUIPO
routeAdmin.get("/equipos/equipo/edit/:id",isAuthLogin(1),async (req,res)=>{
    
const id=parseInt(req.params.id)

const [idEquipos]= await pool.query("select id_equipo from equipos")

const [tiposEquipos]= await pool.query("select e.id_tipo_equipo, e.tipo_de_equipo, m.modelo from tipo_equipos e inner join modelo_equipos m on m.id_modelo_equipo= e.modelo_equipo")

const [areas]= await pool.query("select id_area, direccion, area from areas")

const [consumibles]= await pool.query("select id_consumible, tipo_consumible, marca_consumible, consumible from consumibles")


const idEquiposNumbers= idEquipos.map(id => id.id_equipo)

if (!idEquiposNumbers.includes(id)){
    res.redirect("/admin/equipos")
}

const [equipoSearch]= await pool.query("select e.id_equipo, t.tipo_de_equipo,ma.marca_equipo, md.modelo ,e.serie, e.inventario, e.estado_equipo, a.area, d.direccion, group_concat(c.consumible separator ',') as consumible,e.observaciones, e.user from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo inner join areas a on a.id_area= e.area inner join direcciones d on d.id_direccion = a.direccion inner join consumible_equipos ce on ce.id_equipo= e.id_equipo inner join consumibles c on c.id_consumible = ce.id_consumible inner join modelo_equipos md on id_modelo_equipo= t.modelo_equipo inner join marca_equipos ma on id_marca_equipo= md.marca_equipo group by e.id_equipo having e.id_equipo= ?",[id])

res.render("Edits/edits.pug",{
        titles:"EQUIPOS",
        description:"MARCAS , MODELOS Y EQUIPOS DE LA CEAS",
        style:"/CSS/edits.css",
        Script:"/JS/edits/editsEquipos.js",
        navItems:[ //? icons nav render role
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{


                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
            },
            {
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
            valueBtn:"EDITAR",
            titleForm:"EDITAR EQUIPO",
            formId:"editEquipo",
            titleHeadForm:"MARCAS, MODELOS Y EQUIPOS",
            idEdit:id,
            inputs:[
                {
                    type:"text",
                    placeholder:"Serie del Equipo...",
                    name:"serie",
                    id:"serieEdit",
                    labelTitle:"Serie:",
                    value:equipoSearch[0].serie
                },{
                    type:"text",
                    placeholder:"Inventario del Equipo...",
                    name:"inventario",
                    id:"inventarioEdit",
                    labelTitle:"Inventario:",
                    value:equipoSearch[0].inventario
                },{
                    type:"text",
                    placeholder:"Estado del Equipo...",
                    name:"estado_equipo",
                    id:"estadoEdit",
                    labelTitle:"Estado:",
                    value:equipoSearch[0].estado_equipo
                },{
                    type:"text",
                    placeholder:"Observacion del Equipo...",
                    name:"observaciones",
                    id:"observacionEdit",
                    labelTitle:"Observaciones:",
                    value:equipoSearch[0].observaciones
                },{
                    type:"select",
                    name:"tipo_equipo",
                    id:"tipoEdit",
                    labelTitle:"Tipo de Equipo:",
                    value:equipoSearch[0].modelo,
                    options: tiposEquipos.map(t=> { return {
                        value:t.id_tipo_equipo,
                        text:t.modelo
                }})
                }, {
                    type:"select",
                    name:"area",
                    id:"areaEdit",
                    labelTitle:"Area:",
                    value:equipoSearch[0].area,
                    options: areas.map(a=> { return {
                        value:a.id_area,
                        text:a.area
                }})
                }, {
                    type:"select",
                    name:"consumible",
                    id:"consumibleEdit",
                    labelTitle:"Consumible:",
                    multiple:true,
                    value:equipoSearch[0].consumible,
                    options: consumibles.map(c=> { return {
                        value:c.id_consumible,
                        text:c.consumible
                }})
                }   
                
            ]




    })


    
})







//TODO GET EDIT MARCA ID 

routeAdmin.get("/equipos/marcas/edit/:id",isAuthLogin(1),async (req,res)=>{
    
const id=parseInt(req.params.id)

const [idModelos]= await pool.query("select id_marca_equipo from marca_equipos")

const idMarcasNumbers= idModelos.map(id => id.id_marca_equipo)

if (!idMarcasNumbers.includes(id)){
    res.redirect("/admin/equipos")
}

const [marcaSearch]= await pool.query("select id_marca_equipo, marca_equipo from marca_equipos where id_marca_equipo= ?",[id])

res.render("Edits/edits.pug",{
        titles:"EQUIPOS",
        description:"MARCAS , MODELOS Y EQUIPOS DE LA CEAS",
        style:"/CSS/edits.css",
        Script:"/JS/edits/editsMarcas.js",
        navItems:[ //? icons nav render role
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{


                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
            },
            {
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
            valueBtn:"EDITAR",
            titleForm:"EDITAR MARCA ",
            formId:"editMarca",
            titleHeadForm:"MARCAS, MODELOS Y EQUIPOS",
            idEdit:id,
            inputs:[
                {
                    type:"text",
                    placeholder:"Marca de Equipo...",
                    name:"marca_equipo",
                    id:"marcaEdit",
                    labelTitle:"Marca:",
                    value:marcaSearch[0].marca_equipo
                },
                
            ]




    })


    
})



//TODO GET EDIT MODELO

routeAdmin.get("/equipos/modelos/edit/:id",isAuthLogin(1), async (req,res)=>{


const id=parseInt(req.params.id)

const [idModelosId]= await pool.query("select id_modelo_equipo from modelo_equipos")

const idModelosNumbers= idModelosId.map(id => id.id_modelo_equipo)

const [marcas]= await pool.query("select id_marca_equipo, marca_equipo from marca_equipos ")

if (!idModelosNumbers.includes(id)){
    res.redirect("/admin/equipos")
}

const [modeloSearch]= await pool.query("select m.id_modelo_equipo, ma.marca_equipo, m.modelo from modelo_equipos m inner join marca_equipos ma on ma.id_marca_equipo=m.marca_equipo where id_modelo_equipo= ?",[id])


res.render("Edits/edits.pug",{
        titles:"EQUIPOS",
        description:"MARCAS , MODELOS Y EQUIPOS DE LA CEAS",
        style:"/CSS/edits.css",
        Script:"/JS/edits/editsModelos.js",
        navItems:[ //? icons nav render role
           
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
            valueBtn:"EDITAR",
            titleForm:"EDITAR MODELO ",
            formId:"editModelo",
            titleHeadForm:"MARCAS, MODELOS Y EQUIPOS",
            idEdit:id,
            inputs:[
                {
                    type:"text",
                    placeholder:"Modelo de Equipo...",
                    name:"modelo",
                    id:"modeloEdit",
                    labelTitle:"Modelo:",
                    value:modeloSearch[0].modelo
                },{
                    type:"select",
                    name:"marca_equipo",
                    id:"marcaEdit",
                    labelTitle:"Marca:",
                    value:modeloSearch[0].marca_equipo,
                    options: marcas.map(m=> { return {
                        value:m.id_marca_equipo,
                        text:m.marca_equipo
                }})
                },
                
            ]




    })



})




//TODO GET EDIT TIPOS DE EQUIPOS

routeAdmin.get("/equipos/tipos/edit/:id", isAuthLogin(1), async (req,res)=>{
      
    const id=parseInt(req.params.id)

const [idTipoId]= await pool.query("select id_tipo_equipo from tipo_equipos")

const idTiposNumbers= idTipoId.map(id => id.id_tipo_equipo)

const [modelos]= await pool.query("select id_modelo_equipo, modelo from modelo_equipos ")

if (!idTiposNumbers.includes(id)){
    res.redirect("/admin/equipos")
}

const [tipoSearch]= await pool.query("select t.id_tipo_equipo, t.tipo_de_equipo, m.modelo from tipo_equipos t inner join modelo_equipos m on m.id_modelo_equipo=t.modelo_equipo where t.id_tipo_equipo= ?",[id])


res.render("Edits/edits.pug",{
        titles:"EQUIPOS",
        description:"MARCAS , MODELOS Y EQUIPOS DE LA CEAS",
        style:"/CSS/edits.css",
        Script:"/JS/edits/editsTipos.js",
        navItems:[ //? icons nav render role
           
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
                
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
            valueBtn:"EDITAR",
            titleForm:"EDITAR TIPO DE EQUIPO ",
            formId:"editTipo",
            titleHeadForm:"MARCAS, MODELOS Y EQUIPOS",
            idEdit:id,
            inputs:[
                {
                    type:"text",
                    placeholder:"Tipo de Equipo...",
                    name:"tipo_de_equipo",
                    id:"modeloEdit",
                    labelTitle:"Tipo de Equipo:",
                    value:tipoSearch[0].tipo_de_equipo
                },{
                    type:"select",
                    name:"modelo_equipo",
                    id:"marcaEdit",
                    labelTitle:"Modelo:",
                    value:tipoSearch[0].modelo,
                    options: modelos.map(m=> { return {
                        value:m.id_modelo_equipo,
                        text:m.modelo
                }})
                },
                
            ]

    })


})










//TODO POST UPDATE EQUIPOS
routeAdmin.post("/equipos/equipo/edit/:id",isAuthLogin(1), bodyValidateEquipos, validateExpressErrors("/admin/equipos"), async (req,res)=>{
     
const idEquipo=parseInt(req.params.id)

const {tipo_equipo, serie, inventario,estado_equipo, area, observaciones}= req.body

//?normalize array multiple and new const item
 const consumibles = Array.isArray(req.body["consumible[]"]) ? req.body["consumible[]"] : [req.body["consumible[]"]]

 const newEquipo={
    tipo_equipo:parseInt(tipo_equipo),
    serie,
    inventario,
    estado_equipo:estado_equipo.toUpperCase(),
    observaciones,
    area:parseInt(area),
    user:parseInt(req.user.id_user)
 }

 console.log(newEquipo)
//?logic 

const [idEquiposAll]=await pool.query("select id_equipo from equipos")

const idEquiposNumbers= idEquiposAll.map(e=> e.id_equipo)

const [equipoFind]= await pool.query("select id_equipo, inventario from equipos where inventario= ? and id_equipo!= ?", [inventario, idEquipo])

if(!idEquiposNumbers.includes(idEquipo)){
    
   return res.status(400).json({
        ok:false,
        message:"El equipo que intenta editar, no existe",
        redirect:"/admin/equipos"
    })
}


if(equipoFind.length > 0){
    
    return res.status(400).json({
         ok:false,
         message:`El equipo ${inventario} ya existe para actualizar`,
         redirect:"/admin/equipos"
    })
}

const [equipoUpdate]= await pool.query("update equipos set ? where id_equipo=?",[newEquipo,idEquipo])

if (equipoUpdate.affectedRows > 0){
    
    const valuesConsumibles= consumibles.map(c => [idEquipo, parseInt(c) ])

    console.log(valuesConsumibles)

    const [deleteOldConsumible]= await pool.query("delete from consumible_equipos where id_equipo= ?", [idEquipo])

    const [addConsumiblesUpdate]= await pool.query("insert into consumible_equipos (id_equipo, id_consumible) values ? ", [valuesConsumibles])

    if (addConsumiblesUpdate.affectedRows > 0){

         return res.status(200).json({
            ok:true,
            message:`Se ha editado el equipo ${inventario}`,
            redirect:"/admin/equipos"
        })

    }else{
        
        return res.status(400).json({
            ok:false,
            message: "Hubo un error al actualizar los consumibles",
            redirect:"/admin/equipos"
        })


    }

}else{
    
    return res.status(400).json({
        ok:false,
        message: `Error al editar el equipo ${inventario}`,
        redirect:"/admin/equipos"
    })


}


})




//TODO POST UPDATE MARCAS

routeAdmin.post("/equipos/marcas/edit/:id",isAuthLogin(1), bodyValidateMarcasEquipos, validateExpressErrors("/admin/equipos"), async (req,res)=>{
     
const idMarca=parseInt(req.params.id)

const {marca_equipo}= req.body

const [idMarcasAll]=await pool.query("select id_marca_equipo from marca_equipos")

const idMarcasNumbers= idMarcasAll.map(m=> m.id_marca_equipo)

const [marcaFind]= await pool.query("select id_marca_equipo,marca_equipo from marca_equipos where marca_equipo= ?", [marca_equipo])

if(!idMarcasNumbers.includes(idMarca)){
    
   return res.status(400).json({
        ok:false,
        message:"la marca que intenta editar, no existe",
        redirect:"/admin/equipos"
    })
}


if(marcaFind.length > 0){
    
    return res.status(400).json({
         ok:false,
         message:`La marca ${marca_equipo} ya existe para actualizar`,
         redirect:"/admin/equipos"
    })
}

const [marcaUpdate]= await pool.query("update marca_equipos set marca_equipo= ? where id_marca_equipo=?",[marca_equipo,idMarca])

if (marcaUpdate.affectedRows > 0){
    
    return res.status(200).json({
        ok:true,
        message:`Se ha editado la nueva marca ${marca_equipo}`,
        redirect:"/admin/equipos"
    })


}else{
    
    return res.status(400).json({
        ok:false,
        message: `Error al editar la marca ${marca_equipo}`,
        redirect:"/admin/equipos"
    })


}


})




//todo POST UPDATE MODELOS

routeAdmin.post("/equipos/modelos/edit/:id", isAuthLogin(1),bodyValidateModelosEquipos,validateExpressErrors("/admin/equipos"), async (req, res)=>{

const idEquipo=parseInt(req.params.id)

const {modelo, marca_equipo}= req.body

const [idModelosAll]=await pool.query("select id_modelo_equipo from modelo_equipos")

const idModelosNumbers= idModelosAll.map(m=> m.id_modelo_equipo)

const [modeloFind]= await pool.query("select id_modelo_equipo from modelo_equipos where modelo= ? and id_modelo_equipo != ?", [modelo,idEquipo])

if(!idModelosNumbers.includes(idEquipo)){
    
   return res.status(400).json({
        ok:false,
        message:"El modelo que intenta editar, no existe",
        redirect:"/admin/equipos"
    })
}


if(modeloFind.length > 0){
    
    return res.status(400).json({
         ok:false,
         message:`El modelo o marca del equipo ya existe para actualizar`,
         redirect:"/admin/equipos"
    })
}

const [modeloUpdate]= await pool.query("update modelo_equipos set modelo= ?, marca_equipo=? where id_modelo_equipo=?",[modelo, marca_equipo, idEquipo])

if (modeloUpdate.affectedRows > 0){
    
    return res.status(200).json({
        ok:true,
        message:`Se ha editado el modelo de equipo ${modelo}`,
        redirect:"/admin/equipos"
    })


}else{
    
    return res.status(400).json({
        ok:false,
        message: `Error al editar el modelo ${modelo_equipo}`,
        redirect:"/admin/equipos"
    })


}



    
})






//TODO UPDATE TIPOS DE EQUIPOS


routeAdmin.post("/equipos/tipos/edit/:id", isAuthLogin(1), bodyValidateTiposEquipos, validateExpressErrors("/admin/equipos"), async (req,res)=>{
     
const idTipo=parseInt(req.params.id)

const {tipo_de_equipo, modelo_equipo}= req.body

const [idTiposAll]=await pool.query("select id_tipo_equipo from tipo_equipos")

const idTiposNumbers= idTiposAll.map(m=> m.id_tipo_equipo)

const [tipoFind]= await pool.query("select id_tipo_equipo from tipo_equipos where modelo_equipo= ? and id_tipo_equipo != ?", [modelo_equipo,idTipo])

if(!idTiposNumbers.includes(idTipo)){
    
   return res.status(400).json({
        ok:false,
        message:"El Tipo de equipo que intenta editar, no existe",
        redirect:"/admin/equipos"
    })
}


if(tipoFind.length > 0){
    
    return res.status(400).json({
         ok:false,
         message:`El  modelo del equipo ya existe para actualizar`,
         redirect:"/admin/equipos"
    })
}

const [tipoUpdate]= await pool.query("update tipo_equipos set tipo_de_equipo= ?, modelo_equipo=? where id_tipo_equipo=?",[tipo_de_equipo, modelo_equipo, idTipo])

if (tipoUpdate.affectedRows > 0){
    
    return res.status(200).json({
        ok:true,
        message:`Se ha editado el tipo de equipo ${modelo_equipo}`,
        redirect:"/admin/equipos"
    })


}else{
    
    return res.status(400).json({
        ok:false,
        message: `Error al editar el tipo de equipo ${modelo_equipo}`,
        redirect:"/admin/equipos"
    })


}


})










//TODO GET DELETE EQUIPOS


routeAdmin.get("/equipos/equipos/delete/:id", isAuthLogin(1), async (req,res, next)=>{



const id= parseInt(req.params.id)


const [idEquipos]= await pool.query("select id_equipo from equipos")


})



//TODO DELETE GET TIPOS DE EQUIPOS
routeAdmin.get("/equipos/tipos/delete/:id", isAuthLogin(1), async (req, res)=>{
    
    const id= parseInt(req.params.id)

    const [idTipos]= await pool.query("select id_tipo_equipo from tipo_equipos")

    const idNumbers= idTipos.map(tipo => tipo.id_tipo_equipo)

    const [[totalTiposAffected]]= await pool.query("select count(*) as totalIdTipos, (select count(*) from equipos where tipo_equipo= ?) as totalTiposEquipos from tipo_equipos where id_tipo_equipo= ?", [id,id])


    if(!idNumbers.includes(id)){
        return res.redirect("/admin/equipos")
    
    } 
    
    return res.status(200).json({
        ok:true,
        dataTotals: [
            {label: "Total tipo de Equipos: ", value:  totalTiposAffected.totalIdTipos},
            {label: "Total Equipos: ", value: totalTiposAffected.totalTiposEquipos}
        
    ]
    })



})




//TODO DELETE GET MODELOS DE EQUIPOS
routeAdmin.get("/equipos/modelos/delete/:id", isAuthLogin(1), async (req, res)=>{
    
    const id= parseInt(req.params.id)

    const [idModelos]= await pool.query("select id_modelo_equipo from modelo_equipos")

    const idNumbers= idModelos.map(m => m.id_modelo_equipo)

    const [[totalModelosAffected]]= await pool.query("select count(*) as totalIdModelos, (select count(*) from tipo_equipos where modelo_equipo= ?) as totalModeloEquipos from modelo_equipos where id_modelo_equipo= ?", [id,id])


    if(!idNumbers.includes(id)){
        return res.redirect("/admin/equipos")
    
    } 
    
    return res.status(200).json({
        ok:true,
        dataTotals: [
            {label: "Total Modelos: ", value:  totalModelosAffected.totalIdModelos},
            {label: "Total Modelos de Equipos: ", value: totalModelosAffected.totalModeloEquipos}
        
    ]
    })



})


//TODO GET DELETE MARCAS


routeAdmin.get("/equipos/marcas/delete/:id", isAuthLogin(1), async (req, res)=>{
    
    const id= parseInt(req.params.id)

    const [idMarcas]= await pool.query("select id_marca_equipo from marca_equipos")

    const idNumbers= idMarcas.map(m => m.id_marca_equipo)

    const [[totalModelosAffected]]= await pool.query("select count(*) as totalIdMarcas, (select count(*) from modelo_equipos where marca_equipo= ?) as totalModelosEquipos from marca_equipos where id_marca_equipo= ?", [id,id])


    if(!idNumbers.includes(id)){
        return res.redirect("/admin/equipos")
    
    } 
    
    return res.status(200).json({
        ok:true,
        dataTotals: [
            {label: "Total Modelos: ", value:  totalModelosAffected.totalIdMarcas},
            {label: "Total Modelos de Equipos: ", value: totalModelosAffected.totalModelosEquipos}
        
    ]
    })



})


















//! CONSUMIBLES


//TODO GET CONSUMIBLES
routeAdmin.get("/consumibles", isAuthLogin(1), async (req, res)=>{
    
//? TIPO CONSUMIBLES

 const tipoconsumible= req.query.tipoConsumible

 const ordertipoConsumible= req.query.orderTipoConsumible

 let tiposConsumiblesAll= []

 const [tiposConsumibles] = await pool.query("select id_tipo_consumibles, tipo_consumible from tipo_consumibles")

 const [consumibleSearch]= await pool.query("select id_tipo_consumibles, tipo_consumible from tipo_consumibles where tipo_consumible= ?", [tipoconsumible])

 const [consumiblesOrder]= await pool.query("select id_tipo_consumibles, tipo_consumible from tipo_consumibles order by tipo_consumible desc")

 tiposConsumiblesAll= tiposConsumibles
 
if(tipoconsumible && tipoconsumible.length > 0) tiposConsumiblesAll= consumibleSearch

if(ordertipoConsumible && ordertipoConsumible.length > 0) tiposConsumiblesAll= consumiblesOrder



//?  MARCAS CONSUMIBLES

const marcaConsumible= req.query.marca

const orderMarca= req.query.orderMarcaConsumible

let marcasConsumiblesAll= []

const [marcasConsumibles]= await pool.query("select id_marca_consumible, marca_consumible from marca_consumibles")

const [marcaConsumibleSearch]= await pool.query("select id_marca_consumible, marca_consumible from marca_consumibles where marca_consumible= ?", [marcaConsumible])

const [marcasConsumiblesOrder]= await pool.query("select id_marca_consumible, marca_consumible from marca_consumibles order by marca_consumible desc")


marcasConsumiblesAll= marcasConsumibles

if(marcaConsumible && marcaConsumible.length > 0 ) marcasConsumiblesAll= marcaConsumibleSearch

if(orderMarca && orderMarca.length > 0) marcasConsumiblesAll= marcasConsumiblesOrder




//? CONSUMIBLES


const consumibleQuery= req.query.consumible

const orderConsumible= req.query.orderConsumible

let consumiblesAll= []

const [consumibles]= await pool.query("select c.id_consumible,t.tipo_consumible, m.marca_consumible, c.consumible from consumibles c inner join marca_consumibles m on m.id_marca_consumible= c.marca_consumible inner join tipo_consumibles t on t.id_tipo_consumibles= c.tipo_consumible")

const [consumibleSearchQuery]= await pool.query("select c.id_consumible,t.tipo_consumible, m.marca_consumible, c.consumible from consumibles c inner join marca_consumibles m on m.id_marca_consumible= c.marca_consumible inner join tipo_consumibles t on t.id_tipo_consumibles= c.tipo_consumible where c.consumible= ?", [consumibleQuery])

const [consumibleOrder]= await pool.query("select c.id_consumible,t.tipo_consumible, m.marca_consumible, c.consumible from consumibles c inner join marca_consumibles m on m.id_marca_consumible= c.marca_consumible inner join tipo_consumibles t on t.id_tipo_consumibles= c.tipo_consumible order by c.consumible desc")


consumiblesAll= consumibles

if(consumibleQuery && consumibleQuery.length > 0 ) consumiblesAll= consumibleSearchQuery

if(orderConsumible && orderConsumible.length > 0) consumiblesAll= consumibleOrder




res.render("admin/consumibles.pug",{
        //?NAV
        titles:"CONSUMIBLES",
        description:"CONSUMIBLES DE LA CEAS",
        style:"/CSS/consumibles.css",
        Script:"/JS/consumibles/consumibles.js",
        navItems:[ //? icons nav render role
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }], 
            //?containerData Tipo Consumible
             containerData:{ 
                title: "TIPO DE CONSUMIBLE",
                idField: "id_tipo_consumibles",
                headTitles:["Tipo de Consumible"],
                hrefRute:"/admin/consumibles/tipo/edit",
                hrefRuteDelete:"/admin/consumibles/tipo/delete",
                optionsBtn: [{
                    Title:"Agregar",
                    contentText:"Agregar Tipo",
                    href:"#",
                    classIcon:"fas fa-plus-circle",
                    classActiveForm: "tipoConsumibleBtn" //?btn class
                    
                },{
                    Title:"Ordenar",
                    contentText:"Ordernar Z-A",
                    href:"/admin/consumibles?orderTipoConsumible=true",
                    classIcon:"fas fa-sort-alpha-up"
                }],
                itemsData: tiposConsumiblesAll
            } ,
            dataListSearch:{ //? DATA SEARCH MARCAS
                action:"/admin/consumibles",
                method:"GET",
                name:"tipoConsumible", //?req.query
                id:"consumibleList",
                placeholderSearch:"Buscar por Tipo de Consumible...",
                submit:"Buscar"
            },
            optionsDataSearch:tiposConsumiblesAll.map(e=> e.tipo_consumible),    
            //? FORM ADD TIPO CONSUMIBLE
            formShowAdd:{
                idForm: "formAddTipoConsumible",
                title:"TIPO DE CONSUMIBLE",
                selected: [],
                valueSubmit:"AGREGAR TIPO"
            },
            formShowInputs:[{
                id:"tipo_de_equipo",
                classIcon:"fas fa-pencil-alt",
                type:"text",
                placeholder:"Escribe el Tipo del Consumible",
                name:"tipo_consumible",
            }], 
            classTarget:"tipoConsumibleFormShow", 
            classClose:"tipoConsumibleCloseBtn",
            
            
            
            //?containerData Marca Consumible
            containerData2:{ 
                title: "MARCA DE CONSUMIBLE",
                idField: "id_marca_consumible",
                hrefRute:"/admin/consumibles/marca/edit",
                hrefRuteDelete:"/admin/consumibles/marca/delete",
                headTitles:["Marca de Consumible"],
                optionsBtn: [{
                    Title:"Agregar",
                    contentText:"Agregar Marca",
                    href:"#",
                    classIcon:"fas fa-plus-circle",
                    classActiveForm: "marcaConsumibleBtn" //?btn class
                    
                },{
                    Title:"Ordenar",
                    contentText:"Ordernar Z-A",
                    href:"/admin/consumibles?orderMarcaConsumible=true",
                    classIcon:"fas fa-sort-alpha-up"
                }],
                itemsData: marcasConsumiblesAll
            } ,
            dataListSearch2:{ //? DATA SEARCH MARCAS
                action:"/admin/consumibles",
                method:"GET",
                name:"marca", //?req.query
                id:"marcaList",
                placeholderSearch:"Buscar por Marca de Consumible...",
                submit:"Buscar"
            },
            optionsDataSearch2:marcasConsumiblesAll.map(e=> e.marca_consumible),    
            //? FORM ADD 
            formShowAdd2:{
                idForm: "formAddMarcaConsumible",
                title:"MARCA DE CONSUMIBLE",
                selected: [],
                valueSubmit:"AGREGAR MARCA"
            },
            formShowInputs2:[{
                id:"tipo_de_equipo",
                classIcon:"fas fa-pencil-alt",
                type:"text",
                placeholder:"Escribe la Marca del Consumible",
                name:"marca_consumible",
            }], 
            classTarget2:"marcaConsumibleFormShow", 
            classClose2:"marcaConsumibleCloseBtn",
            
            
            
            //?containerData consumibles ALL  Consumible
            containerData3:{ 
                title: "CONSUMIBLES",
                idField: "id_consumible",
                headTitles:["Tipo de Consumible", "Marca de Consumible", "Consumible"],
                hrefRute:"/admin/consumibles/consumible/edit",
                hrefRuteDelete:"/admin/consumibles/consumible/delete",
                optionsBtn: [{
                    Title:"Agregar",
                    contentText:"Agregar",
                    href:"#",
                    classIcon:"fas fa-plus-circle",
                    classActiveForm: "ConsumibleBtn" //?btn class

                },{
                    Title:"Ordenar",
                    contentText:"Ordernar Z-A",
                    href:"/admin/consumibles?orderConsumible=true",
                    classIcon:"fas fa-sort-alpha-up"
                }],
                itemsData: consumiblesAll
            } ,
            dataListSearch3:{ //? DATA SEARCH MARCAS
            action:"/admin/consumibles",
            method:"GET",
            name:"consumible", //?req.query
            id:"consumibleList",
            placeholderSearch:"Buscar por Consumible...",
            submit:"Buscar"
        },
        optionsDataSearch3:consumiblesAll.map(e=> e.consumible),    
        //? FORM ADD 
          formShowAdd3:{
            idForm: "formAddConsumible",
            title:"CONSUMIBLE",
            selected: [{
                    id:"marcaSelect",
                    class__icon:"fas fa-pencil-alt",
                    name:"marca_consumible",
                    defaultOption:"Seleccione una Marca",
                    options:marcasConsumiblesAll.map(d => { return {
                        value:d.id_marca_consumible,
                        valueText: d.marca_consumible
                    }})
                },
            {
                    id:"tipoSelect",
                    class__icon:"fas fa-tint",
                    name:"tipo_consumible",
                    defaultOption:"Seleccione un tipo de Equipo",
                    options:tiposConsumiblesAll.map(d => { return {
                        value:d.id_tipo_consumibles,
                        valueText: d.tipo_consumible
                    }})
                }],
            valueSubmit:"AGREGAR CONSUMIBLE"
        },
        formShowInputs3:[{
                id:"consumibleModel",
                classIcon:"fas fa-pencil-alt",
                type:"text",
                placeholder:"Escribe el Modelo de Consumible",
                name:"consumible",
        }], 
         classTarget3:"ConsumibleFormShow", 
         classClose3:"ConsumibleCloseBtn",




})


})








//todo POST CONSUMIBLE 

routeAdmin.post("/consumibles/consumible",isAuthLogin(1),bodyValidateConsumible, validateExpressErrors("/admin/consumibles"), async (req,res)=>{
    

    const {tipo_consumible, marca_consumible,consumible}= req.body

    const parseTipo= parseInt(tipo_consumible)
    
    const parseMarca= parseInt(marca_consumible)


    const [consumibleSearch]= await pool.query("select id_consumible, tipo_consumible, marca_consumible, consumible from consumibles where consumible = ?", [consumible.toUpperCase()])


    if(consumibleSearch.length > 0){
        
        return res.status(400).json({
            ok:false,
            message:`Ya existe el consumible ${consumible}`,   
            redirect:"/admin/consumibles"
        })
    }


    const [addConsumible]=  await pool.query("insert into consumibles SET ?", [{tipo_consumible:parseTipo, marca_consumible:parseMarca, consumible:consumible.toUpperCase()}])

    if(addConsumible.affectedRows > 0){
        
        return res.status(200).json({
            ok:true, 
            message:`El consumible ${consumible} se ha agregado correctamente`,
            redirect:"/admin/consumibles"
        })

    }else{
        return res.status(400).json({
            ok:false,
            message: `Hubo un error al agregar ${consumible}`,
            redirect:"/admin/consumuibles"
        })

    }

})









//todoo POST TIPO CONSUMIBLE

routeAdmin.post("/consumibles/tipos",isAuthLogin(1),bodyValidateTiposConsumuibles, validateExpressErrors("/admin/consumibles"), async (req,res)=>{
    

    const {tipo_consumible}= req.body

    const [tipoSearch]= await pool.query("select id_tipo_consumibles, tipo_consumible from tipo_consumibles where tipo_consumible = ?", [tipo_consumible.toUpperCase()])


    if(tipoSearch.length > 0){
        
        return res.status(400).json({
            ok:false,
            message:`Ya existe el tipo ${tipo_consumible} de Consumible`,   
            redirect:"/admin/consumibles"
        })
    }


    const [addTipoConsumible]=  await pool.query("insert into tipo_consumibles SET ?", [{tipo_consumible:tipo_consumible.toUpperCase()}])

    if(addTipoConsumible.affectedRows > 0){
        
        return res.status(200).json({
            ok:true, 
            message:`El tipo ${tipo_consumible} se ha agregado correctamente`,
            redirect:"/admin/consumibles"
        })

    }else{
        return res.status(400).json({
            ok:false,
            message: `Hubo un error al agregar ${tipo_consumible}`,
            redirect:"/admin/consumuibles"
        })

    }

})





//todo POST MARCA CONSUMIBLE

routeAdmin.post("/consumibles/marca",isAuthLogin(1),bodyValidateMarcasConsumibles, validateExpressErrors("/admin/consumibles"), async (req,res)=>{
    

    const {marca_consumible}= req.body

    const [marcaSearch]= await pool.query("select id_marca_consumible, marca_consumible from marca_consumibles where marca_consumible = ?", [marca_consumible.toUpperCase()])


    if(marcaSearch.length > 0){
        
        return res.status(400).json({
            ok:false,
            message:`Ya existe la Marca ${marca_consumible} de Consumible`,
            redirect:"/admin/consumibles"
        })
    }


    const [addTipoConsumible]=  await pool.query("insert into marca_consumibles SET ?", [{marca_consumible:marca_consumible.toUpperCase()}])

    if(addTipoConsumible.affectedRows > 0){
        
        return res.status(200).json({
            ok:true, 
            message:`La marca ${marca_consumible} se ha agregado correctamente`,
            redirect:"/admin/consumibles"
        })

    }else{
        return res.status(400).json({
            ok:false,
            message: `Hubo un error al agregar ${marca_consumible}`,
            redirect:"/admin/consumuibles"
        })

    }

})







//TODO GET EDIT CONSUMIBLE

routeAdmin.get("/consumibles/consumible/edit/:id",isAuthLogin(1), async (req,res)=>{

const id= parseInt(req.params.id)

const [idConsumibles]= await pool.query("select id_consumible from consumibles")

const numbers= idConsumibles.map(c => c.id_consumible)

if(!numbers.includes(id)){
    
    return res.status(400).json({
        ok:false,
        message:"El consumible no existe",
        redirect:"/admin/consumibles"
    })
    
    
}


const [marcaConsumibles]= await pool.query("select id_marca_consumible, marca_consumible from marca_consumibles")

const [tiposConsumibles]= await pool.query("select id_tipo_consumibles, tipo_consumible from tipo_consumibles")

const [consumibleSearch]= await pool.query("select c.id_consumible, t.tipo_consumible, m.marca_consumible, c.consumible from consumibles c inner join tipo_consumibles t on t.id_tipo_consumibles = c.tipo_consumible inner join marca_consumibles m on m.id_marca_consumible = c.marca_consumible where c.id_consumible= ?",[id])


res.render("Edits/edits.pug",{
        titles:"CONSUMIBLES",
        description:"CONSUMIBLES DE LA CEAS",
        style:"/CSS/edits.css",
        Script:"/JS/edits/editsConsumible.js",
        navItems:[ //? icons nav render role
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
                
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
            valueBtn:"EDITAR",
            titleForm:"EDITAR CONSUMIBLE ",
            formId:"editConsumible",
            titleHeadForm:"CONSUMIBLES",
            idEdit:id,
            inputs:[
                  {
                    type:"text",
                    placeholder:"Consumible...",
                    name:"consumible",
                    id:"consumibleEdit",
                    labelTitle:"Consumible:",
                    value:consumibleSearch[0].consumible
                },{
                    type:"select",
                    name:"marca_consumible",
                    id:"marcaEdit",
                    labelTitle:"Marca Consumible:",
                    value:consumibleSearch[0].marca_consumible,
                    options: marcaConsumibles.map(m=> { return {
                        value:m.id_marca_consumible,
                        text:m.marca_consumible
                }})
                },{
                    type:"select",
                    name:"tipo_consumible",
                    id:"tipoEdit",
                    labelTitle:"Tipo Consumible:",
                    value:consumibleSearch[0].tipo_consumible,
                    options: tiposConsumibles.map(t=> { return {
                        value:t.id_tipo_consumibles,
                        text:t.tipo_consumible
                }})
                },
                
            ]

    })


})







//TODO GET EDIT TIPO CONSUMIBLE

routeAdmin.get("/consumibles/tipo/edit/:id",isAuthLogin(1), async (req,res)=>{

const id= parseInt(req.params.id)

const [idTipos]= await pool.query("select id_tipo_consumibles from tipo_consumibles")

const numbers= idTipos.map(t => t.id_tipo_consumibles)

if(!numbers.includes(id)){
    
    return res.status(400).json({
        ok:false,
        message:"El tipo de consumible no existe",
        redirect:"/admin/consumibles"
    })
    
    
}

const [tipoSearch]= await pool.query("select id_tipo_consumibles, tipo_consumible from tipo_consumibles where id_tipo_consumibles= ?",[id])


res.render("Edits/edits.pug",{
        titles:"CONSUMIBLES",
        description:"CONSUMIBLES DE LA CEAS",
        style:"/CSS/edits.css",
        Script:"/JS/edits/editTipoConsumible.js",
        navItems:[ //? icons nav render role
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
                
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
            valueBtn:"EDITAR",
            titleForm:"EDITAR TIPO DE CONSUMIBLE ",
            formId:"editTipoConsumible",
            titleHeadForm:"CONSUMIBLES",
            idEdit:id,
            inputs:[
                {
                    type:"text",
                    placeholder:"Tipo de Consumible...",
                    name:"tipo_consumible",
                    id:"tipoedit",
                    labelTitle:"Tipo de Consumible:",
                    value:tipoSearch[0].tipo_consumible
                }
                
            ]

    })


})




//TODO EDIT MARCA CONSUMIBLE

routeAdmin.get("/consumibles/marca/edit/:id", isAuthLogin(1), async (req, res)=>{

const id= parseInt(req.params.id)

const [idMarcas]= await pool.query("select id_marca_consumible from marca_consumibles")

const numbers= idMarcas.map(t => t.id_marca_consumible)

if(!numbers.includes(id)){
    
    return res.status(400).json({
        ok:false,
        message:"La Marca de consumible no existe",
        redirect:"/admin/consumibles"
    })
    
    
}

const [marcaSearch]= await pool.query("select id_marca_consumible, marca_consumible from marca_consumibles where id_marca_consumible= ?",[id])


res.render("Edits/edits.pug",{
        titles:"CONSUMIBLES",
        description:"CONSUMIBLES DE LA CEAS",
        style:"/CSS/edits.css",
        Script:"/JS/edits/editsMarcaConsumible.js",
        navItems:[ //? icons nav render role
             {
                class_icon: "fas fa-users",
                spanTitle:"Usuarios",
                hrefNav:"/admin/users",
                
             },{
                class_icon:"fas fa-address-book",
                spanTitle:"Areas",
                hrefNav:"/admin/areas",
             },
            {
                class_icon:"fas fa-tv",
                spanTitle:"Equipos",
                hrefNav:"/admin/equipos",
                
            },{
                class_icon:"fas fa-tint",
                spanTitle:"Consumibles",
                hrefNav:"/admin/consumibles",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/logOut",
            }],  
            valueBtn:"EDITAR",
            titleForm:"EDITAR MARCA DE CONSUMIBLE ",
            formId:"editMarcaConsumible",
            titleHeadForm:"CONSUMIBLES",
            idEdit:id,
            inputs:[
                {
                    type:"text",
                    placeholder:"Marca de Consumible...",
                    name:"marca_consumible",
                    id:"marcaedit",
                    labelTitle:"Marca de Consumible:",
                    value:marcaSearch[0].marca_consumible
                }
                
            ]

    })




})









//TODO UPDATE CONSUMIBLE

routeAdmin.post("/consumibles/consumible/edit/:id", isAuthLogin(1), bodyValidateConsumible, async (req, res)=>{


const id= parseInt(req.params.id)

const {consumible, tipo_consumible, marca_consumible}= req.body

const parseTipo= parseInt(tipo_consumible)

const parseMarca= parseInt(marca_consumible)

const [idConsumibles]= await pool.query("select id_consumible from consumibles")

const numbers= idConsumibles.map(c => c.id_consumible)

if(!numbers.includes(id)){
    
    return res.status(400).json({
        ok:false,
        message:"El consumible no existe",
        redirect:"/admin/consumibles"
    })
    
    
}

const [consumibleSearch]= await pool.query("select id_consumible, tipo_consumible, marca_consumible, consumible from consumibles where consumible= ? and id_consumible!= ?",[consumible.toUpperCase(),id])


if (consumibleSearch.length > 0 ){
    
    return  res.status(400).json({
        ok:false,
        message:`El consumible ${consumible} ya existe`,
        redirect:"/admin/consumibles"
    })
}


const [updateConsumible]= await pool.query("update consumibles set ? where id_consumible= ?", [{tipo_consumible: parseTipo, marca_consumible: parseMarca, consumible: consumible.toUpperCase()}, id])


if (updateConsumible.affectedRows > 0){
    
    return res.status(200).json({
        ok:true,
        message: `Se ha actualizado el consumible ${consumible}`,
        redirect: "/admin/consumibles"
    })

}else{
    return res.status(400).json({
        ok:false,
        message:`Hubo un error al actualizar el consumible${tconsumible}`,
        redirect: "/admin/consumibles"
    })
}


})








//TODO UPDATE TIPO DE CONSUMIBLES

routeAdmin.post("/consumibles/tipo/edit/:id", isAuthLogin(1), bodyValidateTiposConsumuibles, async (req, res)=>{


const id= parseInt(req.params.id)

const {tipo_consumible}= req.body

const [idTipos]= await pool.query("select id_tipo_consumibles from tipo_consumibles")

const numbers= idTipos.map(t => t.id_tipo_consumibles)

if(!numbers.includes(id)){
    
    return res.status(400).json({
        ok:false,
        message:"El tipo de consumible no existe",
        redirect:"/admin/consumibles"
    })
    
    
}

const [tipoSearch]= await pool.query("select id_tipo_consumibles, tipo_consumible from tipo_consumibles where tipo_consumible= ? and id_tipo_consumibles!= ?",[tipo_consumible.toUpperCase(),id])


if (tipoSearch.length > 0 ){
    
    return  res.status(400).json({
        ok:false,
        message:`El tipo de consumible ${tipo_consumible} ya existe`,
        redirect:"/admin/consumibles"
    })
}


const [updateTipo]= await pool.query("update tipo_consumibles set ? where id_tipo_consumibles= ?", [{tipo_consumible:tipo_consumible.toUpperCase()}, id])


if (updateTipo.affectedRows > 0){
    
    return res.status(200).json({
        ok:true,
        message: `Se ha actualizado el tipo de consumible ${tipo_consumible}`,
        redirect: "/admin/consumibles"
    })

}else{
    return res.status(400).json({
        ok:false,
        message:`Hubo un error al actualizado el tipo ${tipo_consumible}`,
        redirect: "/admin/consumibles"
    })
}


})






//TODO UPDATE MARCA CONSUMIBLE

routeAdmin.post("/consumibles/marca/edit/:id", isAuthLogin(1), bodyValidateMarcasConsumibles, async (req,res)=>{

const id= parseInt(req.params.id)

const {marca_consumible}= req.body

const [idMarcas]= await pool.query("select id_marca_consumible from marca_consumibles")

const numbers= idMarcas.map(t => t.id_marca_consumible)

if(!numbers.includes(id)){
    
    return res.status(400).json({
        ok:false,
        message:"La marca de consumible no existe",
        redirect:"/admin/consumibles"
    })
    
    
}

const [marcaSearch]= await pool.query("select id_marca_consumible, marca_consumible from marca_consumibles where marca_consumible= ? and id_marca_consumible!= ?",[marca_consumible.toUpperCase(),id])


if (marcaSearch.length > 0 ){
    
    return  res.status(400).json({
        ok:false,
        message:`La marca de consumible ${marca_consumible} ya existe`,
        redirect:"/admin/consumibles"
    })
}


const [updateTipo]= await pool.query("update marca_consumibles set ? where id_marca_consumible= ?", [{marca_consumible:marca_consumible.toUpperCase()}, id])


if (updateTipo.affectedRows > 0){
    
    return res.status(200).json({
        ok:true,
        message: `Se ha actualizado la marca de consumible ${marca_consumible}`,
        redirect: "/admin/consumibles"
    })

}else{
    return res.status(400).json({
        ok:false,
        message:`Hubo un error al actualizar la marca ${marca_consumible}`,
        redirect: "/admin/consumibles"
    })
}


})

















//TODO GET DELETE TIPO CONSUMIBLE

routeAdmin.get("/consumibles/tipo/delete/:id", isAuthLogin(1), async (req, res)=>{
    
    const id= parseInt(req.params.id)

    const [idTiposConsumibles]= await pool.query("select id_tipo_consumibles from tipo_consumibles")

    const idNumbers= idTiposConsumibles.map(tipo => tipo.id_tipo_consumibles)

    const [[totalTiposAffected]]= await pool.query("select count(*) as totalIdTipos, (select count(*) from consumibles where tipo_consumible= ?) as totalTiposConsumibles from tipo_consumibles where id_tipo_consumibles= ?", [id,id])


    if(!idNumbers.includes(id)){
        return res.redirect("/admin/equipos")
    
    } 
    
    return res.status(200).json({
        ok:true,
        dataTotals: [
            {label: "Total tipos: ", value:  totalTiposAffected.totalIdTipos},
            {label: "Total tipos de Consumible: ", value: totalTiposAffected.totalTiposConsumibles}
        
    ]
    })



})









export default routeAdmin