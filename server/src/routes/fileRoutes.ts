import express from 'express';
import multer from 'multer';
import { fileReadController } from '../controllers/fileReadController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), fileReadController);

export default router;