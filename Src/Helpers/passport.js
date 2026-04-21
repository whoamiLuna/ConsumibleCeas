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
     return done(null,false,{message:`El usuario ${username} o el nombre de usuario ${fullname} ya existen, intente con un nuevo usuario` })
}

const encrypt = await encryptPassword(password)


if(!encrypt){
     return done(null,false,{message: "Hubo un error en la encriptacion de la contraseña, intente de nuevo"})
}


     const newUser= {
          username,
          password: encrypt,
          fullname,
          role
          }

          
          try {
               
               const [userAdd] = await pool.query("insert into users set ?", [newUser])

               if(userAdd.affectedRows > 0){
                    
                        const userSession= {
                        ...newUser,
                        id_user: userAdd.insertId
                       }
                       return done(null, {created:true},{message: `El usuario ${username} se ha creado satisfactoriamente`})
                   }else{
                         return done(null,false,{message: "Error al crear al usuario en la base de datos"}) 
                   }

          } catch (err) {
              console.log(err)
               
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
          
          return done(null,false,{message: "Contraseña incorrecta, vuelve a intentarlo"})
               
     }
          
}else{
      return done(null, false,{message: `El usuario ${username} no existe, intente de nuevo`})
}

}))  