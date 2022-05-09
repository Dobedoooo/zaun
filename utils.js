import url from "url"
import path from "path"
import fs from "fs"

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 检测文件或文件夹是否存在
const existSync = path => {
    return fs.existsSync(path)
}
// 创建文件夹
const mkdirSync = path => {
    return fs.mkdirSync(path, { recursive: true })
}
// 写入文件
const writeFileSync = (path, data) => {
    return fs.writeFileSync(path, data)
}

// 文件夹内容
const readDir = (path, option = {}) => {
    return fs.readdirSync(path, option)
}

// 判断是否为文件夹
const isDir = (path, option = {}) => {
    const stat = fs.lstatSync(path, option)
    return stat.isDirectory()
}

// 数组去重
const unique = array => {
    return Array.from(new Set(array))
}

const readDirRecursive  = path => {
    var obj = {}
    fs.readdirSync(path).forEach(item => {
        const stat = fs.lstatSync(`${path}/${item}`)
        if(stat.isDirectory()) {
            obj[item] = readDirRecursive(`${path}/${item}`)
        } else {
            obj[item] = {
                birthtime: stat.birthtime,
                size: stat.size
            }
        }
    })
    return obj
}

export {
    __filename,
    __dirname,
    existSync,
    mkdirSync,
    writeFileSync,
    unique,
    readDir,
    isDir,
    readDirRecursive
}