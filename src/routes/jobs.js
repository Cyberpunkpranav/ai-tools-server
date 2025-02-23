import express from 'express';
import { AllJobs, ScrapNaukriJobs } from '../controllers/jobs.controller.js';

const router = express.Router();

// Example route to fetch data from the database
router.get('/jobs',AllJobs);
router.get('/scrap/jobs',ScrapNaukriJobs)

export default router;