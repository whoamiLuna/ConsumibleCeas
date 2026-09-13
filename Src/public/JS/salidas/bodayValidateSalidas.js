import { body } from "express-validator";



const bodyValidateSalidas= [

    //? validate status 
     
    body("status_salida").escape().trim().notEmpty().withMessage("El status no debe ir vacio").isIn(["PENDIENTE", "VERIFICADO"]).withMessage("Salida Anulada"),

    //? validate select insert

    body("consumibles").isArray({min:1}).withMessage("Los campos del consumible no debe ir vacio"),

    //? validate array item
    
    body("consumibles.*.id_consumible").trim().notEmpty().withMessage("EL consumible no debe ir vacio").isInt({min:1}).withMessage("Consumible no valido").toInt(),
    
    //? validate array Item
    
    body("consumibles.*.cantidad").trim().notEmpty().withMessage("La cantidad no debe ir vacia").isInt({min:1}).withMessage("La cantidad debe ser mayor a 1").toInt(),

    //?validate equipos array

    body("equipos").notEmpty().withMessage("Debe haber almenos un equipo")

]


export default bodyValidateSalidas