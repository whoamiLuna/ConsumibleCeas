import { body } from "express-validator";




const bodyValidateTiposConsumuibles=[
    body("tipo_consumible").escape().trim().notEmpty().withMessage("El tipo de consumible no debe estar vacio"),
    body("estado").notEmpty().withMessage("El estado no debe estar vacio").trim().escape().isIn(["ACTIVO", "INACTIVO"]).withMessage("El estado debe ser ACTIVO o INACTIVO")
]


export default bodyValidateTiposConsumuibles