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
        console.log(sess)
        // let uuid = getUUID(sess)
        res.json({openid: sess.openid})
        // res.json()
    })
})


// app.use(express.static(__dirname))

let server = https.createServer({cert, key}, app)

server.listen(conf.port, function () {
    console.log(`Server listening on port: ${conf.port}`)
})