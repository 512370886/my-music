<template>
  <scroll class="listview"
  	      :data="data" 
  	      ref="listview"
  	      :listenScroll="listenScroll"
  	      :probeType="probeType"
  	      @scroll="scroll">
  	<ul>
  		<li v-for="group in data" class="list-group" ref="listGroup">
  		  <h2 class="list-group-title">{{group.title}}</h2>
  		  <ul>
  		  	<li @click="selectItem(item)"  v-for="item in group.items" class="list-group-item">
  		  	  <img class="avatar"  v-lazy="item.avatar"/>
  		  	  <span class="name">{{item.name}}</span>
  		  	</li>
  		  </ul>
  		</li>
  	</ul>
  	<div class="list-shortcut" @touchstart="onShotcutTouchStart" @touchmove.stop.prevent="onShotcutTouchMove">
  		<ul>
  			<li v-for="(item, index) in shortcutList" 
  				class="item" 
  				:data-index="index"
  				:class="{'current':currentIndex===index}">{{item}}</li>
  		</ul>
  	</div>
  	<!--固定标题-->
  	<div class="list-fixed" v-show="fixedTitle" ref="fixed">
  		<h1 class="fixed-title">{{fixedTitle}}</h1>
  	</div>
  	<!--loading-->
  	<div v-show="!data.length" class="loading-container">
  		<loading></loading>
  	</div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import {getData} from 'common/js/dom'
import Loading from 'base/loading/loading'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30  // 歌手标题高度（即A~Z显示的高度）
export default {
  created () {
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
    this.probeType = 3
  },
  data () {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  computed: {
    // 获取右边导航条（热门及A~Z）列表信息
    shortcutList () {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    // 滚动时获取固定标题（A~Z）
    fixedTitle () {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    // 派发事件，以便在父组件监听到子组件的点击事件
    selectItem (item) {
      this.$emit('select', item)
    },
    // 右侧导航的触摸/点击事件
    onShotcutTouchStart (e) {
      let anchorIndex = getData(e.target, 'index')
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      console.log(this.touch.anchorIndex)
      this._scrollTo(anchorIndex)
    },
    // 右侧标题导航的滑动事件
    onShotcutTouchMove (e) {
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      console.log(delta)
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    refresh () {
      this.$refs.listview.refresh()
    },
    // 接收scroll组件派发的滚动事件以获取滚动位置的Y值
    scroll (pos) {
      this.scrollY = pos.y
    },
    _scrollTo (index) {
      // 防止顶部和底部区块的点击事件
      if (!index && index !== 0) {
        return
      }
      // 鼠标拖动到顶部及底部时
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      this.scrollY = -this.listHeight[index]
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },
    // 计算和获取每个列表组listGroup的高度
    _calculateHeight () {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    data () {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    // 监听滚动的位置
    scrollY (newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 当在中间滚动时
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          this.diff = height2 + newY
          console.log(this.currentIndex)
          return
        }
      }
      // 当滚动到底部时，且-newY大于最后一个元素的上限时
      this.currentIndex = listHeight.length - 2
    },
    diff (newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style scoped="scoped" lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
