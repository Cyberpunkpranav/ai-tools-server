import mongoose from "mongoose";

async function MongoDB(){
    try {
        const conn = mongoose.connect(process.env.MONOGODB_URL,{
            user:process.env.MONGO_USER,
            pass:process.env.MONGO_PASS,
            maxPoolSize: 10,
            minPoolSize: 5
        })
        console.log(`✅ MongoDB Connected`,(await conn).connection.host);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1)
    }

}

export default MongoDB