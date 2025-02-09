import express from 'express';
import { GetPrescriptionResponse } from '../controllers/prescription.controller.js';
import upload from '../../middleware/multer.mjs';

const router = express.Router();

// Example route to fetch data from the database
router.post('/prescriptions',upload.single('image'),GetPrescriptionResponse);

export default router;