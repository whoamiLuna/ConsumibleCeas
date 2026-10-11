




const validateEquiposActive= async ({equipos= null, connection, validateComplete=true, tipo_equipo= null, area= null}) => {

    
    
    if(validateComplete=== true && Array.isArray(equipos) && equipos.length  > 0){
        
        const [equiposValidate]= await connection.query("select e.id_equipo, e.tipo_equipo,t.estado as tipo_estado,m.id_marca_equipo,m.estado as marca_estado,m.marca_equipo as marca_equipo,mo.id_modelo_equipo,mo.estado as modelo_estado,m.modelo as modelo_equipo, e.area, a.estado as area_estado,a.area as areaNombre, a.direccion, d.estado as direccion_estado, d.direccion as direccionNombre from equipos e inner join tipo_equipos t on t.id_tipo_equipo = e.tipo_equipo inner join modelo_equipos mo on mo.id_modelo_equipo = t.id_modelo_equipo inner join marca_equipos m on m.id_marca_equipo = mo.id_marca_equipo inner join areas a on a.id_area = e.area inner join direcciones d on d.id_direccion = a.id_direccion where e.id_equipo in(?) for UPDATE", [equipos])

        for(let e of equiposValidate){

        //? VALIDATE CATALOGOS DE EQUIPOS


        if(e.marca_estado=== "INACTIVO"){ return { ok: false, message:`El modelo ${e.modelo_equipo} esta Inactivo`}}

        if(e.modelo_estado=== "INACTIVO"){ return { ok: false, message:`La marca ${e.marca_equipo} esta Inactivo`}}

        if(e.area_estado=== "INACTIVO"){ return { ok: false, message:`El area ${e.areaNombre} esta Inactivo`}}

        if(e.direccion_estado=== "INACTIVO"){ return { ok: false, message:`La direccion ${e.direccionNombre} esta Inactivo`}}
        
        if(e.tipo_estado=== "INACTIVO"){ return { ok: false, message:`El tipo de Equipo seleccionado esta Inactivo`}}
    
    }
    
    return {ok:true}

}else{

        const [[tipoEquipoValidate]]= await connection.query("select t.id_tipo_equipo,t.estado,t.tipo_de_equipo, m.id_modelo_equipo,m.modelo as modelo_equipo, m.estado as modelo_estado,me.id_marca_equipo, me.estado as marca_estado, me.marca_equipo as marca_equipo  from tipo_equipos t inner join modelo_equipos m on m.id_modelo_equipo = t.modelo_equipo inner join marca_equipos me on me.id_marca_equipo = m.marca_equipo where t.id_tipo_equipo = ? FOR UPDATE", [parseInt(tipo_equipo)])

        console.log(tipoEquipoValidate)

        const [[areaValidate]]= await connection.query("select a.id_area, a.estado, a.area, d.id_direccion, d.estado as direccion_estado, d.direccion as direccionNombre from areas a inner join direcciones d on d.id_direccion = a.direccion where a.id_area = ? FOR UPDATE", [parseInt(area)])

        console.log(areaValidate)

        if(tipoEquipoValidate.estado=== "INACTIVO"){ return { ok: false, message:`El tipo ${tipoEquipoValidate.tipo_de_equipo}: ${tipoEquipoValidate.modelo_equipo} esta Inactivo`}}

        if(tipoEquipoValidate.modelo_estado=== "INACTIVO"){ return { ok: false, message:`El modelo ${tipoEquipoValidate.modelo_equipo} esta Inactivo`}}

        if(tipoEquipoValidate.marca_estado=== "INACTIVO"){ return { ok: false, message:`La marca ${tipoEquipoValidate.marca_equipo} esta Inactivo`}}
        
        if(areaValidate.estado=== "INACTIVO"){ return { ok: false, message:`El area ${areaValidate.area} esta Inactivo`}}

        if(areaValidate.direccion_estado=== "INACTIVO"){ return { ok: false, message:`La direccion ${areaValidate.direccionNombre} esta Inactivo`} }


    return {ok:true}


}



  


}


export default validateEquiposActive