let conf = require('./config')
let express = require('express')
let https = require('https')
let fs = require('fs')
let request = require('request')
// let mysql = require('mysql')

let cert = fs.readFileSync(conf.certPath, 'utf8')
let key = fs.readFileSync(conf.keyPath, 'utf8')

let app = express()
// let conn = mysql.createConnection(conf.dbConn)

// let router = express.Router()
// app.use(function (req, res, next) {
//     res.set('Access-Control-Allow-Origin', '*')
//     next()
// })

// function getUUID(sess){
//     conn.query('SELECT uuid FROM user WHERE openid=?;', sess.openid, function(err, rows){
//         if(err) throw err
//         if(!rows.length){
//             console.log('user not exists')
            
//         }

//     })
// }

app.get('/login', function(req, res){
    let js_code = req.query.code
    console.log({js_code: js_code})
    let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${conf.appid}&secret=${conf.secret}&js_code=${js_code}&grant_type=authorization_code`
    request.get(url, function(err, response, data){
        if(err) throw err
        let sess = JSON.parse(data)
        // console.log(sess)
        res.json(await query.getID(conn, sess))
    })
})

// 根据（用户uuid和关键词）搜索匹配图像
// 返回（静态URL数组）
app.get('/search', async function(req, res){
    let args = req.query
    let rows = await query.search(conn, args)
    let URL = []
    // MDN web docs:
    // 如果使用 promise 或 async 函数作为 forEach() 等类似方法的 callback 参数，
    // 最好对造成的执行顺序影响多加考虑，否则容易出现错误。
    // 
    // 此处改用了for...in语句
    for(let element of rows){
        let v = await query.getURL(conn, element.image)
        URL.push(v[0].url)
    }
    res.json(URL)
})

// 根据（用户uuid、图像uuid、修改内容），修改相关图片的识别文本
app.post('/keyword', async function(req, res){
    let args = req.body
    res.json(await query.alterKeyword(conn, args))
})

// 处理用户反馈
app.post('/feedback', async function(req, res){
    let args = req.body
    res.json(await query.feedback(conn, args))
})

// 根据（用户uuid和图片文件），通过百度API获取并返回（OCR文字识别结果）
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

        // 将自动生成的图片名改为【md5码-当前时间毫秒数.图片格式】
        fs.renameSync(oldPath, file.path)

        let pic = `static/${file.name}`
        let id = await query.upload(conn, pic)
        
        let results = await ocr.getResult(pic)
        let keyword = ''
        let min = 0
        // 拼接文本、计算平均准确率
        if(results['words_result'].length) {
            results['words_result'].forEach(element => {
                keyword += element['words']
                keyword += ';'
                min += element['probability']['min']
            })
            min /= results['words_result_num']
        } else {
            keyword = ''
            min = -1
        }
        
        args = {user: user, image: id, content: keyword, level: min}
        let v = await query.insertKeyword(conn, args)
        if(v===0){
            res.json({user: user, image: id, content: keyword, level: min, code: 0})
        }
    })
})

// 特 色 铁 拳 👊 规 避
app.get('/index', function(req, res){
    res.sendFile(__dirname + '/public/index.html')
})
app.get('/', function(req, res){
    res.redirect('/index')
})



// app.use(express.static(__dirname))

let server = https.createServer({cert, key}, app)

server.listen(conf.port, function () {
    console.log(`Server listening on port: ${conf.port}`)
})