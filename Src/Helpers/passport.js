import passport from "passport";
import { Strategy } from "passport-local";
import pool from "./conecctionsdb.js";
import { encryptPassword, comparePassword } from "./brcript.js";


passport.use("local.signup",new Strategy({
     usernameField: "username",
     passwordField: "password",
     passReqToCallback: true
},async (req,username,password,done)=>{
    
const {fullname, role} = req.body


const [searchUser]= await pool.query("select username, fullname from users where username= ? OR fullname = ?",[username,fullname])


if(searchUser.length > 0){
     req.flash("errorMessage", `El usuario ${username} o el nombre de usuario ${fullname} ya existen, intente con un nuevo usuario`)
     return done(null,false)
}

const encrypt = await encryptPassword(password)


if(!encrypt){
     req.flash("errorMessage","Hubo un error en la encriptacion de la contraseña, intente de nuevo")
     return done(null,false)
}


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
             req.flash("successMessage",`El usuario ${username} se ha creado satisfactoriamente`)
             return done(null, false) 
         }else{
               req.flash("errorMessage","Error al crear al usuario en la base de datos")
               return done(null,false) 
         }
         

     
     


}))







//todo Serializar usuario

passport.serializeUser((user, done)=>{
     done(null,user.id_user)
})




//todo consulta usuario, deserializar usuario


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

     if(passwordDecrypt === true){
          return done(null,userFind)
     }else{
          req.flash("errorMessage", "Contraseña incorrecta, vuelve a intentarlo")
          return done(null,false)
     }
          
}else{
      req.flash("errorMessage", `El usuario ${username} no existe, intente de nuevo`)
      return done(null, false)
}

}))  