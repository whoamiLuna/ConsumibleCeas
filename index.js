import express from "express"
import { join, dirname } from "path"
import mysqlSessions from "express-mysql-session"
import sessions from "express-session"
import pool from "./Src/Helpers/conecctionsdb"
import { fileURLToPath } from "url"
import { json, urlencoded } from "body-parser"
import morgan from "morgan"


//todo app
const app=express()
const rutePath=dirname(fileURLToPath(import.meta.url))

//?morgan personalizado ip detect

morgan.token("ip_adress", (req)=>{
    req.socket.remoteAddress

})

const formatIp= ':ip-adress - :method :url :status :res[content-length] - :response-time ms'




//?settings
app.set("view engine", "pug")
app.set("views", join(rutePath, "views"))


//?sessions MYSQL
const MysqlStore= mysqlSessions(sessions)
app.use(sessions({
    saveUninitialized:false,
    resave:false,
    secret:"conexion_db",
    store:new MysqlStore(sessions)
}))


//*middlewares 
app.use("static",join(rutePath, "public"))
app.use(json())
app.use(urlencoded({extended:false}))
app.use(morgan(formatIp))







//todo run app
app.listen(3000,(req,res)=>{

console.log(`app run: ip servidor ${req.socket.localAddress} y puerto ${req.socket.localPort}`)

})