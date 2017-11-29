import {getLyric} from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64' // 第三方库解码工具

export default class Song {
  // 构造一个song类，当传入的数据比较多是，可以传入一个对象
  constructor ({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }
  getLyric () {
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}
// 抽象出来的工厂方法
export function createSong (musicData) {
  // 实例化一个对象Song
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
  })
}
// 数组过滤方法，传入一个数组，返回一个新数组，数组里面只有名字name
export function filterSinger (singer) {
  let ret = []
  // 边界处理
  if (!singer) {
    return ''
  }
  // 数组遍历
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}
