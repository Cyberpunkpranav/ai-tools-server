import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join(process.cwd(), "assets", "prescriptions");
// Ensure "assets/prescriptions" folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true }); // Creates nested folders if needed
}
// Configure multer (Store images in "uploads/" directory)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath); // Ensure folder exists
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    cb(null, file.originalname + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage });
export default upload