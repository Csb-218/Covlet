import multer from "multer"
import {extname} from "path"
import validateFile from "../utils/fileValidator"

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_FILES_ALLOWED = 1

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: {fileSize: MAX_FILE_SIZE , files: MAX_FILES_ALLOWED},
    fileFilter: (req, file, cb) => {

        // Check if the file is present in the request
        if (!file) {
            return cb(new Error('No file uploaded'))
        }
        // Check if the file type is PDF
        const isFileTyeAllowed = validateFile(file)
        if (isFileTyeAllowed) {
            cb(null, true)
        } else {
            cb(new Error('Only pdf formats are allowed'))
        }
    }
    
}).single('file')

export default upload