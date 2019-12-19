const config = {
    appid: 'wx747d160c21468d64',
    secret: '',

    port: 443,

    certPath: '/etc/letsencrypt/live/fakartist.com/fullchain.pem',
    keyPath: '/etc/letsencrypt/live/fakartist.com/privkey.pem',

    dbConn: {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '123456',
        database: 'app'
    }
}

module.exports = config