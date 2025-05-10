import express from 'express';
import { addResume, getResume,deleteResume,updateResume } from '../controllers/resumeController';

const router = express.Router();

// POST request to add a new resume
router.post('/add', addResume);
// GET request to fetch a resume by email
router.get('/:email', getResume);
// PUT request to update a resume by email
router.put('/:email', updateResume);
// DELETE request to delete a resume by email
router.delete('/:email', deleteResume);


export default router;