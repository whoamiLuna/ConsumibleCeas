import { createPool } from "mysql2/promise"
import keysDb from "./dbData.js"
 

const pool= createPool(keysDb)


pool.getConnection((err, connection)=>{
        try {
            if(err.code === "PROTOCOL_CONNECTION_LOST") throw new Error(err.sqlMessage || "PERDIDA DE CONEXION CON LA BASE DE DATOS")
            if(err.code === "ER_CON_COUNT_ERROR") throw new Error(err.sqlMessage || "CREDENCIALES NO VALIDAS")
            if(err.code === "ER_BAD_DB_ERROR") throw new Error(err.sqlMessage || "LA BASE DE DATOS NO EXISTE")

        if(connection){
            connection.release()
            console.log("conexion DB exitosa")
        }

        } catch (err) {
            console.log(err)
        }
})


export default pool 