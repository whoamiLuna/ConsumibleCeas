import { body } from "express-validator";


const bodyValidateDirecciones=[
    body("direccion").trim().escape().notEmpty().withMessage("La direccion no debe ir vacia"),
    body("estado").notEmpty().withMessage("El estado no debe estar vacio").trim().escape().isIn(["ACTIVO", "INACTIVO"]).withMessage("El estado debe ser ACTIVO o INACTIVO")
]


export default bodyValidateDirecciones