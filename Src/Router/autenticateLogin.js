import { Router } from "express";
import passport from "passport";
import bodyValidateLogin from "../public/JS/login/BodyValidateLogin.js";
import validateExpressErrors from "../Helpers/expressValidatorErrors.js";
import bodyValidateAddUsers from "../public/JS/admin/bodyValidateAddUsers.js";


const RouterAuth= Router()


//todo ROLES CONTROLS

RouterAuth.get("/roles",(req,res)=>{

if(!req.isAuthenticated()) return res.redirect("/")

const {role} = req.user

switch (role) {
    case 1:
        return res.redirect("/admin")
    case 2:
        return res.redirect("/capture")
    case 3: 
    return res.redirect("/user")

    default:
        return res.redirect("/404")
}

})


//TODO LOGOUT SESSION MANUAL
RouterAuth.get("/logOut",(req,res)=>{
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.redirect("/");
        });
    });

})







//?form login
RouterAuth.get("/",(req,res,next)=>{
    
        if (req.isAuthenticated()) {
        return res.redirect("/roles");}

        res.render("autenticate/login.pug",{
        description:"INICIAR SESION EN CONSUMIBLES CEAS",
        Script: "JS/login/loginJs.js",
        titles:"LOGIN",
        navItems:[{
            class_icon: "fas fa-sign-in-alt",
            spanTitle: "Iniciar Sesion",
            hrefNav:"/",
        }],
        inputs:[{
            type:"text",
            placeholder:"Escribe tu nombre de Usuario",
            name:"username",
            id:"username",
            labelTitle:"Usuario:",
            
        },{
            type:"password",
            placeholder:"Escribe tu contraseña",
            name:"password",
            id:"password",
            labelTitle:"Contraseña:"
        }],
        titleForm:"INICIAR SESION", 
        valueBtn:"Iniciar",
        formId: "formLogin",
        titleHeadForm: " ",
        idEdit: " "
    
    })
    

})










//todo post passport and validate login users MYSQL 8

RouterAuth.post("/",
    bodyValidateLogin,
    validateExpressErrors("/"),
    (req,res, next)=>{
        passport.authenticate("local.login",(err,user, info)=>{
                
             if (err) return next(err);

            if (!user) {
                return res.status(400).json({
                    ok:false,
                    message: info.message,
                    redirect:"/"
                })

            }

            req.logIn(user, (err) => {
                if (err) return next(err);

                    return res.status(200).json({
                        ok:true,
                        message:`Iniciaste Sesion ${user.fullname}`,
                        redirect:"/roles"
                    })
            }); 

        })(req, res, next);



        })
            
     










//todo post passport and validate singup add users 

 
RouterAuth.post("/signUp",
    bodyValidateAddUsers,
    validateExpressErrors("/admin/users"),
    (req, res,next)=>{
        passport.authenticate("local.signup",(err, user, info)=>{
            
            if(err) return next(err)

            if(!user){
               return  res.status(400).json({
                    ok:false,
                    message:info.message,
                    redirect:"/admin/users"
                })
            }else

               return  res.status(200).json({
                    ok:true,
                    message:info.message,
                    redirect: "/admin/users"
                })
            
        
        })(req,res,next)
        
        
    }


)









//?restrict
RouterAuth.get("/restrict",(req,res)=>{

    res.send("NO autorizado")
})






export default RouterAuth
