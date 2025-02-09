import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config(); // Load API key from .env

const genAI = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

export async function gemini(prompt, imagePath) {
    console.log(imagePath);
    
  try {
    let requestPayload = [prompt];

    if (imagePath) {
      const imageData = await fileToGenerativePart(imagePath.path);
      requestPayload.push(imageData);
    }

    const result = await model.generateContent(requestPayload);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

// Convert an image file to Base64 for Gemini API
async function fileToGenerativePart(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve({
        inlineData: {
          data: data.toString("base64"),
          mimeType: getMimeType(filePath)
        }
      });
    });
  });
}

// Helper function to get the correct MIME type based on file extension
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      throw new Error("Unsupported image format");
  }
}
