import { body, validationResult } from "express-validator";




const validateBodyPost= bodyValidate=>{
    
    const middleware= [
        ...bodyValidate,
        (req, res, next)=>{
            const errors= validationResult(req)
            if(!errors.isEmpty()){
                const errorMsg= errors.array().map(err=> err.msg)
                req.flash("ErrorFormAuth",errorMsg)
                return res.redirect("/login")
            }
            next()
        }

    ]

    return middleware



}


export default validateBodyPost