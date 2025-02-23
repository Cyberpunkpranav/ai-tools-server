import mongoose from "mongoose";
import Naukri from "../scrapping/jobs.js";

async function AllJobs(req, res, next) {
    try {
        const myDB = mongoose.connection.useDb("mydatabase"); // Switch to "mydatabase"
        const jobsCollection = myDB.collection("jobs");
        const data = await jobsCollection.find({}).toArray(); // Await and convert cursor to an array
        // console.log("data", data);
        res.status(200).json({ success: true, response: data });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ success: false, message: "Error fetching jobs", error: error.message });
    }
}

async function ScrapNaukriJobs(){
    const data = await Naukri()
    const myDB = mongoose.connection.useDb(process.env.MONOGDB_NAME)
    const jobsCollection = myDB.collection("jobs")
    await jobsCollection.deleteMany({})
    const res = await jobsCollection.insertMany(data)
    console.log(res)

}
export { AllJobs ,ScrapNaukriJobs };
