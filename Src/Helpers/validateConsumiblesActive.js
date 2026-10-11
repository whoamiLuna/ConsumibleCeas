




const validateConsumiblesActive= async (consumibles, connection) => {


    const [consumiblesValidate]= await connection.query("select id_consumible, consumible,marca_consumible,tipo_consumible, estado from consumibles where id_consumible in(?) for UPDATE ", [consumibles])

    for(let c of consumiblesValidate){

        const [[marcaConsumibleSearch]]= await connection.query("select id_marca_consumible, marca_consumible, estado from marca_consumibles where id_marca_consumible = ?", [parseInt(c.marca_consumible)])

        const [[tipoConsumibleSearch]]= await connection.query("select id_tipo_consumibles, tipo_consumible, estado from tipo_consumibles where id_tipo_consumibles = ?", [parseInt(c.tipo_consumible)])

        if(marcaConsumibleSearch.estado=== "INACTIVO"){

            return { ok: false, message:`La marca  de consumible ${marcaConsumibleSearch.marca_consumible} esta Inactivo`}
        }
        
        if(tipoConsumibleSearch.estado=== "INACTIVO"){

            return { ok: false, message:`El tipo de consumible ${tipoConsumibleSearch.tipo_consumible} esta Inactivo`}
        }

        if(c.estado=== "INACTIVO"){
    
            return { ok: false, message:`El consumible ${c.consumible} esta Inactivo`}
    
        }

    }

    return {ok: true}

}













export default validateConsumiblesActive