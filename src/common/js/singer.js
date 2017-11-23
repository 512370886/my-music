// 把对象封装成一个类
export default class Singer {
  constructor ({id, name, mid}) {
    this.id = id
    this.mid = mid
    this.name = name
    this.avatar = `https://y.gtimg.cn/music/photo_new/T001R300x300M000${mid}.jpg?max_age=2592000`
  }
}
