import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  // 当组件DOM ready的时候触发
  mounted () {
    this.handlePlaylist(this.playlist)
  },
  // 当keep-alive组件切过来的时候会触发activated（）事件
  activated () {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist (newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    // 这个handlePlaylist的方法在具体的组件里去实现，一旦组件里定义了这个函数，它就会覆盖mixin里的函数，如果组件里没有定义这个函数，就会调用到mixin里的这个函数
    handlePlaylist () {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const playerMixin = {
  computed: {
    // 播放模式图标的切换
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'mode',
      'playlist',
      'favoriteList'
    ])
  },
  methods: {
    // 播放模式的切换
    changeMode () {
      const mode = (this.mode + 1) % 3 // 根据当前的播放模式this.mode来改变其播放状态mode，然后通过提交一个mutation来改变当前的播放状态
      this.setPlayMode(mode)
      let list = null // 不同播放模式下的播放列表
      if (this.mode === playMode.random) {
        list = shuffle(this.sequenceList) // 随机播放的歌曲列表，每次切换都会把列表重新洗牌
      } else {
        list = this.sequenceList // 顺序播放以及循环播放的歌曲列表
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list) // 提交一个改变播放列表playlist的mutition
    },
    // 重置当前歌曲的currentIndex函数，以保证在切换播放模式的时候当前播放的歌曲不会改变，因为当前歌曲currentSong时根据playlist和currentIndex计算而来的
    resetCurrentIndex (list) {
      // 在当前列表找到当前播放歌曲的索引，findIndex（）时ES6的语法
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    // 收藏歌曲的心形样式的转变，由收藏到不收藏
    getFavoriteIcon (song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    // 往收藏列表添加或者删除一首歌曲
    toggleFavorite (song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },
    // 判断一首歌是否在收藏列表里面
    isFavorite (song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
//    setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}

export const searchMixin = {
  data () {
    return {
      query: '', // 搜索框里的检索词
      refreshDelay: 100 // 控制scroll组件的延时调用refresh()方法
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    // 点击热门搜索关键词，调用search-box组件里的setQuery()方法，把参数传入
    addQuery (query) {
      this.$refs.searchBox.setQuery(query)
    },
    // 监听子组件派发出来的query事件方法来实时获取搜索框中内容的变化
    onQueryChange (query) {
      this.query = query // 接收到从search-box子组件中传入的newQuery
    },
    // 监听到从suggest组件派发出来的listScroll事件，然后执行的回调函数
    blurInput () {
      this.$refs.searchBox.blur() // 调用子组件search-box的方法
    },
    // 监听到从子组件suggest派发出来的事件的回调函数
    saveSearch () {
      this.saveSearchHistory(this.query) // 把搜索结果通过Actions写入vuex，并存储在localStorage中
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
