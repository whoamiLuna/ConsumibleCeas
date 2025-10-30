import { Router } from "express";
import passport from "passport";
import bodyValidateLogin from "../public/JS/login/BodyValidateLogin.js";
import validateExpressErrors from "../Helpers/expressValidatorErrors.js";
import bodyValidateAddUsers from "../public/JS/admin/bodyValidateAddUsers.js";


const RouterAuth= Router()


//todo ROLES CONTROLS

RouterAuth.get("/roles",(req,res)=>{

if(!req.isAuthenticated()) return res.redirect("/login")

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






//?form login
RouterAuth.get("/",(req,res,next)=>{
    req.logOut(err=>{
        if(err) return next(err)
            
        res.render("autenticate/login.pug",{
        description:"INICIAR SESION EN CONSUMIBLES CEAS",
        style:"CSS/loginForm.css",
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
        action:"/login",
        titleForm:"INICIAR SESION", 
        valueBtn:"Iniciar"
    }) })
    

})









//todo post passport and validate login

RouterAuth.post("/",
    bodyValidateLogin,
    validateExpressErrors("/login"),
    passport.authenticate("local.login",{
   successRedirect:"/login/roles",
   failureRedirect:"/login", 
   failureFlash:true 
}))









//todo post passport and validate singup

 
RouterAuth.post("/signUp",
    bodyValidateAddUsers,
    validateExpressErrors("/admin/users"),
    passport.authenticate("local.signup",{
    successRedirect:"/admin/users",
    failureRedirect:"/admin/users",
    failureFlash:true
}))









//?restrict
RouterAuth.get("/restrict",(req,res)=>{

    res.send("NO autorizado")
})






export default RouterAuth
