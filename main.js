let express = require('express')
let https = require('https')
let fs = require('fs')
let request = require('request')
let mysql = require('mysql')
let formidable = require('formidable')
let conf = require('./config')
let query = require('./query')
let ocr = require('./ocr')

let cert = fs.readFileSync(conf.certPath, 'utf8')
let key = fs.readFileSync(conf.keyPath, 'utf8')

let app = express()
let conn = mysql.createConnection(conf.dbConn)

// app.use(function (req, res, next) {
//     res.set('Access-Control-Allow-Origin', '*')
//     next()
// })


app.use(express.json())
app.use(express.urlencoded({extended: true}))
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
    res.json(await query.alterKeyword(conn, args))
})


app.post('/feedback', async function(req, res){
    let args = req.body
    res.json(await query.feedback(conn, args))
})


app.post('/upload', function(req, res){
    let form = formidable.IncomingForm()
    form.uploadDir = './public'
    form.hash = 'md5'
    form.keepExtensions = true
    form.parse(req, async function(err, fields, files){
        if(err) throw err

        let user = fields['user']
        let file = files['file']
        // if(file){
        //     let flag = await checkFormat(file.type)
        // }
        let oldPath = file.path
        let format = file.name.split('.')
        file.name = `${file.hash}-${Date.now()}.${format[format.length-1]}`
        file.path = `${form.uploadDir}/${file.name}`

        //将自动生成的图片名改为【md5码-当前时间毫秒数.图片格式】
        fs.renameSync(oldPath, file.path)

        let pic = `static/${file.name}`
        let id = await query.upload(conn, pic)
        
        let results = JSON.parse(await ocr.getResult(pic))
        let keyword = ''
        let average = 0
        results['words_result'].forEach(element => {
            keyword += element['words']
            keyword += ';'
            average += element['probability']['average']
        })
        average /= results['words_result_num']

        args = {user: user, image: id, content: keyword, level: average}
        let v = await query.insertKeyword(conn, args)
        if(v===0){
            res.json({user: user, image: id, content: keyword, level: average, code: 0})
        }

        // console.log(fields)
        // console.log(files)
        // res.json([files, {oldPath: oldPath}])
        res.json({})//临时
    })
})


// TEST AREA
app.get('/test/login', (req, res) => {
    res.json({code: 0, user: 'aafa8e64-519a-4269-b9fd-ebb965ae9e13'})
})
app.post('/test/upload', (req, res) => {
    res.json({code: 0, image: 'a81efa19-144c-466f-8334-a1cc0a4769f8'})
})
app.get('/test/search', (req, res) => {
    res.json([{url: '5c13ddb0-2dad-46a6-b138-1f22626f5c85'}, {url: 'f60de190-eb90-4e1d-87ea-4419d5c91adb'}, {url: 'e8fcc5d3-7dde-431a-825c-7a76ba6ccd96'}])
})
app.post('/test/keyword', (req, res) => {
    res.json({code: 0})
})
app.post('/test/feedback', (req, res) => {
    res.json({code: 0})
})


let server = https.createServer({cert, key}, app)

server.listen(conf.port, function () {
    console.log(`Server listening on port: ${conf.port}`)
})