import { body } from "express-validator";


const  bodyValidateAddUsers=[
     body("user").withMessage("Debe contener un nombre de usuario").notEmpty().trim().escape(),
     body("fullname").withMessage("Debe contener un nombre completo").notEmpty().trim().escape(),
     body("password").withMessage("Debe contener una contraseña").notEmpty().trim().escape(),
     body("role").withMessage("Debe contener una contraseña").notEmpty().trim().escape()
]


export default bodyValidateAddUsers