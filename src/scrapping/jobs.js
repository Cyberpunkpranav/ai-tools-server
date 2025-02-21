import puppeteer from "puppeteer";
import fs from 'fs';
async function Naukri(){
    let jobsarr= [];
    const browser = await puppeteer.launch({
        executablePath: "/usr/bin/google-chrome",
        headless: false, // Set to false if you want to see the browser
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage()
    await page.goto('https://www.naukri.com')    
    await page.type('input[placeholder="Enter skills / designations / companies"]', 'Software Developer');
    await page.locator('#expereinceDD').click()
    await page.waitForSelector('.dropdownShow')
    await page.waitForSelector('.dropdown')
    await page.evaluate(() => {
        const options = [...document.querySelectorAll('.dropdown li')]
        const option = options.find(el => el.textContent.trim() === '1 year')
        if (option) option.click();
    })
    await page.type('input[placeholder="Enter location"]', 'Delhi, Mumbai')

    await page.locator('.qsbSubmit').click()

    await page.waitForSelector('.srp-jobtuple-wrapper', { visible: true });
    const jobs = await page.$$('.srp-jobtuple-wrapper');
    console.log(jobs.length)
    for (let i=0;i<jobs.length;i++){
        const [newPage] = await Promise.all([
            new Promise(resolve => page.once('popup', resolve)), // Wait for the new tab
            jobs[i].click() // Click to open the new tab
        ]);        
         await newPage.waitForSelector('h1');
         const job_title = await newPage.$eval('h1', element => element.textContent);
         const links = await newPage.$$eval('#job_header a', anchors => 
            anchors.map((a) => ({link:a.href,title:a.title})) // Extract all href attributes
        );
        let job = {
            job_title:job_title,
            links:links
        }
        jobsarr.push(job)
         await newPage.close();
        }

        console.log(jobsarr)
    await browser.close();
    const jsonData = JSON.stringify(jobsarr, null, 2);

    // Write to a file (job_data.json)
    fs.writeFileSync('job_data.json', jsonData, 'utf-8');
}


export default Naukri