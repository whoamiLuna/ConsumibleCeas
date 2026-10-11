import { body } from "express-validator";


const bodyValidateTiposEquipos = [
    body("modelo_equipo").trim().escape().notEmpty().withMessage("El modelo de equipo no debe ir Vacio"),
    body("tipo_de_equipo").trim().escape().notEmpty().withMessage("El tipo de equipo no debe ir vacio"),
    body("consumibles").notEmpty().withMessage("El consumible no debe ir vacio").trim().escape(),
    body("estado").notEmpty().withMessage("El estado no debe estar vacio").trim().escape().isIn(["ACTIVO", "INACTIVO"]).withMessage("El estado debe ser ACTIVO o INACTIVO")
]


export default bodyValidateTiposEquipos 