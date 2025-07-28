import bcrypt from "bcryptjs";


export async function encryptPassword(password){
    const numberEncript= await bcrypt.genSalt(10)
    const hash= await bcrypt.hash(password,numberEncript)
    return hash
}


export async function comparePassword(password,savePasword){
    return await bcrypt.compare(password,savePasword)

}