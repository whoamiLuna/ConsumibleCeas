import passport from "passport";
import { Strategy } from "passport-local";
import pool from "./conecctionsdb.js";
import { encryptPassword, comparePassword } from "./brcript.js";


passport.use("local.signup",new Strategy({
     usernameField: "password",
     passwordField: "username",
     passReqToCallback: true
},async (req,username,password,done)=>{
    
const {fullname, role} = req.body


const [searchUser]= await pool.query("select username from users where username= ?",[username])

if(!searchUser.length > 0){

     const encrypt = await encryptPassword(password)

     if(encrypt.length){
          
          const newUser= {
               username,
               password: encrypt,
               fullname,
               role
          }
          
          const [userAdd] = await pool.query("insert into users set ?", [newUser])
          
          if(userAdd.affectedRows > 0){
              
              const userSession= {
              ...newUser,
              id_user: userAdd.insertId
             }
             
             done(null, userSession,req.flash("SuccessMessage",`El usuario ${username} se ha creado satisfactoriamente`)) 
         }else{
           
          donde(null,false, req.flash("ErrorMessage","Error al crear al usuario en la base de datos")) 
         }
         


     }
     
}else{
     done(null,false, req.flash("ErrorMessage", `el usuario ${username} o fullname ya existe, intente con un usuario nuevo`))
}
     

}))


//todo Serializar usuario

passport.serializeUser((user, done)=>{
     done(null,user.id_user)
})


//todo consulta usuario


passport.deserializeUser(async(id,done)=>{
     
     const [userConsutl]= await pool.query("select * from users where id_user= ?", [id])

     userConsutl.length > 0 ? done(null,userConsutl[0]) : done(null,false)

})



//todo Login User


passport.use("local.login", new Strategy(({
     usernameField:"username",
     passwordField:"password",
     passReqToCallback:true
}),async (req,username,password, done)=>{
     
const [searchLoginUser]= await pool.query("select * from users where username= ?", [username])

if(searchLoginUser.length > 0){
     const userFind= searchLoginUser[0]
     
     const passwordDecrypt= await comparePassword(password,userFind.password)

     passwordDecrypt === true ? done(null,userFind) : done(null, false, req.flash("ErrorMessage", "Contraseña incorrecta, vuelva a intentarlo"))
          
}else{
 done(null, false, req.flash("ErrorMessage", `El usuario ${username} no existe, intente de nuevo`))
}

}))