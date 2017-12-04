<template>
  <transition name="slide">
  	<div class="add-song" v-show="showFlag" @click.stop>
  	  <div class="header">
  	  	<h1 class="title">添加歌曲到列表</h1>
  	  	<div class="close" @click="hide">
  	  	  <i class="icon-close"></i>
  	  	</div>
  	  </div>
  	  <div class="search-box-wrapper">
  	  	<search-box ref="searchBox" @query="onQueryChange" placeholder="搜索歌曲"></search-box>
  	  </div>
  	  <div class="shortcut" v-show="!query">
  	  	<switches @switch="switchItem" :currentIndex="currentIndex" :switches="switches"></switches>
  	  	<div class="list-wrapper">
  	  	  <scroll ref="songlist" class="list-scroll" v-if="currentIndex===0" :data="playHistory">
  	  	  	<div class="list-inner">
  	  	  	  <song-list :songs="playHistory" @select="selectSong"></song-list>	
  	  	  	</div>
  	  	  </scroll>
  	  	  <scroll :refreshDelay="refreshDelay" ref="searchList" class="list-scroll" :data="searchHistory">
  	  	  	<div class="list-inner">
  	  	  	  <search-list :searches="searchHistory" @delete="deleteSearchHistory" @select="addQuery"></search-list>
  	  	  	</div>
  	  	  </scroll>
  	  	</div>
  	  </div>
  	  <div class="search-result" v-show="query">
  	  	<suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
  	  </div>
  	  <top-tip ref="topTip">
  	  	<div class="tip-title">
  	  		<i class="icon-ok"></i>
  	  		<span class="text">1首歌曲已经添加到播放队列</span>
  	  	</div>
  	  </top-tip>
  	</div>
  </transition>
</template>

<script type="text/ecmascript-6">
import SearchBox from 'base/search-box/search-box'
import Suggest from 'components/suggest/suggest'
import {searchMixin} from 'common/js/mixin'
import Switches from 'base/switches/switches'
import Scroll from 'base/scroll/scroll'
import {mapGetters, mapActions} from 'vuex'
import SongList from 'base/song-list/song-list'
import Song from 'common/js/song'
import SearchList from 'base/search-list/search-list'
import TopTip from 'base/top-tip/top-tip'
export default {
  mixins: [searchMixin],
  data () {
    return {
      showFlag: false, // 组件显示，隐藏的控制
//    query: '',
      showSinger: false, // 需不需要在搜索列表中展示歌手的标志位，true是需要展示，false是不需要展示，这里不需要在搜索列表中显现歌手
      currentIndex: 0, // switches组件的默认索引
      // switches组件的文字内容
      switches: [
        {name: '最近播放'},
        {name: '搜索历史'}
      ]
    }
  },
  computed: {
    ...mapGetters([
      'playHistory'
    ])
  },
  methods: {
    // 显示
    show () {
      this.showFlag = true
      // add-song默认是隐藏的，当它显示时要重新调用scroll组件的refresh()方法来重新计算滚动列表的高度
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songlist.refresh()
        } else {
          this.$refs.searchList.refresh()
        }
      }, 30)
    },
    // 隐藏
    hide () {
      this.showFlag = false
    },
//  onQueryChange (query) {
//    this.query = query
//  },
    // 监听到从suggest组件派发出来的select事件的回调函数
    selectSuggest () {
      this.saveSearch() // 此函数是在search组件中监听从suggest组件派发出来的select事件的回调函数，此函数里面是一个保存搜索数据saveSearchHistory的Actions
      this.showTip()
    },
    // 监听switches组件switch事件的回调函数
    switchItem (index) {
      this.currentIndex = index
    },
    // 点击历史播放列表的歌曲，这首歌插入到当前播放列表中
    selectSong (song, index) {
      if (index !== 0) {
        this.insertSong(new Song(song))
        this.showTip()
      }
    },
    // 顶部的提示框显示
    showTip () {
      this.$refs.topTip.show()
    },
    ...mapActions([
      'insertSong'
    ])
  },
  components: {
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SongList,
    SearchList,
    TopTip
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped="scoped">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>