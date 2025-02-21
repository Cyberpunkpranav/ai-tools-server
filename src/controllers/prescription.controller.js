import path from 'path';
import sql from '../../config/database/sql.js';
import preprompt from '../preprompts/prescription.js';
import { gemini } from '../utils/gemini.js';
import fs from 'fs';

 const GetPrescriptionResponse=async(req,res,next) => {
    // const UserInput = req.body.prompt
    // const Image  = req.body.image
    const UserInput = req.body.prompt;
    const Image = req.file ? req.file : null;
    console.log('request',req);
    try {
      // if (!UserInput) {
      //   return res.status(400).json({ error: "User input is required" });
      // }  
      const geminiResponse = await gemini(`${preprompt}\n${UserInput}`,Image)
      console.log(geminiResponse);

      const file_name = req.file.originalname + '_response'
      const uploadPath = path.join(process.cwd(), "assets", "prescriptions_responses");
      const prescription_filename =  req.file.originalname + path.extname(req.file.originalname)
      console.log(file_name);
      fs.writeFile(`${uploadPath}/${file_name}.txt`,geminiResponse,(err)=>{
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log("File written successfully!");
        }
      })
      if (!geminiResponse) {
        return res.status(500).json({ error: "Failed to get response from AI" });
      }
      const connection = await sql.getConnection();
      try{
      const query = `INSERT INTO prescriptions (prompt,prescription,response) VALUES (?,?,?)`
      const [result]= await connection.execute(query,[UserInput,prescription_filename,`${file_name}.txt`])
      console.log("Database Insert Success:", result);
      res.status(200).json({ success: true, response: geminiResponse });
      }
      finally{
        connection.release(); // Always release connection
      }
      
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }

  export {GetPrescriptionResponse}