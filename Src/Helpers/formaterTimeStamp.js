




function formaterTimeStamp({date}){
    
    return new Intl.DateTimeFormat("es-MX", {
        timeZone:"America/Mexico_City",
        month: "long",
        day:"numeric",
        year:"numeric",
        
    }).format(new Date(date))


}



export default formaterTimeStamp