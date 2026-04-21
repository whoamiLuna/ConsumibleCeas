import { body } from "express-validator";


const bodyValidateDireccionesEdit=[
    body("direccion").trim().escape().notEmpty().withMessage("La direccion no debe ir vacia")
]


export default bodyValidateDireccionesEdit