
import { validationResult } from "express-validator";



function  validateExpressErrors(redirectTo){
    
    return (req,res, next)=>{
        const erros = validationResult(req)

        if (!erros.isEmpty()){
            const msg= erros.array().map(err =>  err.msg)
        
            req.flash("errorMessage",msg)
            return res.redirect(redirectTo)
        }else{
            return next()
        }
    }
}


export default validateExpressErrors
