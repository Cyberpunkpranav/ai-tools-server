import puppeteer from "puppeteer";
import fs from 'fs';
import useragents from "./useragents/useragents.js";
import { SafeExtract } from "./utils/utils.js";
//http://72831b30c03d4e0080d86ffb1a67dcc8d7c264b284f:@proxy.scrape.do:8080

async function Naukri(){
    let jobsarr= [];
    const TARGET_URL = encodeURIComponent('https://www.naukri.com');
    const SCRAPE_DO_URL = `http://api.scrape.do/?token=${process.env.SCRAPE_DO_TOKEN}&url=${TARGET_URL}`;
  
    const browser = await puppeteer.launch({
        executablePath: "/usr/bin/google-chrome",
        headless: false, // Set to false if you want to see the browser
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        
    });
    const page = await browser.newPage()
    // console.log('useragent',`${useragents[Math.floor(Math.random()*useragents.length)]}`)
    await page.setUserAgent(`${useragents[Math.floor(Math.random()*useragents.length)]}`);
    await page.goto(SCRAPE_DO_URL, { waitUntil: 'networkidle2', timeout: 60000 })    
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
    
    for (let i=0;i<jobs.length;i++){
        const [newPage] = await Promise.all([
            new Promise(resolve => page.once('popup', resolve)), // Wait for the new tab
            jobs[i].click() // Click to open the new tab
        ]);        
         await newPage.waitForSelector('h1');
         const job_title = await newPage.$eval('h1', element => element.textContent);
         const job_url = newPage.url(); // Get the current URL of the new tab 

         await newPage.waitForSelector('[class*="styles_jd-header-comp-name"] a');
         const company_name = await newPage.$eval('[class*="styles_jd-header-comp-name"] a', el => el.textContent);

        //  await newPage.waitForSelector('[class*="styles_rating-wrapper"] a');
        //  const ratings_url = await newPage.$eval('[class*="styles_rating-wrapper"] a', el => el.href);
         
        //  await newPage.waitForSelector('[class*="styles_amb-rating"]');
        //  const company_ratings = await newPage.$eval('[class*="styles_amb-rating"]', el => el.textContent);

        await newPage.waitForSelector('[class*="styles_jhc__exp__"] span');
        const experience = await newPage.$eval('[class*="styles_jhc__exp__"] span',e=>e.textContent)

        await newPage.waitForSelector('[class*="styles_jhc__salary"] span');
        const salary_package = await newPage.$eval('[class*="styles_jhc__salary"] span',e=>e.textContent)

        await newPage.waitForSelector('[class*="styles_jhc__location"] a');
        const location = await newPage.$eval('[class*="styles_jhc__location"] a', el => el.textContent);

        await newPage.waitForSelector('[class*="styles_jhc__stat"]');
        const stats = await newPage.$$eval('[class*="styles_jhc__stat"]', elements =>
            elements.map(el => ({
                label: el.querySelector('label')?.textContent.trim(),  // Get the label text
                value: el.querySelector('span:last-child')?.textContent.trim() // Get the last span text
            }))
        );
        await newPage.waitForSelector('[class*="styles_JDC__dang-inner-html"]');
        const JD_HTML = await newPage.$eval('[class*="styles_JDC__dang-inner-html"]', el => el.innerHTML);

        await newPage.waitForSelector('[class*="styles_other-details"]');
        const other_details_HTML = await newPage.$eval('[class*="styles_other-details"]', el => el.innerHTML);
        
        await newPage.waitForSelector('[class*="styles_education"]');
        const education_html = await newPage.$eval('[class*="styles_education"]', el => el.innerHTML);
        
        await newPage.waitForSelector('[class*="styles_key-skill"]');
        const key_skills = await newPage.$$eval('[class*="styles_key-skill"] span', elements => 
            elements.map(el =>el.textContent.trim())
        );
        

        await newPage.waitForSelector('[class*="styles_detail"]');
        const company_details = await newPage.$eval('[class*="styles_detail"]', el => el.textContent);
        
        // await newPage.waitForSelector('[class*="styles_comp-info-detail"] a');
        // const company_website = await newPage.$eval('[class*="styles_comp-info-detail"] a', el => el.href);

        // await newPage.waitForSelector('[class*="styles_comp-info-detail"] a');
        // const company_address = await newPage.$eval('[class*="styles_comp-info-detail"]:nth-of-type(2) span', el => el.textContent.trim());

        let job = {
            job_title:job_title,
            url:job_url,
            site:'naukri.com',
            experience:experience,
            salary_package:salary_package,
            location:location,
            stats:stats,
            job_description:JD_HTML,
            other_details:other_details_HTML,
            education:education_html,
            key_skills:key_skills,
            
            company:{
                name:await SafeExtract(newPage,'[class*="styles_about-company"] > div:first-child','textContent',3000),
                details:company_details,
                review:{
                ratings: await SafeExtract(newPage,'[class*="styles_amb-rating"]','textContent',3000),
                url:  await SafeExtract(newPage,'[class*="styles_rating-wrapper"] a','href',3000)
                },
                website:await SafeExtract(newPage,'[class*="styles_comp-info-detail"] a','href',3000),
                address:await SafeExtract(newPage,'[class*="styles_comp-info-detail"]:nth-of-type(2) span','textContent',3000)
            }
        }
        console.log(i,job);
        
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