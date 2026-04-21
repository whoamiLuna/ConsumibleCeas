import { body } from "express-validator";


const bodyValidateMarcasEquipos=[
    body("marca_equipo").trim().escape().notEmpty().withMessage("La marca del equipo no debe estar vacio")
]


export default bodyValidateMarcasEquipos

