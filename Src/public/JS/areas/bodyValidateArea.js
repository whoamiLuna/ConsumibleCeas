import { body } from "express-validator";


const bodyValidateAreas=[
    body("area").trim().escape().notEmpty().withMessage("El area no debe estar vacia"),
    body("direccion").trim().escape().notEmpty().withMessage("Debe seleccionar una direccion")
]


export default bodyValidateAreas