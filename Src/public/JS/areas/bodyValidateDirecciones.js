import { body } from "express-validator";


const bodyValidateDirecciones=[
    body("direccion").trim().escape().notEmpty().withMessage("La direccion no debe ir vacia")
]


export default bodyValidateDirecciones