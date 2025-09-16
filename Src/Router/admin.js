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
    
    const page= parseInt(req.query.page || 1)
    const userSearch= req.query.user
    const limit= 20 //rango de busqueda
    const offset= (page -1) * limit // donde empiza la busqueda
    

    let usersAll= []
    let totalUsers=0

    if(userSearch){
     
        const [searchUsers]= await pool.query(`select u.username u.fullname, r.role from users u inner join roles r on id_role= u.id_user where r.role != "Admin" and u.fullname like ? limit ? offset ?`,[`%${userSearch}% `, limit,offset])
        
        const [[{total_users:count}]]= await pool.query(`select count(*) as total_users from users u where u.fullname like ? `,[`%${userSearch}$`])

        usersAll= searchUsers
        totalUsers= count
      
    }else{
        
        const [[{total_users:count}]]= await pool.query("select count(*) as total_users from users u inner join roles r on u.role = r.id_role where r.role !='Admin' ")

        const [users] = await pool.query("select u.username, u.fullname, r.role from users u inner join roles r on u.role = r.id_role where r.role != 'Admin' limit ? offset ? ",[limit,offset])

       usersAll= users
       totalUsers=count

    }
    
    
    
    const totalPage= Math.ceil(totalUsers/ limit)

    if (page > totalPage && totalPage > 0) res.redirect(`/users?page=${totalPage}`) //redireccion a al ultima pagina



    //todo render       
    res.render("admin/admin.pug",{
        title:"USUARIOS",
        description:"USUARIOS DE LA APLICACION",
        style:"/CSS/adminUsers.css",
        Script:"/JS/admin/adminJS.js",
        page,
        usersAll,
        totalPage,
        navItems:[{
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
        formShowAdd:{
             action:"/",
             method:"POST",
             title:"Agregar Usuario",
             valueSubmit:"Agregar Usuario", 
             selected:[{
                    id:"selectUserRole",
                    name:"role",
                    class__icon:"fas fa-user-tag",
                    defaultOption:"Selecciona un Role",
                    options:[{ value:"Capturista"},{value:"Cliente"}]
                    
             }]
        },
        formShowInputs:[{
                type:"text",
                placeholder:"Escribe un nombre de usuario",
                name:"user",
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
            placeholder:"Escribe una contraseña",
            classIcon:"fas fa-lock"            
        }],
        dataListSearch:{
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