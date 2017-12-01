import * as types from './mutation-types'
import {shuffle} from 'common/js/util'
import {playMode} from 'common/js/config'
import {saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite} from 'common/js/cache'

function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}
// 点击歌曲播放的action
export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
// 随机播放的action,随机播放是没有索引的
export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list) // 列表的洗牌，打乱列表原有的顺序
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
// 往当前的playlist里插入一首歌曲
export const insertSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice() // 返回一个playlist的副本，以免在下面增加删除歌曲时直接修改了playlist里的数据，这在vuex里是不允许的
  let sequenceList = state.sequenceList.slice() // 返回一个sequenceList的副本，以免在下面增加删除歌曲时直接修改了sequenceList里的数据，这在vuex里是不允许的
  let currentIndex = state.currentIndex // 先找到当前的歌曲的索引
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有带插入的歌曲并返回其索引
  let fpIndex = findIndex(playlist, song)
  // 因为是插入歌曲，所以索引要+1， 因为我们要插入的位置是当前索引的下一个
  currentIndex++
  // 插入这首歌到当前索引位置
  playlist.splice(currentIndex, 0, song) // 插入增加一首歌曲
  // 如果已经包含了这首歌
  if (fpIndex > -1) {
    // 如果当前插入歌曲的序号大于这首歌曲在列表中的序号
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1) // 删除一首歌曲
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1) // 删除一首歌曲
    }
  }
  let currentSIndex = findIndex(sequenceList, currentSong) + 1 // 获取当前这首歌在sequenceList里要插入的位置，当前的歌曲currentSong在sequenceList里的位置+1
  let fsIndex = findIndex(sequenceList, song) // 查找sequenceList是否有要插入的歌曲
  sequenceList.splice(currentSIndex, 0, song) // 插入增加一首歌曲
  // 在插入一首歌曲后再判断sequenceList里是否有这首歌
  if (fsIndex > 1) {
    // 如果有这首歌曲再判断是在这首歌的前面插入，还是在后面插入
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1) // 删除一首歌曲
    } else {
      sequenceList.splice(fsIndex + 1, 1) // 删除一首歌曲
    }
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
// 保存搜索历史数据
export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}
// 删除搜索历史数据
export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}
// 清空历史搜索数据
export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}
// 删除播放列表里的一首歌曲
export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice() // 返回一个playlist的副本
  let sequenceList = state.sequenceList.slice() // 返回一个sequenceList的副本
  let currentIndex = state.currentIndex // 先找到当前的歌曲的索引
  let pIndex = findIndex(playlist, song) // 找到这首歌在playlist下的索引
  playlist.splice(pIndex, 1) // 在playlist中删除这首歌
  let sIndex = findIndex(sequenceList, song) // 找到这首歌在sequenceList下的索引
  sequenceList.splice(sIndex, 1) // 在sequenceList中删除这首歌
  // 如果删除的这首歌在当前播放的歌前面或者删除的是最后一首歌时
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex-- // 当前歌曲的索引要-1
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  const playingState = playlist.length > 0 // 判断播放列表中是否还有没有歌曲，来决定播放状态
  commit(types.SET_PLAYING_STATE, playingState)
}
// 请空播放列表里的所有歌曲
export const deleteSongList = function ({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
