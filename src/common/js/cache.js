import storage from 'good-storage'

const SEARCH_KEY = '__search__' // 搜索历史在localStorage里的key值
const SEARCH_MAX_LENGTH = 15 // 最大存储长度

const PLAY_KEY = '__play__'
const PLAY_MAX_LENGTH = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LENGTH = 200
// 往数组里插入数据，如有重复的则删除旧的，并且新插入的数据总是在最前面
function insertArray (arr, val, compare, maxLen) {
  const index = arr.findIndex(compare) // 查找数组中是否有某个元素，并返回其索引，findIndex（）为ES6的API，支持传入一个比较函数
  // index === 0 表示是第一条数据，表示数组里已经有这一条数据了而且是第一个
  if (index === 0) {
    return
  }
  // index > 0 表示有这条数据，但不是排在第一个
  if (index > 0) {
    arr.splice(index, 1) // 把此条数据删除
  }
  arr.unshift(val) // 把数据插入到数组第一个位置
  // 判断数组的总长度
  if (maxLen && arr.length > maxLen) {
    arr.pop() // 把数组最后的一个数据删除
  }
}
// 删除数组中的数据
function deleteFromArray (arr, compare) {
  const index = arr.findIndex(compare) // 查找数组中是否有某个元素，并返回其索引，findIndex（）为ES6的API，支持传入一个比较函数
  if (index > -1) {
    arr.splice(index, 1) // 把此条数据删除
  }
}

export function saveSearch (query) {
  let searches = storage.get(SEARCH_KEY, []) // 获取localStorage当前的存储数据
  // 搜索历史数据的插入
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches) // 搜索数据的存储
  return searches
}
// 读取本地缓存的数据
export function loadSearch () {
  return storage.get(SEARCH_KEY, [])
}
// 删除搜索历史
export function deleteSearch (query) {
  let searches = storage.get(SEARCH_KEY, []) // 获取localStorage当前的存储数据
  // 删除数组
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches) // 保存数组
  return searches
}
// 清空缓存localStorage里的数据
export function clearSearch () {
  storage.remove(SEARCH_KEY)
  return []
}

export function savePlay (song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return item.id === song.id
  }, PLAY_MAX_LENGTH)
  storage.set(PLAY_KEY, songs)
  return songs
}

export function loadPlay () {
  return storage.get(PLAY_KEY, [])
}

export function saveFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function deleteFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return song.id === item.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function loadFavorite () {
  return storage.get(FAVORITE_KEY, [])
}
