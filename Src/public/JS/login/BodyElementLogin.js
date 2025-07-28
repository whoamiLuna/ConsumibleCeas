import { body } from "express-validator";



const bodyElementsLogin = [
    body("username").notEmpty().withMessage("El campo usuario no debe estar vacio").trim().escape(),
    body("password").notEmpty().withMessage("La contraseña no debe estar vacia").trim().escape()
]

export default bodyElementsLogin        