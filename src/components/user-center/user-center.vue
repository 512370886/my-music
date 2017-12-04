<template>
  <transition name="slide">
  	<div class="user-center">
  	  <div class="back" @click="back">
  	  	<i class="icon-back"></i>
  	  </div>
  	  <div class="switches-wrapper">
  	  	<switches @switch="switchItem" :currentIndex="currentIndex" :switches="switches"></switches>
  	  </div>
  	  <div ref="playBtn" class="play-btn" @click="random">
  	  	<i class="icon-play"></i>
  	  	<span class="text">随机播放</span>
  	  </div>
  	  <div class="list-wrapper" ref="listWrapper">
  	  	<scroll ref="favoriteList" class="list-scroll" v-if="currentIndex===0" :data="favoriteList">
  	  	  	<div class="list-inner">
  	  	  	  <song-list :songs="favoriteList" @select="selectSong"></song-list>	
  	  	  	</div>
  	  	  </scroll>
  	  	  <scroll ref="playList" class="list-scroll" v-if="currentIndex===1" :data="playHistory">
  	  	  	<div class="list-inner">
  	  	  	 <song-list :songs="playHistory" @select="selectSong"></song-list>	
  	  	  	</div>
  	  	  </scroll>
  	  </div>
  	  <div class="no-result-wrapper" v-show="noResult">
  	  	<no-result :title="noResultDesc"></no-result>
  	  </div>
  	</div>
  </transition>
</template>

<script type="text/ecmascript-6">
import Switches from 'base/switches/switches'
import Scroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import NoResult from 'base/no-result/no-result'
import Song from 'common/js/song'
import {mapGetters, mapActions} from 'vuex'
import {playlistMixin} from 'common/js/mixin'
export default {
  mixins: [playlistMixin],
  data () {
    return {
      currentIndex: 0, // switches组件的默认索引，实现'我喜欢的'与'最近听的'之间的切换
      // switches组件的文字内容
      switches: [
        {name: '我喜欢的'},
        {name: '最近听的'}
      ]
    }
  },
  computed: {
    // 根据currentIndex来显示
    noResult () {
      if (this.currentIndex === 0) {
        return !this.favoriteList.length
      } else {
        return !this.playHistory.length
      }
    },
    // 根据currentIndex来显示
    noResultDesc () {
      if (this.currentIndex === 0) {
        return '暂无收藏歌曲'
      } else {
        return '你还没有听过歌曲'
      }
    },
    ...mapGetters([
      'favoriteList',
      'playHistory'
    ])
  },
  methods: {
    // 列表滚动时底部高度和mini播放器的自适应
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.listWrapper.style.bottom = bottom
      this.$refs.favoriteList && this.$refs.favoriteList.refresh() // 因此组件的显示和隐藏用的是v-if，有可能是不存在的，所以在用之前想判断一下
      this.$refs.playList && this.$refs.playList.refresh() // 因此组件的显示和隐藏用的是v-if，有可能是不存在的，所以在用之前想判断一下
    },
    // 监听从switches派发出来的switch的回调，实现'我喜欢的'与'最近听的'之间的切换
    switchItem (index) {
      this.currentIndex = index
    },
    // 在'我喜欢的'与'最近听的'之间的列表中选择一首歌，把这首歌插入当前播放列表
    selectSong (song) {
      this.insertSong(new Song(song))
    },
    // 回退到上一个页面
    back () {
      this.$router.back()
    },
    random () {
      // 根据当前的currentIndex来决定随机播放哪个列表，favoriteList或者playHistory
      let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
      // 当播放列表为空的时候，什么都不做
      if (list.length === 0) {
        return
      }
      // 因此时的list不是一个song的实例，用map去遍历list,然后list里面的每个song都return新的song的实例
      list = list.map((song) => {
        return new Song(song)
      })
      this.randomPlay({list})
    },
    ...mapActions([
      'insertSong',
      'randomPlay'
    ])
  },
  components: {
    Switches,
    Scroll,
    SongList,
    NoResult
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
   @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
