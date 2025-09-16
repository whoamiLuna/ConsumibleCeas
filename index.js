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
import router from "./Src/Router/router.js"
import RouterAuth from "./Src/Router/autenticateLogin.js"
import keysDb from "./Src/Helpers/dbData.js"
import "./Src/Helpers/passport.js"
import routeCapturista from "./Src/Router/capturista.js"
import routeAdmin from "./Src/Router/admin.js"

//todo app
const app=express()
const rutePath=dirname(fileURLToPath(import.meta.url))

//?morgan personalizado ip detect


morgan.token("ip_adress", (req)=>{
    req.socket?.remoteAddress ?? "Ip desconcida"

})

const formatIp= ':ip_adress - :method :url :status :res[content-length] - :response-time ms'




//?settings
app.set("view engine", "pug")
app.set("views", join(rutePath, "Src/views"))


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


//?inicializate sessions and flash
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())


//?globals

app.use((req,res,next)=>{
    res.locals.errorMessage= req.flash("ErrorMessage") || []
    res.locals.errorFormAuth= req.flash("ErrorFormAuth")
    res.locals.successMessage= req.flash("successMessage") || []
    res.locals.user=req.user
    
    next()


})



//*middlewares and routers
app.use(express.static(join(rutePath, "Src/public")))
app.use(json())
app.use(urlencoded({extended:false}))
app.use(morgan(formatIp))
app.use(router)
app.use("/login",RouterAuth)
app.use("/capture",routeCapturista)
app.use("/admin", routeAdmin)





//todo run app
app.listen(3000,function(req,res){
const adress= this.address()
console.log(`app run: ip servidor ${adress.address} y puerto ${adress.port}`)

})