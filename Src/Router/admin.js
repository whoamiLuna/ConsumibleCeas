import { Router } from "express";
import pool from "../Helpers/conecctionsdb.js";
import isAuthLogin from "../Helpers/isAutenticate.js";

const routeAdmin= Router()



routeAdmin.get("/",isAuthLogin(1),(req,res)=>{
    
res.send(`bienvenido Admin ${req.user.username}`)

    
})



export default routeAdmin