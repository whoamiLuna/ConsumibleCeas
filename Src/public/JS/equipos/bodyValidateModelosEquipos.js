import { body } from "express-validator";

const bodyValidateModelosEquipos= [
    body("modelo").trim().escape().notEmpty().withMessage("El modelo de equipo no debe ir vacio"),
    body("marca_equipo").trim().escape().notEmpty().withMessage("La marca del equipo no debe ir vacio"),
    body("estado").notEmpty().withMessage("El estado no debe estar vacio").trim().escape().isIn(["ACTIVO", "INACTIVO"]).withMessage("El estado debe ser ACTIVO o INACTIVO")
]


export default bodyValidateModelosEquipos