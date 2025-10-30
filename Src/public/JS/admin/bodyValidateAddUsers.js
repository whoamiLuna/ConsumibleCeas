import { body } from "express-validator";


const  bodyValidateAddUsers=[
     body("username").notEmpty().withMessage("El usuario no debe estar vacio").trim().escape().isLength({max:25}).withMessage("EL nombre de usuario no debe ser mas de 25 caracteres"),
     body("fullname").notEmpty().withMessage("El fullname no debe estar vacia").trim().escape().isLength({max:100}).withMessage("El fullname no debe tener mas de 100 caracteres"),
     body("password").notEmpty().withMessage("La contraseña no debe estar vacia").trim().escape().isLength({min:6}).withMessage("La contraseña debe tener al menos 6 caracteres"),
     body("role").notEmpty().withMessage("El role no debe estar vacio").trim().escape()
]


export default bodyValidateAddUsers