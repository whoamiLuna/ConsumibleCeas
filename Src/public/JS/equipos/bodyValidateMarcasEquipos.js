import { body } from "express-validator";


const bodyValidateMarcasEquipos=[
    body("marca_equipo").trim().escape().notEmpty().withMessage("La marca del equipo no debe estar vacio"),
    body("estado").notEmpty().withMessage("El estado no debe estar vacio").trim().escape().isIn(["ACTIVO", "INACTIVO"]).withMessage("El estado debe ser ACTIVO o INACTIVO")
]


export default bodyValidateMarcasEquipos

