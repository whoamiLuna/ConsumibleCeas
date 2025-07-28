import { createPool } from "mysql2/promise"
import keysDb from "./dbData.js"
 

const pool= createPool(keysDb)


try {
  const connection = await pool.getConnection();
  console.log("Conexión DB exitosa ✅");
  connection.release();
} catch (err) {
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("❌ PÉRDIDA DE CONEXIÓN CON LA BASE DE DATOS");
  } else if (err.code === "ER_CON_COUNT_ERROR") {
    console.error("❌ DEMASIADAS CONEXIONES");
  } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
    console.error("❌ CREDENCIALES INVÁLIDAS");
  } else if (err.code === "ER_BAD_DB_ERROR") {
    console.error("❌ LA BASE DE DATOS NO EXISTE");
  } else {
    console.error("❌ ERROR DESCONOCIDO:", err.message);
  }
}

export default pool 