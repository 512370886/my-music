<template>
  <div class="music-list">
  	<div class="back">
  	  <i class="icon-back" @click="back"></i>
  	</div>
  	<h1 class="title" v-html="title"></h1>
  	<div class="bg-image" :style="bgStyle" ref="bgImage">
  		<div class="play-wrapper">
  			<div class="play" v-show="songs.length > 0" ref="playBtn" @click="random">
  				<i class="icon-play"></i>
  				<span class="text">随机播放全部</span>
  			</div>
  		</div>
  	  <div class="filter" ref="filter"></div>
  	</div>
  	<div class="bg-layer" ref="layer"></div>
  	<scroll @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" :data="songs" class="list" ref="list">
  	  <div class="song-list-wrapper">
  	  	<song-list :rank="rank" @select="selectItem" :songs="songs"></song-list>
  	  </div>
  	  <div class="loading-container" v-show="!songs.length">
  	  	<loading></loading>
  	  </div>
  	</scroll>
  </div>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll.vue'
import SongList from 'base/song-list/song-list.vue'
import Loading from 'base/loading/loading.vue'
import {prefixStyle} from 'common/js/dom'
import {mapActions} from 'vuex'
import {playlistMixin} from 'common/js/mixin'

const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')
export default {
  mixins: [playlistMixin],
  props: {
    // 接收从singer-detail传入的歌手背景图片数据
    bgImage: {
      type: String,
      default: ''
    },
    // 接收从singer-detail传入的歌曲数据
    songs: {
      type: Array,
      default: []
    },
    // 接收从singer-detail传入的歌手标题数据
    title: {
      type: String,
      default: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      scrollY: 0 // 监听纵向滚动的位置
    }
  },
  created () {
    this.probeType = 3
    this.listenScroll = true // 需要监听滚动
  },
  computed: {
    bgStyle () {
      return `background-image:url(${this.bgImage})` // 歌手背景图片样式的添加
    }
  },
  mounted () {
    this.imageHeight = this.$refs.bgImage.clientHeight // 记录歌手背景图片的高度
    this.minTranstlateY = -this.imageHeight + RESERVED_HEIGHT // 偏移量minTranstlateY预留了RESERVED_HEIGHT = 40 的高度
    // 因为list是一个vue component的对象，所以要用$el获取他的DOM
    this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px` // 设置scroll组件的高度，他的值等于背景图片的高度
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    // 监听从scroll组件派发出来的scroll事件
    scroll (pos) {
      this.scrollY = pos.y // 获取纵向滚动的实时位置值，用这个值来设置bg-layer的滚动位置
    },
    back () {
      this.$router.back() // 返回上一个页面
    },
    // 监听从song-list组件派发出来的事件
    selectItem (item, index) {
      // 一系列mutations封装成的actions的调用
      this.selectPlay({
        list: this.songs, // 从singer-detail父组件传入的歌曲数据
        index
      })
    },
    random () {
      this.randomPlay({
        list: this.songs
      })
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  watch: {
    // 监听歌手列表滚动位置的变化
    scrollY (newY) {
      let translateY = Math.max(this.minTranstlateY, newY) // 最多的滚动距离不能超过this.minTranstlateY的高度
      let zIndex = 0
      let scale = 1
      let blur = 0
      this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)` // 设置bg-layer/layer的transform
      const percent = Math.abs(newY / this.imageHeight) // 滚动的距离与歌手背景图片高度的比再取绝对值，即为歌手背景图片放大的倍数，这样设置可以跟滚动无缝贴合
      if (newY > 0) {
        scale = 1 + percent // 歌手背景图片的放大倍数
        zIndex = 10
      } else {
        blur = Math.min(20 * percent, 20) // 设置歌手背景图片在滚动列表上滚时的高斯模糊值
      }
      this.$refs.filter.style[backdrop] = `blur(${blur}px)` // 高斯模糊样式的设置
      if (newY < this.minTranstlateY) {
        zIndex = 10
        // 当歌曲列表滚动到顶时，重新设置了歌手背景图片的样式
        this.$refs.bgImage.style.paddingTop = 0
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
        this.$refs.playBtn.style.display = 'none' // 当歌曲列表滚动到顶部时，随机播放的按钮消失
      } else {
        // 当列表不在顶部时，恢复原来的样式
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = 0
        this.$refs.playBtn.style.display = '' // 恢复随机播放按钮的显示
      }
      this.$refs.bgImage.style.zIndex = zIndex // 设置歌手背景图片的层级zIndex
      this.$refs.bgImage.style[transform] = `scale(${scale})` // 设置图片被下拉放大的scale
    }
  },
  components: {
    Scroll,
    SongList,
    Loading
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped="scoped">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  
  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
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
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
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
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
