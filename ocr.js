let fs = require('fs')
let https = require('https')
let qs = require('querystring')

module.exports = {
    getResult: function(pic){
        return new Promise(resolve => {
            let param = qs.stringify({
                'access_token':'24.55d3eacd0f7e936dd33ffc09d5c9b96b.2592000.1579446201.282335-18076388'
            })
            const hasBody = function(req) {
                return  'transfer-encoding'  in  req.headers  ||  'content-length' in req.headers;
              }
            // let image = fs.readFileSync("./public/e1a26d345e343572e3d963001ce11645-1576914507072.jpg").toString("base64");
            let url = `https://fakartist.com/${pic}`
            let probability="true"
            let postData =qs.stringify({
                // image:image,
                url: url,
                probability: probability
            })
            let options = {
                hostname: 'aip.baidubce.com',
                path: '/rest/2.0/ocr/v1/webimage?' + param,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
                
            }
            
            let req = https.request(options, function(res) {
                    res.setEncoding('utf8');
                    let chunks = []
                    res.on('data', (chunk) => {
                        chunks.push(chunk)
                    })
                    res.on('end', () => {
                        let data = ''
                        chunks.forEach(element => {
                            data += element
                        });
                        // let data = Buffer.concat(chunks);
                        resolve(JSON.parse(data))
                    })
                })
            
            // 携带数据发送https请求
            req.write(postData);
            req.end();
        })
    }
}