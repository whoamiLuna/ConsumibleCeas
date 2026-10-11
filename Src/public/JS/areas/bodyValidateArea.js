import { body } from "express-validator";


const bodyValidateAreas=[
    body("area").trim().escape().notEmpty().withMessage("El area no debe estar vacia"),
    body("direccion").trim().escape().notEmpty().withMessage("Debe seleccionar una direccion"),
    body("estado").notEmpty().withMessage("El estado no debe estar vacio").trim().escape().isIn(["ACTIVO", "INACTIVO"]).withMessage("El estado debe ser ACTIVO o INACTIVO")
]


export default bodyValidateAreas