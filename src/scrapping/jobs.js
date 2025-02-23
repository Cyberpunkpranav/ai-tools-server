import puppeteer from "puppeteer";
import fs from 'fs';
import useragents from "./useragents/useragents.js";
//http://72831b30c03d4e0080d86ffb1a67dcc8d7c264b284f:@proxy.scrape.do:8080

async function Naukri(){
    let jobsarr= [];
    const TARGET_URL = encodeURIComponent('https://www.naukri.com');
    const SCRAPE_DO_URL = `http://api.scrape.do/?token=${process.env.SCRAPE_DO_TOKEN}&url=${TARGET_URL}`;
  
    const browser = await puppeteer.launch({
        // executablePath: "/usr/bin/google-chrome",
        headless: false, // Set to false if you want to see the browser
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        
    });
    const page = await browser.newPage()
    // console.log('useragent',`${useragents[Math.floor(Math.random()*useragents.length)]}`)
    await page.setUserAgent(`${useragents[Math.floor(Math.random()*useragents.length)]}`);
    await page.goto(SCRAPE_DO_URL, { waitUntil: 'load' })    
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
         const job_url = newPage.url(); // Get the current URL of the new tab
         const links = await newPage.$$eval('#job_header a', anchors => 
            anchors.map((a) => ({link:a.href,title:a.title,text:a.textContent})) // Extract all href attributes
        );
        const experience = await newPage.$$eval('[class*="styles_jhc__exp"] span',e=>e.textContent.trim())
        const salary_package = await newPage.$$eval('[class*="styles_jhc__salary"] span',e=>e.textContent.trim())
        const location = await page.$eval('[class*="styles_jhc__location"]', el => el.textContent.trim());
        const stats = await page.$$eval('.[class*="styles_jhc__stat"]', elements =>
            elements.map(el => ({
                label: el.querySelector('label')?.textContent.trim(),  // Get the label text
                value: el.querySelector('span:last-child')?.textContent.trim() // Get the last span text
            }))
        );
        let job = {
            job_title:job_title,
            url:job_url,
            site:'naukri.com',
            links:links,
            experience:experience,
            salary_package:salary_package,
            location:location,
            stats:stats
        }
        jobsarr.push(job)
         await newPage.close();
        }

        // console.log(jobsarr)
    // const jsonData = JSON.stringify(jobsarr, null, 2);
    // Write to a file (job_data.json)
    // fs.writeFileSync('job_data.json', jsonData, 'utf-8');
    await browser.close();
    return jobsarr

}


export default Naukri