
import { validationResult } from "express-validator";



function  validateExpressErrors(redirect){
    
    return (req,res, next)=>{
        const erros = validationResult(req)

        if (!erros.isEmpty()){
            const msg= erros.array().map(err =>  err.msg)

        return res.status(400).json({
                ok:false,
                messageValidator: msg,
                redirect
            })
            
        
        }else{
            return next()
        }
    }
}


export default validateExpressErrors
