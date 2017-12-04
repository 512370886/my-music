<template>
  <transition name="list-fade">
  	<div class="playlist" v-show="showFlag" @click="hide">
  	  <div class="list-wrapper" @click.stop>
  	  	<div class="list-header">
  	  	  <h1 class="title">
  	  	  	<i class="icon" :class="iconMode" @click="changeMode"></i>
  	  	  	<span class="text">{{modeText}}</span>
  	  	  	<span class="clear" @click="showConfirm"><i class="icon-clear"></i></span>
  	  	  </h1>
  	  	</div>
  	  	<scroll ref="listContent" class="list-content" :refreshDelay="refreshDelay" :data="sequenceList">
  	  		<!--vue不仅给普通的元素提供给transition过渡效果，还给列表提供了transition-group过渡效果，transition-group里对应每个元素都要有不同的key值-->
  	  	  <transition-group name="list" tag="ul">
  	  	  	<li :key="item.id" ref="listItem" class="item" v-for="(item,index) in sequenceList" @click="selectItem(item,index)">
  	  	  	  <i class="current" :class="getCurrentIcon(item)"></i>
  	  	  	  <span class="text">{{item.name}}</span>
  	  	  	  <span @click.stop="toggleFavorite(item)" class="like">
  	  	  	  	<i :class="getFavoriteIcon(item)"></i>
  	  	  	  </span>
  	  	  	  <span class="delete" @click.stop="deleteOneSong(item)">
  	  	  	  	<i class="icon-delete"></i>
  	  	  	  </span>
  	  	  	</li>
  	  	  </transition-group>
  	  	</scroll>
  	  	<div class="list-operate">
  	  	  <div class="add" @click="addSong">
  	  	  	<i class="icon-add"></i>
  	  	  	<span class="text">添加歌曲到列表</span>
  	  	  </div>
  	  	</div>
  	  	<div @click="hide" class="list-close">
  	  	  <span>关闭</span>
  	  	</div>
  	  </div>
  	  <confirm @confirm="confirmClear" ref="confirm" text="是否清空播放列表" confirmBtnText="清空"></confirm>
  	  <add-song ref="addSong"></add-song>
  	</div>
  </transition>
</template>

<script type="text/ecmascript-6">
import {mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import Scroll from 'base/scroll/scroll'
import Confirm from 'base/confirm/confirm'
import {playerMixin} from 'common/js/mixin'
import AddSong from 'components/add-song/add-song'
export default {
  mixins: [playerMixin],
  data () {
    return {
      showFlag: false, // 显示，隐藏的控制
      refreshDelay: 100 // 控制scroll组件的延时调用refresh()方法
    }
  },
  computed: {
    // 播放模式的文案显示
    modeText () {
      return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
    }
//  ...mapGetters([
//    'sequenceList',
//    'currentSong',
//    'mode',
//    'playlist'
//  ])
  },
  methods: {
    // 播放列表的显示
    show () {
      this.showFlag = true
      // 确保scroll能在dom渲染后调用scroll的refresh()方法重新计算高度
      setTimeout(() => {
        this.$refs.listContent.refresh()
        this.scrollToCurrentSong(this.currentSong) // 当播放列表显示的时候，滚动到当前歌曲所在的列表位置
      }, 20)
    },
    // 播放列表的隐藏
    hide () {
      this.showFlag = false
    },
    // 给当前播放的歌曲前面添加播放图标按钮
    getCurrentIcon (item) {
      if (this.currentSong.id === item.id) {
        return 'icon-play'
      }
      return ''
    },
    // 点击播放列表的歌曲
    selectItem (item, index) {
      // 当前的播放模式为顺序播放或者单曲循环的时候，传入的setCurrentIndex（）方法的index等于selectItem（）方法接收到的index,如果是随机播放时的index要查找一下了
      if (this.mode === playMode.random) {
        // 查找当前被点击播放歌曲在当前播放列表playlist的索引，返回其index
        index = this.playlist.findIndex((song) => {
          return song.id === item.id
        })
      }
      this.setCurrentIndex(index) // 提交一个Mutation修改当前歌曲索引，让它改为我们点击的对应的歌曲
      this.setPlayingState(true) // 修改播放状态，让它在我们点击相应歌曲后处于播放状态
    },
    // 删除播放列表的一首歌
    deleteOneSong (item) {
      this.deleteSong(item) // 封装好的Action方法提交相应的Mutation修改相应歌曲的数据
      // 如果播放列表为空时，playlist这个层要隐藏
      if (!this.playlist.length) {
        this.hide()
      }
    },
    // 让列表滚动到当前播放的歌曲
    scrollToCurrentSong (current) {
      // 从当前的sequenceList获取当前歌曲current的索引
      const index = this.sequenceList.findIndex((song) => {
        return current.id === song.id
      })
      // 根据当前歌曲current的索引滚动动相应列表的元素DOM
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
    },
    // 清空播放列表时的弹窗显示
    showConfirm () {
      this.$refs.confirm.show() // 调用confirm组件里的方法
    },
    // 确认清空播放列表
    confirmClear () {
      this.deleteSongList()
      this.hide()
    },
    // 调用add-song组件的show（）方法，弹出添加歌曲列表页面
    addSong () {
      this.$refs.addSong.show()
    },
//  ...mapMutations({
//    setCurrentIndex: 'SET_CURRENT_INDEX',
//    setPlayingState: 'SET_PLAYING_STATE'
//  }),
    ...mapActions([
      'deleteSong',
      'deleteSongList'
    ])
  },
  watch: {
    // 当歌曲切换成功时
    currentSong (newSong, oldSong) {
      // 当播放列表没显示或者歌曲切换的是同一首歌时，什么都不做
      if (!this.showFlag || newSong.id === oldSong.id) {
        return
      }
      this.scrollToCurrentSong(newSong) // 播放列表滚动到切换的新歌所在的列表位置
    }
  },
  components: {
    Scroll,
    Confirm,
    AddSong
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped="scoped">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>
