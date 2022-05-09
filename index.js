import express from "express"
import jwt from 'jsonwebtoken'

import { 
    __dirname, 
    __filename, 
    existSync, 
    mkdirSync, 
    writeFileSync, 
    unique, 
    readDir,
    isDir,
    readDirRecursive
} from './utils.js'
import { getCurrentVersion, getJsons, getSprite } from "./api.js";

const app = express()
const port = 8080
const PRIVATE_KEY = 'dobedoo'

// 允许跨域
app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    next()
})

// 中间件：通过路径直接获取静态文件
app.use('/static', express.static(`${__dirname}/public`))

// unless('/login')
app.use((req, res, next) => {
    // return next()
    if(req.path === '/login') return next()
    if(req.method === 'OPTIONS') return next()

    const payload = jwt.verify(req.headers?.authorization, PRIVATE_KEY)
    if(payload?.admin === 'dobedoo') {
        next()
    } else {
        res.send({
            ok: false,
            msg: 'jwt校验失败',
            data: ''
        })
    }
    
})

app.get('/login', (req, res) => {
    const admin = req.query?.admin
    if(admin === 'dobedoo') {
        const jwtString = jwt.sign(JSON.stringify({admin}), PRIVATE_KEY)
        res.send({
            ok: true,
            msg: '',
            data: jwtString
        }) 
    } else {
        res.send({
            ok: false,
            msg: '你是做什么的？',
            data: ''
        })
    }
})

// 总是更新最新版本的 json 文件 包括
// champion.json
// summoner.json  召唤师技能
// item.json      装备
// 查询最新版本 -> 存在对应文件夹 -> Yes ------------------------------------------> 结束
//                      ↘ No -> 创建文件夹 -> 下载所有 json 文件 -> 解析雪碧图并下载 ↗
// TODO log
app.get('/refresh', async(req, res) => {
    const versionArray = await getCurrentVersion()
    const jsonPath = `${__dirname}/public/json/${versionArray[0]}`
    const imgPath = `${__dirname}/public/image/${versionArray[0]}`
    let response = {}
    const flag = existSync(jsonPath)
    if(flag) {
        response.msg = 'Already the latest version'
        response.ok = false
    } else {
        try {
            mkdirSync(jsonPath)
            mkdirSync(imgPath)
            const results = await getJsons(versionArray[0])
            results.forEach(async(result) => {
                if(result.status === 'fulfilled') {
                    let data = result.value
                    let spriteArray = []
                    for(let key in data.data) {
                        spriteArray.push(data.data[key].image.sprite)
                    }
                    data.requiredSprite = unique(spriteArray)
                    for(let item of data.requiredSprite) {
                        const buffer = await getSprite(versionArray[0], item)
                        process.stdout.write(`writing ${item}\n`)
                        writeFileSync(`${imgPath}/${item}`, buffer)
                    }
                    process.stdout.write(`writing ${data.type}.json\n`)
                    writeFileSync(`${jsonPath}/${data.type}.json`, JSON.stringify(data))
                }
            })
            response.msg = 'Done'
            response.ok = true
        } catch(error) {
            response.msg = error
            response.ok = false
        }
    }
    res.send(response)
})

app.get('/filelist', (req, res) => {
    const path = req.query.sub ? `${__dirname}/public/${req.query.sub}` : `${__dirname}/public`
    let response = {}
    let data = {}
    try {
        data = readDirRecursive(path)
        response = {
            ok: true,
            msg: '',
            data
        }
    } catch(error) {
        response = {
            ok: false,
            msg: error,
            data: []
        }
    }
    res.send(response)
})

app.get('/version', async(req, res) => {
    let version = ''
    let response = {}
    try {
        version = (await getCurrentVersion())[0]
        response = {
            ok: true,
            msg: '',
            data: version
        }
    } catch(error) {
        response = {
            ok: true,
            msg: error,
            data: ''
        }
    }
    res.send(response)
})

app.listen(port, () => {
    process.stdout.write(`server listen on ${port}\n`)
})