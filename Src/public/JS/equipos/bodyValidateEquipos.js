import { body } from "express-validator";



const bodyValidateEquipos= [
    body("tipo_equipo").escape().trim().notEmpty().withMessage("El tipo de equipo no debe ir vacio"),
    body("serie").escape().trim().notEmpty().withMessage("La serie no debe ir vacio"),
    body("inventario").escape().trim().notEmpty().withMessage("El inventario no debe ir vacio"),
    body("estado_equipo").escape().trim().notEmpty().withMessage("El estado de equipo no debe ir vacio"),
    body("area").escape().trim().notEmpty().withMessage("El area no debe ir vacio"),
    body("observaciones").escape().trim().notEmpty().withMessage("La observacion no debe ir vacio"),
]



export default bodyValidateEquipos