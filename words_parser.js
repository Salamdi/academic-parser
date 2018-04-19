const puppeteer = require('puppeteer');
const process = require('process');
const fs = require('fs');

console.log(`PID: ${process.pid}`)

const links = fs.readFileSync('./links.txt', 'utf8').toString().split('\n').slice(0, 30)

fs.writeFileSync('./words.json', '[')

async function parsePage(page, link) {
    await page.goto(link)
    await page.waitForSelector('div#article')
    const ng = await page.evaluate(selector => {
        const elem = document.querySelector(selector)
        return elem.textContent
    }, '#article .term')
    const ru = await page.evaluate(selector => {
        const elem = document.querySelector(selector)
        return elem.textContent
    }, '#article .descript')
    return {ng, ru}
}

async function iterate(page, links, parsedWords = []) {
    if (links[parsedWords.length]) {
        let word = await parsePage(page, links[parsedWords.length])
        parsedWords.push(word)
        console.log(`${new Date().toLocaleTimeString()}: ${word.ng}; words parsed: ${parsedWords.length}`)
        parsedWords.length === links.length
            ? fs.writeFileSync('./words.json', JSON.stringify(word), {flag: 'a'})
            : fs.writeFileSync('./words.json', JSON.stringify(word) + ',\n', {flag: 'a'})
        return await iterate(page, links, parsedWords)
    } else {
        return parsedWords
    }
}

(async() => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const words = await iterate(page, links)
    return words
})()
    .then(words => {
        fs.writeFileSync('./words.json', ']', {flag: 'a'})
        fs.writeFileSync('./words_final.json', JSON.stringify(words))
        console.log('\n <===============> DONE! <=============> \n')
        process.exit(0)
    })
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
