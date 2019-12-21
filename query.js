let uuid = require('uuid/v4')

module.exports = {
    getID: function(conn, sess){
        return new Promise(resolve => {
            let selectUser = 'SELECT `uuid` FROM `user` WHERE `openid`=?;'
            conn.query(selectUser, [sess.openid], function(err, rows){
                if(err) throw err
                if(!rows.length){
                    let id = uuid()
                    let insertUser = 'INSERT INTO `user` VALUES(?, ?, ?, ?, ?);'
                    conn.query(insertUser, [id, sess.openid, sess.session_key, 0, null], function(err, rows){
                        if(err) throw err
                        console.log('insert')
                        resolve({code: 0, user: id})
                    })
                } else{
                    console.log('select')
                    resolve({code: 0, user: rows[0].uuid})
                }
            })
        })
    },


    search: function(conn, args){
        return new Promise(resolve => {
            let searchKeyword = 'SELECT * FROM `keyword` WHERE `user`=? AND `content` LIKE "%'+args.keyword+'%";'
            conn.query(searchKeyword, args.user, function(err, rows){
                if(err) throw err
                resolve(rows)
            })
        })
    },


    alterKeyword: function(conn, args){
        return new Promise(resolve => {
            let alterKeyword = 'UPDATE `keyword` SET `content`=? WHERE `user`=? AND `image`=?'
            conn.query(alterKeyword, [args.keyword, args.user, args.image], function(err, rows){
                if(err) throw err
                if(rows.affectedRows){
                    resolve({code: 0})
                }
        })
        })
    },


    feedback: function(conn, args){
        return new Promise(resolve => {
            let insertFeedback = 'INSERT INTO `feedback`(`email`, `feedback`) VALUES(?, ?)'
            conn.query(insertFeedback, [args.email, args.feedback], function(err, rows){
                if(err) throw err
                if(rows.affectedRows){
                    resolve({code: 0})
                }
            })
        })
    },


    upload: function(conn, args){
        return new Promise(resolve => {
            let id = uuid()
            let uploadFile = 'INSERT INTO `image` VALUES(?, ?)'
            conn.query(uploadFile, [id, args.url], function(err, rows){
                if(err) throw err
                if(rows.affectedRows){
                    resolve(id)
                }
            })
        })
    },


    getResult: function(conn, args){
        return new Promise(resolve => {
            let getResult = 'SELECT * FROM `keyword` WHERE `image`=?'
            conn.query(getResult, [args.image], function(err, rows){
                if(err) throw err
                resolve(rows)
            })
        })
    },


    foo: (conn, args)=>{
        return new Promise(resolve => {
            console.log(args)
            conn.query('UPDATE `test` SET `val`=? WHERE `key`=?;', [args.val, args.key], function(err, rows){
                if(err) throw err
                resolve(rows)
            })
        })
    }
}