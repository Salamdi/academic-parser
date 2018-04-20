const puppeteer = require('puppeteer');
const process = require('process');
const fs = require('fs');

async function getWordLinks(page) {
    await page.waitForSelector('div.terms-wrap')
    const wordLinks = await page.evaluate(selector => {
        const anchors = Array.from(document.querySelectorAll(selector))
        return anchors.map(a => a.href)
    }, 'div.terms-wrap ul li a')
    return wordLinks
}

async function isNextPage(page) {
    await page.waitForSelector('div.page-nav ul.arrow')
    return await page.evaluate(selector => {
        if (Array.from(document.querySelector(selector).children).some(c => c.textContent.includes('следующая'))) {
            return document.querySelector(selector).children[1]
                ? document.querySelector(selector).children[1].firstElementChild.href
                : document.querySelector(selector).children[0].firstElementChild.href
        }
        else {
            return false
        }
    }, 'ul.arrow')
}

async function getAllWordLinks(page, link) {
    await page.goto(link)
    let wordLinks = await getWordLinks(page)
    console.log(link)
    const nextPageLink = await(isNextPage(page))
    if (nextPageLink) {
        const nextLinks = await getAllWordLinks(page, nextPageLink, wordLinks)
        wordLinks = wordLinks.concat(nextLinks)
    }

    return wordLinks
}

async function iterate(page ,links, i = 0) {
    console.log('starting parse link number:', i)
    let wordLinks = await getAllWordLinks(page, links[i])
    if (i !== links.length - 1) {
        wordLinks = wordLinks.concat(await iterate(page, links, ++i))
    }

    return wordLinks
}

(async() => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
    let page = await browser.newPage()

    await page.goto('https://nog_rus_new.academic.ru/')
    await page.waitForSelector('div.contents-wrap')

    const links = await page.evaluate(selector => {
        const anchors = Array.from(document.querySelectorAll(selector))
        return anchors.map(a => a.href)
    }, 'div.contents-wrap ul li a')

    const wordLinks = await iterate(page, links)

    /* return await new Promise((resolve ,reject) => {
        fs.writeFile('./links.txt', wordLinks.join('\n'), err => {
            if (err) {
                reject(err)
            } else {
                resolve('done!')
            }
        })
    }) */
    return wordLinks

})().then(result => {
    console.log(result)
    process.exit(0)
})
