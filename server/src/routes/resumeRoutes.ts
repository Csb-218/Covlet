import express from 'express';
import { addResume, getResume,deleteResume } from '../controllers/resumeController';

const router = express.Router();

router.post('/add', addResume);
router.get('/:email', getResume);
router.delete('/:email', deleteResume);


export default router;