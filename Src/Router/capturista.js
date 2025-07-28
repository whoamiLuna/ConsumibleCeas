
import { Router } from "express";
import pool from "../Helpers/conecctionsdb.js";
import isAuthLogin from "../Helpers/isAutenticate.js";



const routeCapturista= Router()


routeCapturista.get("/",isAuthLogin(2),(req, res)=>{
    
    res.send("capturista")
})







export default routeCapturista