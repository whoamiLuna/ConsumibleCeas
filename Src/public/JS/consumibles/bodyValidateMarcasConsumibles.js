import { body } from "express-validator";



const bodyValidateMarcasConsumibles=[
    body("marca_consumible").escape().trim().notEmpty().withMessage("La marca del consumible no debe ir vacio")
]


export default bodyValidateMarcasConsumibles