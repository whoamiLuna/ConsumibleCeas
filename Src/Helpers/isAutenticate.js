

export default function isAuthLogin(...role){

    return (req,res, next)=>{
        
        if(req.isAuthenticated()){

            if(role.includes(req.user.role)){
                return next()
            }else{
                console.log(`No autorizado user: ${req.user.username}`)
                return res.redirect("/login/Restrict")
            }
        }else {
        return res.redirect("/")

        }
    } 
 
}


