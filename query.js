let uuid = require('uuid/v4')

module.exports = {
    getID: function(conn, sess){
        return new Promise(resolve => {
            let selectUser = 'SELECT `uuid` FROM `user` WHERE `openid`=?;'
            conn.query(selectUser, [sess.openid], function(err, rows){
                if(err) throw err
                if(!rows.length){
                    let id = uuid()
                    let insertUser = 'INSERT INTO `user` VALUES(?, ?, ?, ?);'
                    conn.query(insertUser, [id, sess.openid, sess.session_key, 0], function(err, rows){
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
            let searchKeyword = 'SELECT * FROM `keyword` WHERE `user`=? AND `keyword` LIKE %'+args.keyword+'%;'
            conn.query(searchKeyword, args.uuid, function(err, rows){
                if(err) throw err
                resolve(rows)
            })
        })
    },


    alterKeyword: function(conn, args){
        return new Promise(resolve => {
            let alterKeyword = 'UPDATE `keyword` SET `keyword`=? WHERE `user`=? AND `image`=?'
            conn.query(alterKeyword, [args.keyword, args.user, args.image], function(err, rows){
                if(err) throw err
                resolve(rows)
        })
        })
    },


    feedback: function(conn, args){
        return new Promise(resolve => {
            let insertFeedback = 'INSERT INTO `feedback`(`email`, `feedback`) VALUES(?, ?)'
            conn.query(insertFeedback, [args.email, args.feedback], function(err, rows){
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