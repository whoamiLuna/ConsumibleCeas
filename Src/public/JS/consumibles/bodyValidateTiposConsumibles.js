import { body } from "express-validator";




const bodyValidateTiposConsumuibles=[
    body("tipo_consumible").escape().trim().notEmpty().withMessage("El tipo de consumible no debe estar vacio")
]


export default bodyValidateTiposConsumuibles