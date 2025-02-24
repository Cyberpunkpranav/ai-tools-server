async function SafeExtract(page, selector, attr, timeout) {
    try {
        const element = await page.waitForSelector(selector, { timeout }).catch(() => null);
        if (!element) return null;

        if (attr === "href") {
            return await page.evaluate(el => el.href, element);
        }
        return await page.evaluate(el => el[attr].trim(), element);
    } catch (error) {
        return null; // Return null if any error occurs
    }
}
export {SafeExtract}