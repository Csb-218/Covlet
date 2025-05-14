import { extname } from "path"

const validateFile = (file:any) => {

    const fileTypes = /pdf/
    const fileExtname = fileTypes.test(extname(file.originalname).toLowerCase())
    const mimetype = fileTypes.test(file.mimetype)
    return fileExtname && mimetype
}


export default validateFile