let express = require('express')
let https = require('https')
let fs = require('fs')
let request = require('request')
let mysql = require('mysql')
let formidable = require('formidable')
// let bodyParser = require('body-parser')
let conf = require('./config4dev')
let query = require('./query')

let cert = fs.readFileSync(conf.certPath, 'utf8')
let key = fs.readFileSync(conf.keyPath, 'utf8')

let app = express()
let conn = mysql.createConnection(conf.dbConn)

// app.use(function (req, res, next) {
//     res.set('Access-Control-Allow-Origin', '*')
//     next()
// })


app.use(express.json())
app.use('/static', express.static(__dirname + '/public'))


app.get('/login', function(req, res){
    let js_code = req.query.code
    console.log({js_code: js_code})
    let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${conf.appid}&secret=${conf.secret}&js_code=${js_code}&grant_type=authorization_code`
    request.get(url, async function(err, response, data){
        if(err) throw err
        let sess = JSON.parse(data)
        // console.log(sess)
        res.json(await query.getID(conn, sess))
    })
})


app.get('/search', async function(req, res){
    let args = req.query
    let rows = await query.search(conn, args)
    res.json(JSON.stringify(rows))
})


app.post('/keyword', async function(req, res){
    let args = req.body
    let rows = await query.alterKeyword(conn, args)
    if(rows.changedRows){
        res.json({code: 0})
    }
})


app.post('/feedback', async function(req, res){
    let args = req.body
    let rows = await query.feedback(conn, args)
    if(rows.changedRows){
        res.json({code: 0})
    }
})


app.post('/test', function(req, res){
    let form = formidable.IncomingForm()
    form.parse(req, function(err, fields, files){
        if(err) throw err
        console.log(fields)
        console.log(files)
        res.json(files)
    })
})



let server = https.createServer({cert, key}, app)

server.listen(conf.port, function () {
    console.log(`Server listening on port: ${conf.port}`)
})