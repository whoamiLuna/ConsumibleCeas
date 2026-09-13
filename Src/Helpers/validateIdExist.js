


async function validateIdExist({table, column_name, idField, validateStock= false, arrayData, connection}) {
    

    const ids= arrayData.map(data => Number(data[idField]))

    const idsSet= new Set(ids)


    //?id repeat

    if(ids.length > idsSet.size){
        return {
            ok:false,
            message:"Hay un dato duplicado",
        }
    }
    
    //? id exist in table
    
    const [idExist]= await connection.query(`select ${column_name} from ${table} where ${column_name} in (?)`, [ids])

    //*finding duplicate sizes
    

    const idExistFound= idExist.map( id => id[column_name])


    if (idExistFound.length !== ids.length){
        
        return {
            ok:false,
            message:"Hay un dato no existente en la base de datos"
        }
    }



    if(validateStock){
        

        const [validateStockIds]= await connection.query(`select ${column_name}, cantidad  from  stock where ${column_name} in (?) for update`, [ids])

        //?validate id consumibles scope in stock id exist values 
        if(ids.length !== validateStockIds.length){
            
            return {
                ok:false,
                message:"Existe un consumible sin registros de entradas"
            }

        }

        for(const consumible of arrayData){

            //? find consumible in stock array pure
            const consumibleStockFind= validateStockIds.find(id => id.id_consumible === Number(consumible.id_consumible))

            if(!consumibleStockFind){
                
                return {
                    ok:false,
                    message:`No hay registro de entradas del consumible`
                }
            }

            if(Number(consumible.cantidad) > consumibleStockFind.cantidad){
                
                return {
                    ok:false,
                    message:`Hay stock insuficiente del consumible`
                }
            }


        }

        
    }
    
    
    return {
        ok:true
    }
    


}


export default validateIdExist