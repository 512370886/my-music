import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'

const state = {
  singer: {}, // 歌手列表数据
  playing: false, // 播放状态，true为播放状态，false为暂停状态（默认状态）
  fullScreen: false, // 播放器展开收起状态，默认false,true为展开，false为收起
  playlist: [], // 播放列表
  sequenceList: [], // 顺序列表， 当是顺序播放时，playlist和sequenceList时一致的，当播放模式为随机播放时，这两个列表时不一样的
  mode: playMode.sequence, // 播放模式sequence为0，loop为1，random为2，在common/js/config做相关配置
  currentIndex: -1, // 当前播放的索引，为毛是默认是-1？？currentSong可以根据playlist和currentIndex计算而来
  disc: {}, // 推荐页面的热门推荐歌单详情数据
  topList: {}, // 排行榜歌曲详情数据
  searchHistory: loadSearch(), // 搜索历史数据
  playHistory: loadPlay(), // 播放历史数据
  favoriteList: loadFavorite() // 我的收藏数据
}

export default state
