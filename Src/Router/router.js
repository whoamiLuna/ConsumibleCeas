import { Router } from "express";


//*DESHABILITACION DE RUTA PRINCIPAL

const router= Router()

router.get("/",(req,res)=>{
    res.redirect("/login")
})



router.get("/404",(req,res)=>{
    res.send("404 NO EXISTE ESTA PAGINA")
})



export default router