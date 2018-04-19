const express = require('express')
const process = require('process')
const fs = require('fs')

const app = express()

app.get('/parser_logs', (request, response) => {
    fs.readFile('./parser_logs.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('from server:', err)
            throw err
        }
        const res = data.toString().split('\n').slice(-3)
        response.json(res)
    })
})

app.get('/server_logs', (request, response) => {
    fs.readFile('./server_logs.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('from server:', err)
            throw err
        }
        const res = data.toString().split('\n').slice(-3)
        response.json(res)
    })
})

app.listen(3000, '', () => {
    console.log(`from server: PID: ${process.pid}`)
    console.log('from server: listening...')
})