import { body } from "express-validator";



const bodyValidateConsumible=[
body("tipo_consumible").escape().trim().notEmpty().withMessage("El tipo de consumible no debe ir vacio"),
body("marca_consumible").escape().trim().notEmpty().withMessage("La marca del consumible no deber ir vacio"),
body("consumible").escape().trim().notEmpty().withMessage("El consumible no deber ir vacio")
]



export default bodyValidateConsumible