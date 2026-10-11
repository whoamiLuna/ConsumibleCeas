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
import variablesHelpers from "../Helpers/varHelpers.js";
import validateConsumiblesActive from "../Helpers/validateConsumiblesActive.js";
import validateTipoEquipoActive from "../Helpers/validateEquiposActive.js";

const routeAdmin= Router()


//TODO CONSTANTE TIPOS DE EQUIPOS FOR ALL
const tiposEquiposManual=[{
                    value:"IMPRESORA",valueText:"IMPRESORA"},
                    {value:"MULTIFUNCIONAL", valueText:"MULTIFUNCIONAL"},
                    {value:"CPU", valueText:"CPU"},
                    {value:"ALL IN ONE", valueText:"ALL IN ONE"},
                    {value:"LAPTOP", valueText:"LAPTOP"},
                    {value:"PLOTTER", valueText:"PLOTTER"},
                    {value:"MONITOR", valueText:"MONITOR"},
                    {value:"REGULADOR",valueText:"REGULADOR"},
                    {value:"NO-BREAK", valueText:"NO-BREAK"},
                    {value:"TELEFONO", valueText:"TELEFONO"}]

//todo redirect main route 
routeAdmin.get("/",isAuthLogin(1),(req,res)=>{
    
res.redirect("/admin/users")
    
})


//todo principal route pagination

routeAdmin.get("/users", isAuthLogin(1),async (req, res)=>{
    
    let page= parseInt(req.query.page || 1)
    const userSearch= req.query.user
    const limit= 10 //?rango de busqueda
    const offset= (page -1) * limit //?donde empiza la busqueda (ignora desde y traeme los siguientes)
    
    const [usersFullSearch]= await pool.query("select u.id_user, u.fullname from users u where u.fullname != 'Administrador'") || "No hay usuarios disponibles"

    let usersAll= []
    let totalUsers=0

    if(userSearch){ 
     
        const [searchUsers]= await pool.query(`select u.username, u.fullname, u.estado, r.role from users u inner join roles r on r.id_role = u.role where r.role != "Admin" and u.fullname = ?`,[userSearch])
        
        const [[{total_users:count}]]= await pool.query(`select count(*) as total_users from users u where u.fullname like ? `,[`%${userSearch}$`])


        usersAll= searchUsers
        totalUsers= count
    }else{
        
        const [[{total_users:count}]]= await pool.query("select count(*) as total_users from users u inner join roles r on u.role = r.id_role where r.role !='Admin' ")
        
        const [users] = await pool.query("select u.id_user, u.username, u.fullname, u.estado, r.role from users u inner join roles r on u.role = r.id_role where r.role != 'Admin' limit ? offset ? ",[limit,offset])
        
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
            {key:"estado", valueHeadText:"Estado",
            cellClass: (value)=> value==="ACTIVO" ? "ACTIVO" : "" || value==="INACTIVO" ? "INACTIVO" : ""},
        ],
        actions:[
           {
            type:"edit",
            icon:"far fa-edit",
            href:"/admin/users/edit/"
           },],
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
                    
             },{
                    id:"selectUserEstado",
                    name:"estado",
                    class__icon:"fas fa-user-shield",
                    defaultOption:"Selecciona un Estado",
                    options:[{ value:"ACTIVO",valueText:"ACTIVO"},{value:"INACTIVO",valueText:"INACTIVO"}]
                    
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


const [userSearch]= await pool.query("select u.id_user, u.fullname,u.username, r.role, u.estado from users u inner join roles r on id_role= u.role where id_user= ?",[id])

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
                    type:"password",
                    placeholder:"Escribe la nueva Contraseña...",
                    name:"password",
                    id:"passwordEdit",
                    labelTitle:"Contraseña:",
                
                },{
                    type:"select",
                    placeholder:"Escribe el estado del usuario...",
                    name:"estado",
                    id:"estadoEdit",
                    labelTitle:"Estado:",
                    value:userSearch[0].estado,
                    options:[{value:"ACTIVO", valueText:"Activo"},{value:"INACTIVO", valueText:"Inactivo"}]
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

const {username, fullname, role, password, estado}= req.body

const parseRole= parseInt(role)


const [idUsers]= await pool.query("select id_user from users")

const numbers= idUsers.map(u => u.id_user)

//*todo validate estado

if(!variablesHelpers.estados.includes(estado)){
    return res.status(400).json({
        ok:false,
        message:`Este ${estado} es invalido`,
        redirect:"/admin/users"
    })
}

if(!numbers.includes(id)){
    
    return res.status(400).json({
        ok:false,
        message:"El usuario no existe",
        redirect:"/admin/users"
    })
    
    
}

const [userSearch]= await pool.query("select id_user,username, fullname, role, estado from users where (username= ? or  fullname= ?) and id_user!= ?",[username,fullname,id])


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
    password: newPassword,
    estado

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

    const [direccionesDatalist]= await pool.query("select id_direccion, direccion from direcciones where estado= 'ACTIVO'")

    const [direcciones]= await pool.query("select id_direccion,direccion, estado from direcciones")

    const [orderDirecciones] = await pool.query("select id_direccion,direccion, estado from direcciones order by direccion desc")

    const [direccionSelect]= await pool.query("select id_direccion, direccion, estado from direcciones where direccion= ?",[direccionSearch])

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
    
    const [areas]= await pool.query("select a.id_area,d.direccion,a.area, a.estado from areas a inner join direcciones d on d.id_direccion= a.direccion")

    const [areaFind]= await pool.query("select a.id_area,d.direccion,a.area, a.estado from areas a inner join direcciones d on d.id_direccion= a.direccion where area= ?",[areaSearch])

    const[areasOrder]= await pool.query("select a.id_area,d.direccion,a.area, a.estado from areas a inner join direcciones d on d.id_direccion= a.direccion order by a.area asc")

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
                hrefRuteDelete:"/admin/areas/direccion/delete",
                headTitles:["Direccion", "Estado"],
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
                selected:[{
                    id:"selectUserEstado",
                    name:"estado",
                    class__icon:"fas fa-shield-alt",
                    defaultOption:"Selecciona un Estado",
                    options:[{ value:"ACTIVO",valueText:"ACTIVO"},{value:"INACTIVO",valueText:"INACTIVO"}]
                    
             }]
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
                hrefRuteDelete:"/admin/areas/area/delete",
                headTitles:["Direccion", "Area", "Estado"],
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
                    options:direccionesDatalist.map(d => { return {
                        value:d.id_direccion,
                        valueText: d.direccion
                    }}),
                }, {
                    id:"selectUserEstado",
                    name:"estado",
                    class__icon:"fas fa-shield-alt",
                    defaultOption:"Selecciona un Estado",
                    options:[{ value:"ACTIVO",valueText:"ACTIVO"},{value:"INACTIVO",valueText:"INACTIVO"}]
                    
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

    const { direccion, estado } = req.body;

    const [direccionFind]= await pool.query("select direccion from direcciones where direccion= ?",[direccion]) 

    try {
        
        if(direccionFind.length > 0){
            res.status(400).json({
                ok:false,
                message: `La direccion ${direccion} ya existe, vuleve a intentarlo`,
                redirect:"/admin/areas"
            })  
        }else{
            
        const [areaAdd] = await pool.query("INSERT INTO direcciones SET ?",{ direccion: direccion, estado });

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

    const [direccionEdit]= await pool.query("select id_direccion,direccion, estado from direcciones where id_direccion=?",[id])

    const [getDirecciones]= await pool.query("select id_direccion,direccion from direcciones")
 
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
                    

                },{
                    type:"select",
                    placeholder:"Escribe el estado del usuario...",
                    name:"estado",
                    id:"estadoEdit",
                    labelTitle:"Estado:",
                    value:direccionEdit[0].estado,
                    options:[{value:"ACTIVO", valueText:"Activo"},{value:"INACTIVO", valueText:"Inactivo"}]
                }
                
            ]




    })




})





//TODO UPDATE EDIT DIRECCION


routeAdmin.post("/areas/direccion/edit/:id",isAuthLogin(1),bodyValidateDirecciones,validateExpressErrors("/admin/areas"),async (req,res)=>{

    const {direccion, estado} = req.body
    
    const id= parseInt(req.params.id)

    const [getDirecciones]= await pool.query("select id_direccion,direccion from  direcciones")

    const idDirecciones= getDirecciones.map(d=> d.id_direccion)

    if(!idDirecciones.includes(id)){
        return res.status(400).json({
            ok:false,
            message:"Id Invalido",
            redirect:"/admin/areas"
        })

    }

    const [direccionFind]=await pool.query("select direccion from direcciones where direccion= ? and id_direccion != ?", [direccion, id])


        if(direccionFind.length === 0){
    
            try {
                const [newDireccion]= await pool.query("update direcciones set direccion= ?, estado= ? where id_direccion= ?",[direccion,estado,id])
                
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
     
    const {area,direccion, estado}=req.body

    parseInt(direccion)

    const [[areaFind]]= await pool.query("Select a.id_area,d.direccion, a.area, a.estado from areas a inner join direcciones d on d.id_direccion = a.direccion where a.area= ?",[area])

    const [[direccionValidate]]= await pool.query("select direccion, estado from direcciones where id_direccion= ?", [direccion])

    //? validate direccion estado

    if(direccionValidate.estado === "INACTIVO"){
        
        return res.status(400).json({
            ok:false,
            message: `No puedes crear un area de ${direccionValidate.direccion} por que esta inactiva`,
            redirect:"/admin/areas"
        })
    }


    if(areaFind){
        
        return res.status(400).json({
            ok:false,
            message:`El area ${area} ya existe, intente de nuevo`,
            redirect:"/admin/areas"

        })
    }

    const [newArea]= await pool.query("insert into areas set ?",{area,direccion, estado})

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

    const [[area]]= await pool.query("select a.id_area,d.direccion,a.area,a.estado from areas a inner join direcciones d on id_direccion = a.direccion where id_area= ?",[id])

    const [direcciones]= await pool.query("select id_direccion, direccion from direcciones where estado='ACTIVO'")
    
    const idAreasMap= idAreas.map(a => a.id_area)
    
    const direcionesMap=direcciones.map(d => {
        return {
            value: d.id_direccion,
            text:d.direccion
        }
    })

   

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
                },{
                    type:"select",
                    placeholder:"Escribe el estado del usuario...",
                    name:"estado",
                    id:"estadoEdit",
                    labelTitle:"Estado:",
                    value:area.estado,
                    options:[{value:"ACTIVO", valueText:"Activo"},{value:"INACTIVO", valueText:"Inactivo"}]
                }
            ]



    })

})



//TODO  update area


routeAdmin.post("/areas/areas/edit/:id", async (req,res)=>{
    
    let {area, direccion,estado}=  req.body

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

     //? estatus direccion

    const [[direccionStatus]]= await pool.query("select id_direccion, direccion,estado from direcciones where id_direccion= ?", [direccion])

    if(!direccionStatus){

        return res.status(400).json({
            ok:false,
            message: `El area ${area.area} contiene una dirección invalida`,
            redirect:"/admin/areas"
        })
    }

     //? direccion estado validation 

    if(direccionStatus.estado === "INACTIVO"){
        
       return  res.status(400).json({
            ok:false,
            message:`No se puede modificar un area de la dirección ${direccionStatus.direccion} INACTIVA`,
            redirect:"/admin/areas"
        })
    }

    if(idAreasMap.includes(id)){
    
        const [updateArea]= await pool.query("update areas set area= ?, direccion= ?, estado= ? where id_area= ?", [area,direccion,estado, id])

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
    
    const [consumibles]= await pool.query("select id_consumible, tipo_consumible, marca_consumible, consumible from consumibles where estado= 'ACTIVO'")

    const [areas]= await pool.query("select id_area, direccion, area from areas where estado= 'ACTIVO'")


    //TODO 
    
    let equiposAll= []
     
    
    if(invetarioSearch && invetarioSearch.length  > 0){
        
        const [equiposSearchs]= await pool.query("select e.id_equipo, t.tipo_de_equipo,ma.marca_equipo, md.modelo ,e.serie, e.inventario, e.estado_equipo, a.area, d.direccion, group_concat(c.consumible separator ',') as consumible,e.observaciones, e.user from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo inner join areas a on a.id_area= e.area inner join direcciones d on d.id_direccion = a.direccion inner join consumible_modelos cm on cm.id_tipo_equipo= e.tipo_equipo inner join consumibles c on c.id_consumible = cm.id_consumible inner join modelo_equipos md on md.id_modelo_equipo= t.modelo_equipo inner join marca_equipos ma on ma.id_marca_equipo= md.marca_equipo where e.inventario= ? group by e.id_equipo", [invetarioSearch])
        
        equiposAll= equiposSearchs
        
    }else{

        const [equipos]= await pool.query("select e.id_equipo, t.tipo_de_equipo,ma.marca_equipo, md.modelo ,e.serie, e.inventario, e.estado_equipo, a.area, d.direccion, group_concat(c.consumible separator ',') as consumible,e.observaciones, e.user from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo inner join areas a on a.id_area= e.area inner join direcciones d on d.id_direccion = a.direccion inner join consumible_modelos cm on cm.id_tipo_equipo= e.tipo_equipo inner join consumibles c on c.id_consumible = cm.id_consumible inner join modelo_equipos md on md.id_modelo_equipo= t.modelo_equipo inner join marca_equipos ma on ma.id_marca_equipo= md.marca_equipo group by e.id_equipo limit ? offset ?", [limit, offset])

        equiposAll= equipos

    }   

    
    
    
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
    
    const [marcasQuery]=await pool.query("select id_marca_equipo, marca_equipo, estado from marca_equipos")
    
    
    
    if(marcaSearch && marcaSearch.length > 0) {
        
        const [marcaSerachAll] = await pool.query("select id_marca_equipo, marca_equipo, estado from marca_equipos where marca_equipo = ?", [marcaSearch])
        
        marcasAll= marcaSerachAll
    }else if(orderMarcas && orderMarcas.length  > 0) {
        const [marcasOrder]= await pool.query("select id_marca_equipo, marca_equipo, estado from marca_equipos order by marca_equipo desc")
        
        marcasAll=  marcasOrder
    
    }else{
        marcasAll= marcasQuery
    }
    
    const [marcaEquiposActive]= await pool.query("select id_marca_equipo, marca_equipo from marca_equipos where estado= 'ACTIVE'")



    //todo modelos
    
    const  modeloSearch=req.query.modelo
    
    const orderModelo=req.query.orderModeloEquipos
    
    let modelosAll= []
    
    const [modelos]= await pool.query("select m.id_modelo_equipo, ma.marca_equipo, m.modelo, m.estado from modelo_equipos m inner join marca_equipos ma on ma.id_marca_equipo= m.marca_equipo ")
    
    
    const [modelosEquiposActive]= await pool.query("select id_modelo_equipo, modelo from modelo_equipos where estado= 'ACTIVO'")
    
    
    if(modeloSearch && modeloSearch.length > 0){
        
        const [modeloSearchQuery] = await pool.query("select ma.marca_equipo, m.modelo, m.estado from modelo_equipos m inner join marca_equipos ma on ma.id_marca_equipo= m.marca_equipo where m.modelo = ?", [modeloSearch])
        
        modelosAll= modeloSearchQuery
        
    }else if(orderModelo && orderModelo.length > 0){
        
        const [modelosOrder]= await pool.query("select m.id_modelo_equipo, ma.marca_equipo, m.modelo, m.estado from modelo_equipos m inner join marca_equipos ma on ma.id_marca_equipo= m.marca_equipo order by m.modelo desc")

        modelosAll=  modelosOrder
    }else{

        modelosAll= modelos
    }
    
    




    
    //todo tipos de equipos
    
    const tipoSearch= req.query.tipo                         
    
    const tipoOrder= req.query.orderTipoEquipos
    
    
    let tiposAll=[]
    
    const [tiposEquiposActive]= await pool.query("select t.id_tipo_equipo,m.modelo from tipo_equipos t inner join modelo_equipos m on m.id_modelo_equipo= t.modelo_equipo where t.estado= 'ACTIVO'")
    
    const [tiposEquipos]= await pool.query("select t.id_tipo_equipo, t.tipo_de_equipo, m.modelo, group_concat(c.consumible separator ', ') as consumibles, t.estado from tipo_equipos t inner join modelo_equipos m on m.id_modelo_equipo= t.modelo_equipo inner join consumible_modelos cm on cm.id_tipo_equipo= t.id_tipo_equipo inner join consumibles c on c.id_consumible= cm.id_consumible group by t.id_tipo_equipo")

if(tipoSearch && tipoSearch.length  > 0){
    
    const [tipoSearchQuery]= await pool.query("select t.id_tipo_equipo, t.tipo_de_equipo, m.modelo,group_concat(c.consumible separator ', ') as consumibles, t.estado from tipo_equipos t inner join modelo_equipos m on m.id_modelo_equipo= t.modelo_equipo inner join consumible_modelos cm on cm.id_tipo_equipo= t.id_tipo_equipo inner join consumibles c on c.id_consumible= cm.id_consumible where m.modelo= ? group by t.id_tipo_equipo", [tipoSearch])
    
    tiposAll= tipoSearchQuery
    
}else if (tipoOrder && tipoOrder.length  > 0){
    
    
    const [tiposOrders]= await pool.query("select t.id_tipo_equipo, t.tipo_de_equipo, m.modelo, group_concat(c.consumible separator ', ') as consumibles, t.estado from tipo_equipos t inner join modelo_equipos m on m.id_modelo_equipo= t.modelo_equipo inner join consumible_modelos cm on cm.id_tipo_equipo= t.id_tipo_equipo inner join consumibles c on c.id_consumible= cm.id_consumible group by t.id_tipo_equipo order by t.id_tipo_equipo desc")
    
    tiposAll= tiposOrders
    


}else{
    
    

    tiposAll= tiposEquipos


}

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
            }],
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
                    options:tiposEquiposActive.map(t => { return {
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
                },]
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
                selected:[{
                    id:"selectEstado",
                    name:"estado",
                    class__icon:"fas fa-shield-alt",
                    defaultOption:"Selecciona un Estado",
                    options:[{ value:"ACTIVO",valueText:"ACTIVO"},{value:"INACTIVO",valueText:"INACTIVO"}]
                    
             }]
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
                headTitles:["Marca de Equipo", "Estado"],
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
        optionsDataSearch:marcasQuery.map(e=> e.marca_equipo),    
        


        //?modelos de equipos
        formShowAdd2:{
            idForm: "formAddModelo",
            title:"AGREGAR MODELO DE EQUIPO",
            selected: [{
                id:"selectModelosAdd",
                class__icon:"fas fa-laptop",
                name:"marca_equipo",
                defaultOption:"Seleccione una Marca",
                options: marcaEquiposActive.map(m => { return {value:m.id_marca_equipo, valueText: m.marca_equipo}})
            },{
                    id:"selectEstado",
                    name:"estado",
                    class__icon:"fas fa-shield-alt",
                    defaultOption:"Selecciona un Estado",
                    options:[{ value:"ACTIVO",valueText:"ACTIVO"},{value:"INACTIVO",valueText:"INACTIVO"}]
                    
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
                headTitles:["Marca de Equipo", "Modelo de Equipo", "Estado"], 
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
        optionsDataSearch2:modelos.map(e=> e.modelo),    
        
        

        //?tipo de equipos
        formShowAdd3:{
            idForm: "formAddTipos",
            title:"AGREGAR EL TIPO DE EQUIPO",
            valueSubmit:"Agregar",
            selected: [{
                id:"selectModelAdd",
                class__icon:"fas fa-pencil-alt",
                name:"modelo_equipo",
                defaultOption:"Seleccione un Modelo",
                options: modelosEquiposActive.map(m => { return {value:m.id_modelo_equipo, valueText: m.modelo}})
            }, { //?TIPOS DE EQUIPOS MANUAL SELECT
                id:"SelectTipoEquipoAdd",
                class__icon:"fas fa-mobile-alt",
                name:"tipo_de_equipo",
                defaultOption:"Seleccione un Tipo de Equipo",
                options: tiposEquiposManual //? INICIO USERS
            },{ //?CONSUMIBLES TOM SELECT
                id:"selectConsumiblesAdd",
                class__icon:"fas fa-tint",
                name:"consumibles",
                defaultOption:"Seleccione Consumibles",
                multiple:true,
                options: consumibles.map(m => { return {value:m.id_consumible, valueText: m.consumible}})
            },{
                    id:"selectEstado",
                    name:"estado",
                    class__icon:"fas fa-shield-alt",
                    defaultOption:"Selecciona un Estado",
                    options:[{ value:"ACTIVO",valueText:"ACTIVO"},{value:"INACTIVO",valueText:"INACTIVO"}]
                    
             }],
        },
        formShowInputs3:[], 
         classTarget3:"tipoFormShow", 
         classClose3:"tipoCloseBtn",
         containerData3:{ //? DATA MARCAS RENDER
                title: "TIPOS DE EQUIPOS",
                idField: "id_tipo_equipo",
                hrefRute:"/admin/equipos/tipos/edit",
                hrefRuteDelete:"/admin/equipos/tipos/delete",
                headTitles:["Tipo de Equipo", "Modelo de Equipo", "Consumibles", "Estado"],
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
        optionsDataSearch3:tiposEquipos.map(e=> e.modelo),    



})})



//TODO GENERATE EXCEL EXPORT

routeAdmin.get("/equipos/export", isAuthLogin(1), async (req,res, next)=>{


     const [equipos]= await pool.query("select e.id_equipo, t.tipo_de_equipo,ma.marca_equipo, md.modelo ,e.serie, e.inventario, e.estado_equipo, a.area, d.direccion, group_concat(c.consumible separator ',') as consumible,e.observaciones, e.user from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo inner join areas a on a.id_area= e.area inner join direcciones d on d.id_direccion = a.direccion inner join consumible_modelos cm on cm.id_tipo_equipo= t.id_tipo_equipo inner join consumibles c on c.id_consumible = cm.id_consumible inner join modelo_equipos md on id_modelo_equipo= t.modelo_equipo inner join marca_equipos ma on id_marca_equipo= md.marca_equipo group by id_equipo")
    
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


    //?validate data body

    const [[tipoEquipoFind]]= await pool.query("select id_tipo_equipo from tipo_equipos where id_tipo_equipo= ?", [parseTipo])

    const [[areaFind]]= await pool.query("select id_area from areas where id_area= ?", [parseArea])

    if(!tipoEquipoFind){
        return res.status(400).json({
            ok:false,
            message:"El tipo de equipo no existe",
            redirect: "/admin/equipos"
        })
    }

    if(!areaFind){
        return res.status(400).json({
            ok:false,
            message:"El área no existe",
            redirect: "/admin/equipos"
        })
    }

    //?construct new equipo object
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

        //?EQUIPO SEARCH VALIDATE
        const [equipoSearch] = await connection.query("SELECT id_equipo FROM equipos WHERE serie = ? OR inventario = ?",[serie, inventario])

        if (equipoSearch.length > 0) { throw new Error(`El equipo con serie ${serie} o inventario ${inventario} ya existe`)}


        //? EQUIPO MODELO CONSUMIBLES SEARCH

        const [[consumiblesModeloEquipo]]= await connection.query("select t.id_tipo_equipo, m.modelo, group_concat(c.id_consumible separator ',') as consumibles from tipo_equipos t inner join consumible_modelos cm on cm.id_tipo_equipo= t.id_tipo_equipo inner join consumibles c on c.id_consumible= cm.id_consumible inner join modelo_equipos m on m.id_modelo_equipo= t.modelo_equipo where t.id_tipo_equipo= ? group by t.id_tipo_equipo", [parseTipo])

        const validateConsumibles= await validateConsumiblesActive(consumiblesModeloEquipo.consumibles.split(",").map(c => Number(c)), connection)

        if(validateConsumibles.ok === false){ throw new Error(`El modelo seleccionado ${consumiblesModeloEquipo.modelo} contiene consumibles inactivos)`)}

        //?VALIDATE TIPO, AREAS AND MORE

        const validateTipoEquipo= await validateTipoEquipoActive({connection, tipo_equipo: parseTipo, area: parseArea, validateComplete: false})


        if(validateTipoEquipo.ok === false){ throw new Error(validateTipoEquipo.message)}


        //?ADD EQUIPO
        const [addEquipo] = await connection.query("INSERT INTO equipos SET ?",[NewEquipo])


        if(addEquipo.affectedRows  > 0){
            
            await connection.commit()

            return res.json({
                ok:true,
                message: `Se ha guardado el equipo ${inventario}`,
                redirect:"/admin/equipos"
            })
        }else{
            
            throw new Error(`Hubo un error al guardar el equipo ${inventario}`)
        }


    } catch (err) {

        await connection.rollback()
        
        return res.status(500).json({
            ok:false,
            message:`${err.message}`,
            redirect:"/admin/equipos"
        })

    } finally {
        connection.release()
    }

})







//todo POST ADD MARCA


routeAdmin.post("/marcas/equipo", isAuthLogin(1),bodyValidateMarcasEquipos,validateExpressErrors("/admin/equipos"), async(req,res)=>{

    const {marca_equipo, estado}= req.body

    
    const [marcaFind]= await pool.query("select marca_equipo from marca_equipos where marca_equipo= ?",[marca_equipo])
    
    
    if(marcaFind.length > 0){
        return res.status(400).json({
            ok:false,
            message: `Ya existe la Marca ${marca_equipo}`,
            redirect:"/admin/equipos"
        })
    }


    const [marcaAdd]= await pool.query("insert into marca_equipos set ? ", [{marca_equipo, estado}])
    

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
    
    const {marca_equipo, modelo, estado}= req.body

    const marca= parseInt(marca_equipo)

    const [modelFind]= await pool.query("select modelo from modelo_equipos where modelo = ?", [modelo])

    if(modelFind.length > 0){
        
        return res.status(400).json({
            ok:false,
            message:`El modelo ${modelo} ya existe, ingrese un nuevo modelo`,
            redirect:"/admin/equipos"
        })
    }


    //? marca validate active

    const [[marcaActive]]= await pool.query("select marca_equipo, estado from marca_equipos where id_marca_equipo= ?", [marca_equipo])

    console.log(marcaActive)

    if(marcaActive.estado=== "INACTIVO"){

        return res.status(400).json({
             ok:false,
             message:`No puedes crear un modelo de la marca ${marcaActive.marca_equipo} por que esta inactiva`,
             redirect:"/admin/equipos"
        })
    }


    const [modeloAdd] = await pool.query("insert into modelo_equipos set ?",[{marca_equipo: marca, modelo, estado}])
    
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
    
    const {tipo_de_equipo, modelo_equipo, consumibles, estado }= req.body

    const modelo= parseInt(modelo_equipo)

    const [tipoFind]= await pool.query("select modelo_equipo, tipo_de_equipo from tipo_equipos where modelo_equipo= ?",[modelo])
    
    const consumibleValidateArray=  Array.isArray(consumibles) ? consumibles : [consumibles]

    const consumiblesIdParse= consumibleValidateArray.map(Number)


    if(tipoFind.length > 0){
        return res.status(400).json({
            ok:false,
            message:`El tipo de equipo ${tipo_de_equipo} ya existe`,
            redirect:"/admin/equipos"
        })
    }

    const connection= await pool.getConnection()

    try {
    
    await connection.beginTransaction()
    
    //TODO VALIDATE ACTIVE
    
    const [[modeloValidate]]= await connection.query("select id_modelo_equipo, modelo, estado, marca_equipo from modelo_equipos where id_modelo_equipo=? for UPDATE", [modelo])

    const [[marcaValidate]]= await connection.query("select id_marca_equipo, marca_equipo, estado from marca_equipos where id_marca_equipo= ? for UPDATE", [parseInt(modeloValidate.marca_equipo)])

    const consumibleValidate = await validateConsumiblesActive(consumiblesIdParse,connection)


    if(consumibleValidate.ok=== false){
        
        throw new Error(consumibleValidate.message)
    }

    if(modeloValidate.estado=== "INACTIVO"){ 

        throw new Error(`No se puede agregar, el modelo ${modeloValidate.modelo} esta inactivo`)
    }

    if(marcaValidate.estado === 'INACTIVO'){

        throw new Error(`No se puede agregar, la marca ${marcaValidate.marca_equipo} esta inactiva`)
    }


    //* INSERT TIPO
    const [tipoAdd]= await connection.query("insert into tipo_equipos SET ?",[{tipo_de_equipo, modelo_equipo:modelo, estado}])

    if(tipoAdd.affectedRows === 0){throw new Error(`Error al agregar el tipo ${tipo_de_equipo}`)}

    //*ID TIPO INSERT AND CONSUMIBLES ADD

    const idTipoInsert= tipoAdd.insertId

    const [consumiblesValidate]= await connection.query("select id_consumible from consumibles where id_consumible in(?) for UPDATE", [consumiblesIdParse])

    if(consumiblesValidate.length !== consumiblesIdParse.length){throw new Error("Consumibles no validos")}


    const consumiblesParseAdd= consumiblesIdParse.map(c => (([parseInt(idTipoInsert), c])))

    const[consumiblesAdd]= await connection.query("insert into consumible_modelos(id_tipo_equipo,id_consumible) values ? ", [consumiblesParseAdd])


    if(consumiblesAdd.affectedRows > 0){

        await connection.commit()
        
        return res.status(200).json({
             ok:true,
             message:`Se ha agregado el tipo de equipo ${tipo_de_equipo}`,
             redirect:"/admin/equipos"
        })
    }else{

        await connection.rollback()

        throw new Error("Hubo un error al agregar los consumibles")
    }



    } catch (error) {
       
        await connection.rollback()

        console.log(error)

        return res.status(400).json({
            ok:false,
            message:error.message,
            redirect: "/admin/equipos"

        })

    }finally{

        connection.release()
    }


    


})






//TODO GET EDIT EQUIPO
routeAdmin.get("/equipos/equipo/edit/:id",isAuthLogin(1),async (req,res)=>{
    
const id=parseInt(req.params.id)

const [idEquipos]= await pool.query("select id_equipo from equipos")

const [tiposEquipos]= await pool.query("select e.id_tipo_equipo, e.tipo_de_equipo, m.modelo from tipo_equipos e inner join modelo_equipos m on m.id_modelo_equipo= e.modelo_equipo where e.estado= 'ACTIVO'")

const [areas]= await pool.query("select id_area, direccion, area from areas where estado= 'ACTIVO'")


const idEquiposNumbers= idEquipos.map(id => id.id_equipo)

if (!idEquiposNumbers.includes(id)){
    res.redirect("/admin/equipos")
}

const [equipoSearch]= await pool.query("select e.id_equipo, t.tipo_de_equipo,ma.marca_equipo, md.modelo ,e.serie, e.inventario, e.estado_equipo, a.area, d.direccion,observaciones, e.user from equipos e inner join tipo_equipos t on t.id_tipo_equipo= e.tipo_equipo inner join areas a on a.id_area= e.area inner join direcciones d on d.id_direccion = a.direccion inner join modelo_equipos md on id_modelo_equipo= t.modelo_equipo inner join marca_equipos ma on id_marca_equipo= md.marca_equipo group by e.id_equipo having e.id_equipo= ?",[id])

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
                }, 
                
            ]




    })


    
})







//TODO GET EDIT MARCA ID 

routeAdmin.get("/equipos/marcas/edit/:id",isAuthLogin(1),async (req,res)=>{
    
const id=parseInt(req.params.id)

const [idModelos]= await pool.query("select id_marca_equipo, estado from marca_equipos")

const idMarcasNumbers= idModelos.map(id => id.id_marca_equipo)

if (!idMarcasNumbers.includes(id)){
    res.redirect("/admin/equipos")
}

const [marcaSearch]= await pool.query("select id_marca_equipo, marca_equipo, estado from marca_equipos where id_marca_equipo= ?",[id])

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
                },{
                    type:"select",
                    placeholder:"Escribe el estado del usuario...",
                    name:"estado",
                    id:"estadoEdit",
                    labelTitle:"Estado:",
                    value:marcaSearch[0].estado,
                    options:[{value:"ACTIVO", valueText:"Activo"},{value:"INACTIVO", valueText:"Inactivo"}]
                }
                
            ]




    })


    
})



//TODO GET EDIT MODELO

routeAdmin.get("/equipos/modelos/edit/:id",isAuthLogin(1), async (req,res)=>{


const id=parseInt(req.params.id)

const [idModelosId]= await pool.query("select id_modelo_equipo, estado from modelo_equipos")

const idModelosNumbers= idModelosId.map(id => id.id_modelo_equipo)

const [marcas]= await pool.query("select id_marca_equipo, marca_equipo from marca_equipos ")

if (!idModelosNumbers.includes(id)){
    res.redirect("/admin/equipos")
}

const [modeloSearch]= await pool.query("select m.id_modelo_equipo, ma.marca_equipo, m.modelo, m.estado from modelo_equipos m inner join marca_equipos ma on ma.id_marca_equipo=m.marca_equipo where id_modelo_equipo= ?",[id])


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
                },{
                    type:"select",
                    placeholder:"Escribe el estado del usuario...",
                    name:"estado",
                    id:"estadoEdit",
                    labelTitle:"Estado:",
                    value:modeloSearch[0].estado,
                    options:[{value:"ACTIVO", valueText:"Activo"},{value:"INACTIVO", valueText:"Inactivo"}]
                }
                
            ]




    })



})




//TODO GET EDIT TIPOS DE EQUIPOS

routeAdmin.get("/equipos/tipos/edit/:id", isAuthLogin(1), async (req,res)=>{
      
    const id=parseInt(req.params.id)

const [idTipoId]= await pool.query("select id_tipo_equipo, estado from tipo_equipos")

const idTiposNumbers= idTipoId.map(id => id.id_tipo_equipo)

const [modelos]= await pool.query("select id_modelo_equipo, modelo from modelo_equipos")

const [consumuibles]= await pool.query("select id_consumible, consumible from consumibles")

if (!idTiposNumbers.includes(id)){
    res.redirect("/admin/equipos")
}

const [tipoSearch]= await pool.query("select t.id_tipo_equipo, t.tipo_de_equipo, m.modelo,t.estado, group_concat(c.id_consumible) as idConsumibles from tipo_equipos t inner join modelo_equipos m on m.id_modelo_equipo=t.modelo_equipo inner join consumible_modelos cm on cm.id_tipo_equipo = t.id_tipo_equipo inner join consumibles c on c.id_consumible = cm.id_consumible where t.id_tipo_equipo= ? group by t.id_tipo_equipo ",[id])

const tipoIdSeachConsumibles= tipoSearch[0].idConsumibles.split(",").map(Number) 

const optsTipoSearch=consumuibles.map( c => (
    {
    value:c.id_consumible,
    text:c.consumible,
    selected:tipoIdSeachConsumibles.includes(c.id_consumible)

    }
))





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
                    type:"select",
                    name:"tipo_de_equipo",
                    id:"modeloEdit",
                    labelTitle:"Tipo de Equipo:",
                    value:tipoSearch[0].tipo_de_equipo,
                    options:tiposEquiposManual
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
                },{
                    type:"select",
                    name:"consumibles",
                    id:"consumibleEdit",
                    labelTitle:"Consumible:",
                    value:[], //? array change multiple options
                    multiple:true,
                    options: optsTipoSearch
                },{
                    type:"select",
                    placeholder:"Escribe el estado del usuario...",
                    name:"estado",
                    id:"estadoEdit",
                    labelTitle:"Estado:",
                    value:tipoSearch[0].estado,
                    options:[{value:"ACTIVO", valueText:"Activo"},{value:"INACTIVO", valueText:"Inactivo"}]
                }
                
            ]

    })


})










//TODO POST UPDATE EQUIPOS
routeAdmin.post("/equipos/equipo/edit/:id",isAuthLogin(1), bodyValidateEquipos, validateExpressErrors("/admin/equipos"), async (req,res)=>{
     
const idEquipo=parseInt(req.params.id)

const {tipo_equipo, serie, inventario,estado_equipo, area, observaciones}= req.body

//?normalize array multiple and new const item
 const newEquipo={
    tipo_equipo:parseInt(tipo_equipo),
    serie,
    inventario,
    estado_equipo:estado_equipo.toUpperCase(),
    observaciones,
    area:parseInt(area),
    user:parseInt(req.user.id_user)
 }

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



//? TRANSACTION


const connection= await pool.getConnection()

try{


    await connection.beginTransaction()


    //?VALIDATE AREA AND  TIPO EQUIPO

    const [areas]= await connection.query("select id_area from areas where id_area= ? for UPDATE", [parseInt(area)])

    const [tipos]= await connection.query("select id_tipo_equipo from tipo_equipos where id_tipo_equipo= ? for UPDATE", [parseInt(tipo_equipo)])

    if(areas.length === 0){ throw new Error("El area no existe")}

    if(tipos.length === 0){ throw new Error("El tipo de equipo no existe")}


    //?VALIDATE CONSUMIBLES ACTIVE


    const [[consumiblesModeloEquipo]]= await connection.query("select t.id_tipo_equipo, m.modelo, group_concat(c.id_consumible separator ',') as consumibles from tipo_equipos t inner join consumible_modelos cm on cm.id_tipo_equipo= t.id_tipo_equipo inner join consumibles c on c.id_consumible= cm.id_consumible inner join modelo_equipos m on m.id_modelo_equipo= t.modelo_equipo where t.id_tipo_equipo= ? group by t.id_tipo_equipo", [parseInt(tipo_equipo)])

    const validateConsumibles= await validateConsumiblesActive(consumiblesModeloEquipo.consumibles.split(",").map(e => Number(e)), connection)

    if(validateConsumibles.ok === false){ throw new Error(validateConsumibles.message)}

    //? VALIDATE TIPO EQUIPO ACTIVE

    const validateTipoEquipo= await validateTipoEquipoActive({connection, tipo_equipo: parseInt(tipo_equipo), area: parseInt(area), validateComplete: false})

    if(validateTipoEquipo.ok === false){ throw new Error(validateTipoEquipo.message)}

    //?UPDATE EQUIPO

   const [equipoUpdate]= await connection.query("update equipos set ? where id_equipo=?",[newEquipo,idEquipo])

   if(equipoUpdate.affectedRows === 0){ throw new Error(`Error al actualizar el equipo ${inventario}`)}

    if (equipoUpdate.affectedRows > 0){
        
        await connection.commit()
        
        return res.status(200).json({
            ok:true,
            message:`Se edito correctamente el equipo ${inventario}`,
            redirect:"/admin/equipos"
        })
    }



}catch(err){

await connection.rollback()

return res.status(400).json({
    ok:false,
    message: err.message,
    redirect:"/admin/equipos"


})

}finally{

    connection.release()
}

})







//TODO POST UPDATE MARCAS

routeAdmin.post("/equipos/marcas/edit/:id",isAuthLogin(1), bodyValidateMarcasEquipos, validateExpressErrors("/admin/equipos"), async (req,res)=>{
     
const idMarca=parseInt(req.params.id)

const {marca_equipo, estado}= req.body

const [idMarcasAll]=await pool.query("select id_marca_equipo from marca_equipos")

const idMarcasNumbers= idMarcasAll.map(m=> m.id_marca_equipo)

const [marcaFind]= await pool.query("select id_marca_equipo,marca_equipo from marca_equipos where marca_equipo= ? and id_marca_equipo!= ?", [marca_equipo, idMarca])

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

const [marcaUpdate]= await pool.query("update marca_equipos set marca_equipo= ?, estado= ? where id_marca_equipo=?",[marca_equipo, estado, idMarca])

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

const {modelo, marca_equipo, estado}= req.body

const [idModelosAll]=await pool.query("select id_modelo_equipo from modelo_equipos")

const idModelosNumbers= idModelosAll.map(m=> m.id_modelo_equipo)

const [modeloFind]= await pool.query("select id_modelo_equipo from modelo_equipos where modelo= ? and id_modelo_equipo != ?", [modelo,idEquipo])

//?validate marca active
  const [[marcaValidate]]= await pool.query("select id_marca_equipo, marca_equipo, estado from marca_equipos where id_marca_equipo= ?", [marca_equipo])
 

if(marcaValidate.estado === "INACTIVO"){

    return res.status(400).json({
        ok:false,
        message:`No se puede actualizar, la marcar ${marcaValidate.marca_equipo} esta inactiva`,
        redirect:"/admin/equipos"
    })

}




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

const [modeloUpdate]= await pool.query("update modelo_equipos set modelo= ?, marca_equipo=?, estado=? where id_modelo_equipo=?",[modelo, marca_equipo, estado, idEquipo])

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

const {tipo_de_equipo, modelo_equipo, estado}= req.body

const [idTiposAll]=await pool.query("select id_tipo_equipo from tipo_equipos")

const idTiposNumbers= idTiposAll.map(m=> m.id_tipo_equipo)

const [tipoFind]= await pool.query("select id_tipo_equipo from tipo_equipos where modelo_equipo= ? and id_tipo_equipo != ?", [modelo_equipo,idTipo])

const consumibles = Array.isArray(req.body["consumibles"]) ? req.body["consumibles"] : [req.body["consumibles"]]

const consumiblesParseId= consumibles.map(Number)

//? VALIDATE ESTADOS

const [[modeloValidate]]= await pool.query("select id_modelo_equipo, marca_equipo, modelo, estado from modelo_equipos where id_modelo_equipo= ?", [parseInt(modelo_equipo)])

const [[marcaValidate]]= await pool.query("select id_marca_equipo, marca_equipo, estado from marca_equipos where id_marca_equipo= ? ", [parseInt(modeloValidate.marca_equipo)])

if(modeloValidate.estado=== "INACTIVO"){

    return res.status(400).json({
        ok:false,
        message:`No se puede actualizar, el modelo ${modeloValidate.modelo} esta inactivo`,
        redirect:"/admin/equipos"
    })
}

if(marcaValidate.estado=== "INACTIVO"){

    return res.status(400).json({
        ok:false,
        message:`No se puede actualizar, la marca ${marcaValidate.marca_equipo} esta inactiva`,
        redirect:"/admin/equipos"
    })
}


//?TRANSACTION UPDATE TIPOS DE EQUIPOS AND CONSUMIBLES

const connection= await pool.getConnection()

try {
    await connection.beginTransaction()

    //?CONSUMIBLES VALIDATE ACTIVE
    
    const consumiblesValidatEstado= await validateConsumiblesActive(consumiblesParseId,pool)
    
    if(consumiblesValidatEstado.ok=== false){ throw new Error(consumiblesValidatEstado.message)}
    
    
    //? EDIT EXIST ID
    if(!idTiposNumbers.includes(idTipo)){ throw new Error("El tipo de equipo que intenta editar, no existe")}
    
    //?DUPLICATE VALUE ID EXIST
    if(tipoFind.length > 0){throw new Error(`El modelo ${modelo_equipo} ya existe para actualizar`)}
    
    //? INSERT UPDATE TIPO DE EQUIPO
    
    const [tipoUpdate]= await connection.query("update tipo_equipos set tipo_de_equipo= ?, modelo_equipo=?, estado=? where id_tipo_equipo=?",[tipo_de_equipo, modelo_equipo, estado, idTipo])
    
    if(tipoUpdate.affectedRows === 0){ throw new Error(`Error al editar el tipo de equipo ${tipo_de_equipo}`)}
    
    

//? CONSUMIBLES VALIDATE EXIST


const [consumiblesValidate]= await connection.query("select id_consumible from consumibles where id_consumible in (?)", [consumiblesParseId])

if(consumiblesValidate.length !== consumiblesParseId.length){ throw new Error("Consumibles no validos")}


//? CONSUMIBLES UPDATE PIVOTE AND DELETE OLD DATA
const consumilesParse= consumibles.map(c => [parseInt(idTipo), c])

const [deleteConsumibles]= await connection.query("delete from consumible_modelos where id_tipo_equipo= ?", [idTipo])

if(deleteConsumibles.affectedRows === 0){ throw new Error(`Error al eliminar los consumibles anteriores del tipo de equipo ${tipo_de_equipo}`)}

const [updateConsumibles]= await connection.query("insert into consumible_modelos(id_tipo_equipo,id_consumible) values ?", [consumilesParse])

if (updateConsumibles.affectedRows > 0){
    
    await connection.commit()

    return res.status(200).json({
        ok:true,
        message:`Se ha editado el tipo de equipo ${tipo_de_equipo}`,
        redirect:"/admin/equipos"
    })


}else{

    throw new Error(`Error al actualizar los consumibles del tipo de equipo ${tipo_de_equipo}`)
}

} catch (error) {
 
    await connection.rollback()

    console.log(error)

    return res.status(400).json({
        ok:false,
        message:`${error}`,
        redirect:"/admin/equipos"
    })

   
}finally{

 connection.release()

}



})




























//! CONSUMIBLES


//TODO GET CONSUMIBLES
routeAdmin.get("/consumibles", isAuthLogin(1), async (req, res)=>{
    
//? TIPO CONSUMIBLES

 const tipoconsumible= req.query.tipoConsumible

 const ordertipoConsumible= req.query.orderTipoConsumible

 let tiposConsumiblesAll= []

 const [tiposConsumibles] = await pool.query("select id_tipo_consumibles, tipo_consumible, estado from tipo_consumibles")

 const [consumibleSearch]= await pool.query("select id_tipo_consumibles, tipo_consumible, estado from tipo_consumibles where tipo_consumible= ?", [tipoconsumible])

 const [consumiblesOrder]= await pool.query("select id_tipo_consumibles, tipo_consumible, estado from tipo_consumibles order by tipo_consumible desc")

 tiposConsumiblesAll= tiposConsumibles
 
if(tipoconsumible && tipoconsumible.length > 0) tiposConsumiblesAll= consumibleSearch

if(ordertipoConsumible && ordertipoConsumible.length > 0) tiposConsumiblesAll= consumiblesOrder

//todo tipo consumibles list active forms

const [tiposConsumiblesActive]= await pool.query("select id_tipo_consumibles, tipo_consumible from tipo_consumibles where estado= 'ACTIVO' ")


//?  MARCAS CONSUMIBLES

const marcaConsumible= req.query.marca

const orderMarca= req.query.orderMarcaConsumible

let marcasConsumiblesAll= []

const [marcasConsumibles]= await pool.query("select id_marca_consumible, marca_consumible, estado from marca_consumibles")

const [marcaConsumibleSearch]= await pool.query("select id_marca_consumible, marca_consumible, estado from marca_consumibles where marca_consumible= ?", [marcaConsumible])

const [marcasConsumiblesOrder]= await pool.query("select id_marca_consumible, marca_consumible, estado from marca_consumibles order by marca_consumible desc")


marcasConsumiblesAll= marcasConsumibles

if(marcaConsumible && marcaConsumible.length > 0 ) marcasConsumiblesAll= marcaConsumibleSearch

if(orderMarca && orderMarca.length > 0) marcasConsumiblesAll= marcasConsumiblesOrder

//todo marcas list active forms

const [marcasActive]= await pool.query("select id_marca_consumible, marca_consumible from marca_consumibles where estado='ACTIVO'")


//? CONSUMIBLES


const consumibleQuery= req.query.consumible

const orderConsumible= req.query.orderConsumible

let consumiblesAll= []

const [consumibles]= await pool.query("select c.id_consumible,t.tipo_consumible, m.marca_consumible, c.consumible, c.estado from consumibles c inner join marca_consumibles m on m.id_marca_consumible= c.marca_consumible inner join tipo_consumibles t on t.id_tipo_consumibles= c.tipo_consumible")

const [consumibleSearchQuery]= await pool.query("select c.id_consumible,t.tipo_consumible, m.marca_consumible, c.consumible, c.estado from consumibles c inner join marca_consumibles m on m.id_marca_consumible= c.marca_consumible inner join tipo_consumibles t on t.id_tipo_consumibles= c.tipo_consumible where c.consumible= ?", [consumibleQuery])

const [consumibleOrder]= await pool.query("select c.id_consumible,t.tipo_consumible, m.marca_consumible, c.consumible, c.estado from consumibles c inner join marca_consumibles m on m.id_marca_consumible= c.marca_consumible inner join tipo_consumibles t on t.id_tipo_consumibles= c.tipo_consumible order by c.consumible desc")


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
                headTitles:["Tipo de Consumible", "Estado"],
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
                selected: [ {
                    id:"selectEstado",
                    name:"estado",
                    class__icon:"fas fa-shield-alt",
                    defaultOption:"Selecciona un Estado",
                    options:[{ value:"ACTIVO",valueText:"ACTIVO"},{value:"INACTIVO",valueText:"INACTIVO"}]
                    
             }],
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
                headTitles:["Marca de Consumible", "Estado"],
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
                selected: [ {
                    id:"selectUserEstado",
                    name:"estado",
                    class__icon:"fas fa-shield-alt",
                    defaultOption:"Selecciona un Estado",
                    options:[{ value:"ACTIVO",valueText:"ACTIVO"},{value:"INACTIVO",valueText:"INACTIVO"}]
                    
             }],
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
                headTitles:["Tipo de Consumible", "Marca de Consumible", "Consumible", "Estado"],
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
                    options:marcasActive.map(d => { return {
                        value:d.id_marca_consumible,
                        valueText: d.marca_consumible
                    }})
                },
            {
                    id:"tipoSelect",
                    class__icon:"fas fa-tint",
                    name:"tipo_consumible",
                    defaultOption:"Seleccione un tipo de Consumible",
                    options:tiposConsumiblesActive.map(d => { return {
                        value:d.id_tipo_consumibles,
                        valueText: d.tipo_consumible
                    }})
                }, {
                    id:"selectUserEstado",
                    name:"estado",
                    class__icon:"fas fa-shield-alt",
                    defaultOption:"Selecciona un Estado",
                    options:[{ value:"ACTIVO",valueText:"ACTIVO"},{value:"INACTIVO",valueText:"INACTIVO"}]
                    
             }],
            valueSubmit:"AGREGAR"
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
    

    const {tipo_consumible, marca_consumible,consumible, estado}= req.body

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


    //TODO VALIDATE  

    const [[tipoConsumibleValidate]]= await pool.query("select tipo_consumible, estado from tipo_consumibles where id_tipo_consumibles= ?", [parseTipo])

    const [[marcaConsumibleValidate]]= await pool.query("select marca_consumible, estado from marca_consumibles where id_marca_consumible= ?",[parseMarca])


if(tipoConsumibleValidate.estado === "INACTIVO"){

    return res.status(400).json({
        ok:false,
        message:`No puedes agregar, el tipo ${tipoConsumibleValidate.tipo_consumible} esta inactivo`,
        redirect: "/admin/consumibles"
    })
}


if(marcaConsumibleValidate.estado==="INACTIVO"){

    return res.status(400).json({
        ok:false,
        message:`No puedes agregar, la marca ${marcaConsumibleValidate.marca_consumible} esta inactiva`,
        redirect:"/admin/consumibles"
    })
}


//? POST


    const [addConsumible]=  await pool.query("insert into consumibles SET ?", [{tipo_consumible:parseTipo, marca_consumible:parseMarca, consumible:consumible.toUpperCase(), estado}])

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
    

    const {tipo_consumible, estado}= req.body

    const [tipoSearch]= await pool.query("select id_tipo_consumibles, tipo_consumible from tipo_consumibles where tipo_consumible = ?", [tipo_consumible.toUpperCase()])


    if(tipoSearch.length > 0){
        
        return res.status(400).json({
            ok:false,
            message:`Ya existe el tipo ${tipo_consumible} de Consumible`,   
            redirect:"/admin/consumibles"
        })
    }


    const [addTipoConsumible]=  await pool.query("insert into tipo_consumibles SET ?", [{tipo_consumible:tipo_consumible.toUpperCase(), estado}])

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
    

    const {marca_consumible, estado}= req.body

    const [marcaSearch]= await pool.query("select id_marca_consumible, marca_consumible from marca_consumibles where marca_consumible = ?", [marca_consumible.toUpperCase()])


    if(marcaSearch.length > 0){
        
        return res.status(400).json({
            ok:false,
            message:`Ya existe la Marca ${marca_consumible} de Consumible`,
            redirect:"/admin/consumibles"
        })
    }


    const [addTipoConsumible]=  await pool.query("insert into marca_consumibles SET ?", [{marca_consumible:marca_consumible.toUpperCase(), estado}])

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

//? LIST SELECT
const [marcaConsumibles]= await pool.query("select id_marca_consumible, marca_consumible from marca_consumibles where estado= 'ACTIVO'")

const [tiposConsumibles]= await pool.query("select id_tipo_consumibles, tipo_consumible from tipo_consumibles where estado= 'ACTIVO'")



const [consumibleSearch]= await pool.query("select c.id_consumible, t.tipo_consumible, m.marca_consumible, c.consumible, c.estado from consumibles c inner join tipo_consumibles t on t.id_tipo_consumibles = c.tipo_consumible inner join marca_consumibles m on m.id_marca_consumible = c.marca_consumible where c.id_consumible= ?",[id])


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
                },{
                    type:"select",
                    placeholder:"Escribe el estado del usuario...",
                    name:"estado",
                    id:"estadoEdit",
                    labelTitle:"Estado:",
                    value:consumibleSearch[0].estado,
                    options:[{value:"ACTIVO", valueText:"Activo"},{value:"INACTIVO", valueText:"Inactivo"}]
                }
                
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

const [tipoSearch]= await pool.query("select id_tipo_consumibles, tipo_consumible, estado from tipo_consumibles where id_tipo_consumibles= ?",[id])


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
                },{
                    type:"select",
                    placeholder:"Escribe el estado del usuario...",
                    name:"estado",
                    id:"estadoEdit",
                    labelTitle:"Estado:",
                    value:tipoSearch[0].estado,
                    options:[{value:"ACTIVO", valueText:"Activo"},{value:"INACTIVO", valueText:"Inactivo"}]
                }
                
            ]

    })


})




//TODO EDIT MARCA CONSUMIBLE

routeAdmin.get("/consumibles/marca/edit/:id", isAuthLogin(1), async (req, res)=>{

const id= parseInt(req.params.id)

const [idMarcas]= await pool.query("select id_marca_consumible, marca_consumible from marca_consumibles")

const numbers= idMarcas.map(t => t.id_marca_consumible)

if(!numbers.includes(id)){
    
    return res.status(400).json({
        ok:false,
        message:"La Marca de consumible no existe",
        redirect:"/admin/consumibles"
    })
    
    
}

const [marcaSearch]= await pool.query("select id_marca_consumible, marca_consumible, estado from marca_consumibles where id_marca_consumible= ?",[id])


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
                    value:marcaSearch[0].marca_consumible,
                },{
                    type:"select",
                    placeholder:"Escribe el estado del usuario...",
                    name:"estado",
                    id:"estadoEdit",
                    labelTitle:"Estado:",
                    value:marcaSearch[0].estado,
                    options:[{value:"ACTIVO", valueText:"Activo"},{value:"INACTIVO", valueText:"Inactivo"}]
                }
                
            ]

    })




})









//TODO UPDATE CONSUMIBLE

routeAdmin.post("/consumibles/consumible/edit/:id", isAuthLogin(1), bodyValidateConsumible, async (req, res)=>{


const id= parseInt(req.params.id)

const {consumible, tipo_consumible, marca_consumible, estado}= req.body

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


//TODO VALIDATE ESTADO TIPOS AND MARCA CONSUMIBLE

const [[tipoConsumibleValidate]]= await pool.query("select tipo_consumible, estado from tipo_consumibles where id_tipo_consumibles= ?", [parseTipo])

const [[marcaConsumibleValidate]]= await pool.query("select marca_consumible, estado from marca_consumibles where id_marca_consumible= ?",[parseMarca])


if(tipoConsumibleValidate.estado === "INACTIVO"){

    return res.status(400).json({
        ok:false,
        message:`No puedes modificar, el tipo ${tipoConsumibleValidate.tipo_consumible} esta inactivo`,
        redirect: "/admin/consumibles"
    })
}


if(marcaConsumibleValidate.estado==="INACTIVO"){

    return res.status(400).json({
        ok:false,
        message:`No puedes modificar, la marca ${marcaConsumibleValidate.marca_consumible} esta inactiva`,
        redirect:"/admin/consumibles"
    })
}



//? update
const [updateConsumible]= await pool.query("update consumibles set ? where id_consumible= ?", [{tipo_consumible: parseTipo, marca_consumible: parseMarca, consumible: consumible.toUpperCase(), estado}, id])


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

const {tipo_consumible, estado}= req.body

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


const [updateTipo]= await pool.query("update tipo_consumibles set ? where id_tipo_consumibles= ?", [{tipo_consumible:tipo_consumible.toUpperCase(), estado}, id])


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

const {marca_consumible, estado}= req.body

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


const [updateTipo]= await pool.query("update marca_consumibles set ? where id_marca_consumible= ?", [{marca_consumible:marca_consumible.toUpperCase(), estado}, id])


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




 





















export default routeAdmin