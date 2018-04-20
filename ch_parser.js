const cheerio = require('cheerio')
const fetch = require('isomorphic-fetch')
const fs = require('fs')
const process = require('process')

const links = JSON.parse(fs.readFileSync('./filtered_links.json', 'utf8'))

async function parseLink(link) {
    return await fetch(link)
        .then(response => response.text())
        .then(html => cheerio.load(html))
        .then($ => ({ ng: $('.term').text(), ru: $('.descript').text() }))
        .catch(err => {
            console.error(err)
            process.exit(1)
    })
}

async function parseLinks(links, words = []) {
    if (links[words.length]) {
        const word = await parseLink(links[words.length])
        words.push(word)
        console.log(`${new Date().toLocaleTimeString()}: ${word.ng}; words parsed: ${words.length}`)
        return await parseLinks(links, words)
    }

    return words
}

parseLinks(links)
    .then(words => {
        return new Promise((resolve, reject) => {
            fs.writeFile('./words.json', JSON.stringify(words), err => {
                if (err) {
                    reject(err)
                }
                resolve('============= DONE! =============')
            })
        })
    })
    .then(finish => {
        console.log(finish)
        process.exit(0)
    })
    .catch(err => {
        console.error(err)
        process.exit(1)
    })