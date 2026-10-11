import express from "express"
import { join, dirname } from "path"
import mysqlSessions from "express-mysql-session"
import sessions from "express-session"
import pool from "./Src/Helpers/conecctionsdb.js"
import { fileURLToPath } from "url"
import { json, urlencoded } from "express"
import morgan from "morgan"
import flash from "connect-flash"
import passport from "passport"
import RouterAuth from "./Src/Router/autenticateLogin.js"
import keysDb from "./Src/Helpers/dbData.js"
import routeCapturista from "./Src/Router/capturista.js"
import routeAdmin from "./Src/Router/admin.js"
import "./Src/Helpers/passport.js"
import multer from "multer"
import routeCliente from "./Src/Router/cliente.js"


//todo app
const app=express()
const rutePath=dirname(fileURLToPath(import.meta.url))
const upload= multer()


//?morgan personalizado ip detect




//?settings
app.set("view engine", "pug")
app.set("views", join(rutePath, "Src/views"))


app.use(urlencoded({extended:true}))
app.use(json())
app.use(express.static(join(rutePath, "Src/public")))
app.use(upload.none())
app.use(morgan("dev"))


//?CACHE CLEAR 

app.use((req,res,next)=>{
    res.setHeader("Cache-Control","no-store");
    next();
})



//?sessions MYSQL
const MysqlStore= mysqlSessions(sessions)
app.use(sessions({
    saveUninitialized:false,
    resave:false,
    secret:"conexion_db",
    store:new MysqlStore({
        ...keysDb,
        clearExpired:true, //*expired force
        checkExpirationInterval: 900000,
        expiration:1000 * 60 * 60 * 3
    }),
    cookie:{
        maxAge: 1000 * 60 * 60 * 3  //? expired
    }
}))


//? inicializate flash
app.use(flash())

//?inicializate sessions
app.use(passport.initialize())
app.use(passport.session())


//?globals

app.use((req,res,next)=>{
    console.log(">>> MIDDLEWARE:", req.method, req.originalUrl);
    console.log("Body recibido:", req.body)
    res.locals.user = req.user
    next()
    
    
})



//*middlewares and routers
app.use("/",RouterAuth)    
app.use("/admin", routeAdmin)
app.use("/capturista",routeCapturista)
app.use("/client",routeCliente)




//todo run app
app.listen(3000,function(req,res){

})