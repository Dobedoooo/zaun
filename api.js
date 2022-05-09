import got from 'got';

const URL = {
    ddragon: 'https://ddragon.leagueoflegends.com',
    version: ''
}

// 版本数组
const getCurrentVersion = () => {
    return got(`${URL.ddragon}/api/versions.json`).json()
}

// summoner.json
// champion.json
// item.json
const getJsons = ver => {
    const summoner = got(`${URL.ddragon}/cdn/${ver}/data/zh_CN/summoner.json`).json()
    const champion = got(`${URL.ddragon}/cdn/${ver}/data/zh_CN/champion.json`).json()
    const item = got(`${URL.ddragon}/cdn/${ver}/data/zh_CN/item.json`).json()
    const promises = [ summoner, champion, item ]
    return Promise.allSettled(promises)
}

const getSprite = (ver, file) => {
    return got(`${URL.ddragon}/cdn/${ver}/img/sprite/${file}`).buffer()
}

export {
    getCurrentVersion,
    getJsons,
    getSprite,
}