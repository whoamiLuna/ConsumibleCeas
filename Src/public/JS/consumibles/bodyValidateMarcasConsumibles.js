import { body } from "express-validator";



const bodyValidateMarcasConsumibles=[
    body("marca_consumible").escape().trim().notEmpty().withMessage("La marca del consumible no debe ir vacio"),
    body("estado").notEmpty().withMessage("El estado no debe estar vacio").trim().escape().isIn(["ACTIVO", "INACTIVO"]).withMessage("El estado debe ser ACTIVO o INACTIVO")
]


export default bodyValidateMarcasConsumibles