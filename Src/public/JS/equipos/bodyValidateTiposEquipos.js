import { body } from "express-validator";


const bodyValidateTiposEquipos = [
    body("modelo_equipo").trim().escape().notEmpty().withMessage("El modelo de equipo no debe ir Vacio"),
    body("tipo_de_equipo").trim().escape().notEmpty().withMessage("El tipo de equipo no debe ir vacio")
]


export default bodyValidateTiposEquipos