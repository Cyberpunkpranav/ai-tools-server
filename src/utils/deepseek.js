// Please install OpenAI SDK first: `npm install openai`
import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEP_SEEK_APIKEY
});
export default openai

