import ExcelJS from "exceljs"


async function excelExport({name,columnsArray,dataArray,res}){
    

    const workbook= new ExcelJS.Workbook()
    const woksheet= workbook.addWorksheet(name)

    woksheet.columns= columnsArray
    woksheet.addRows(dataArray)

    res.setHeader(
        "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.setHeader(
        "Content-Disposition",`attachment; filename=${name}.xlsx` //downlodad excel force
    )

    await workbook.xlsx.write(res)
    res.end()


}


export default excelExport
