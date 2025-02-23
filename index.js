import express from 'express';
import 'dotenv/config';
// import morgan from 'morgan';
import cors from 'cors';
// import helmet from 'helmet';
// import cookieParser from 'cookie-parser';

// Load environment variables

// Import routes
import prescriptionRoutes from './src/routes/prescription.js';
import JobRoutes from './src/routes/jobs.js'
import webpage from './src/scrapping/jobs.js'
import MongoDB from './config/database/mongoose.js';
// Create Express app
const app = express();

// Middleware
// app.use(morgan('dev'));
app.use(cors());
// app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// Use routes
app.use('/api', prescriptionRoutes)
app.use('/api',JobRoutes)
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
// webpage()
// Start the server
MongoDB()
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})