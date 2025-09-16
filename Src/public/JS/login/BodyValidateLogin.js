import { body } from "express-validator";



const bodyValidateLogin = [
    body("username").notEmpty().withMessage("El campo usuario no debe estar vacio").trim().escape(),
    body("password").notEmpty().withMessage("La contraseña no debe estar vacia").trim().escape()
]

export default bodyElementsLogin        