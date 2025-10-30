import { Router } from "express";
import pool from "../Helpers/conecctionsdb.js";
import isAuthLogin from "../Helpers/isAutenticate.js";

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
    
    const [usersFullSearch]= await pool.query("select u.fullname from users u where u.fullname != 'Administrador'") || "No hay usuarios disponibles"

    console.log(userSearch)
    let usersAll= []
    let totalUsers=0

    if(userSearch){
     
        const [searchUsers]= await pool.query(`select u.username, u.fullname, r.role from users u inner join roles r on r.id_role = u.role where r.role != "Admin" and u.fullname = ?`,[userSearch])
        
        const [[{total_users:count}]]= await pool.query(`select count(*) as total_users from users u where u.fullname like ? `,[`%${userSearch}$`])

        console.log(searchUsers)
        console.log(count)
        usersAll= searchUsers
        totalUsers= count
    }else{
        
        const [[{total_users:count}]]= await pool.query("select count(*) as total_users from users u inner join roles r on u.role = r.id_role where r.role !='Admin' ")
        
        const [users] = await pool.query("select u.username, u.fullname, r.role from users u inner join roles r on u.role = r.id_role where r.role != 'Admin' limit ? offset ? ",[limit,offset])
        
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
        usersAll,
        totalPage,
        dataHead:[ //!options table render users
            {key:"username", valueHeadText:"Usuario" },
            {key:"fullname", valueHeadText:"Nombre Completo" },
            {key:"role", valueHeadText:"Role",cellClass: (value)=> value==="Capturista" ? "Capturista" : "" || value==="Cliente" ? "Cliente" : ""},
        ],
        navItems:[{ //? icons nav render role
            class_icon: "fas fa-sign-in-alt",
            spanTitle: "Iniciar Sesion",
            hrefNav:"/",

            },
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
                hrefNav:"/admin/marcas",
            },
            {
                class_icon:"fas fa-door-open",
                spanTitle:"Cerrar Sesion",
                hrefNav:"/",
            }],  
        formShowAdd:{ //?options form show
             action:"/login/signUp",
             method:"POST",
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
        }
    })

})




export default routeAdmin