<template>
  <scroll class="listview"
  	      :data="data" 
  	      ref="listview"
  	      :listenScroll="listenScroll"
  	      :probeType="probeType"
  	      @scroll="scroll"> <!--@scroll="scroll监听scroll派发的滚动事件-->
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
    this.listenScroll = true // 此数据传到scroll组件以告知该组件需要监听滚动事件，然后scroll组件就可以派发滚动事件了
    this.listHeight = [] // 每个listgroup高度的集合
    this.probeType = 3 // scroll.vue组件要监听到实时滚动probeType的值要为3为不节流方式，默认值为1不支持监听实时滚动
  },
  data () {
    return {
      scrollY: -1, // 用于观测滚动时y轴的实时位置
      currentIndex: 0, // 当前应该显示的第几个，用于shortcut应该哪个高亮
      diff: -1 // 表示区块listGroup的上限与scrollY的差
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
    // 滚动时获取固定标题（A~Z）名称
    fixedTitle () {
      // 当在顶端往下拖动时，顶部不存在fixedTitle
      if (this.scrollY > 0) {
        return ''
      }
      // 为什么有判断一下，是因为data默认为空
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    // 派发事件，以便在父组件监听到子组件的点击事件， 告诉外部父组件我被点击了，以及被点击的元素是什么，只有外部关心这个事件的父组件才会决定点击这个元素后需要干什么
    selectItem (item) {
      this.$emit('select', item)
    },
    // 右侧导航的触摸/点击事件
    onShotcutTouchStart (e) {
      let anchorIndex = getData(e.target, 'index') // 当点击时获取每个组的index
      let firstTouch = e.touches[0] // 获取touchmove开始时手指触碰的位置
      this.touch.y1 = firstTouch.pageY // touchmove开始时手指触碰的位置的y值赋值给this.touch.y1
      this.touch.anchorIndex = anchorIndex // 记录一开始点的是哪个锚点
      console.log(this.touch.anchorIndex)
      this._scrollTo(anchorIndex) // move的时候滚动到第几个个元素
    },
    // 右侧标题导航的滑动事件
    onShotcutTouchMove (e) {
      let firstTouch = e.touches[0] // 获取touchmove移动时手指触碰的位置
      this.touch.y2 = firstTouch.pageY // touchmove移动时手指触碰的位置的y值赋值给this.touch.y2
      // (this.touch.y2 - this.touch.y1)为手指移动时在y轴上的偏移量（偏移了几个像素），delta为滚动了几个元素/锚点，然后向下取整（或0 与   Math.floor()方法一样）
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      console.log(delta)
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta // 手指移动了多少个锚点
      this._scrollTo(anchorIndex) // move的时候滚动到第几个个元素
    },
    // 向外暴露的scroll的refresh（）方法，以便singer组件可以调用
    refresh () {
      this.$refs.listview.refresh()
    },
    // 接收scroll组件派发的滚动事件以获取滚动位置的Y值，观察实时滚动的位置
    scroll (pos) {
      this.scrollY = pos.y // 获取better-scroll实时滚动时y轴的距离，根据better-scroll派发的scroll事件实时更新的
    },
    // 滚动到某个元素封装的方法
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
      this.scrollY = -this.listHeight[index] // 手动获取每个listHeight上限的一个位置
      // scrollToElement(滚动到的某个元素, 滚动动画时间)
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },
    // 计算和获取每个列表组listGroup的高度，实际上listHeight的长度是大于listGroup元素的个数的，个数多一个，列表的第一个元素的上限是第二个元素的下限
    _calculateHeight () {
      this.listHeight = []
      const list = this.$refs.listGroup // 获取每个listGroup的DOM对象
      let height = 0 // 一开始的高度是0
      this.listHeight.push(height) // 第一个元素的高度是0
      // 遍历list
      for (let i = 0; i < list.length; i++) {
        let item = list[i] // 获取每个listGroup的DOM元素
        // clientHeight可直接获取DOM元素的高度
        height += item.clientHeight
        this.listHeight.push(height) // 获取到从第一个到最后一个元素的每个元素的每个group对应的高度
      }
    }
  },
  // 监听当从singer组件从过来的data数据改变是去计算每个listGroup的高度
  watch: {
    data () {
      // 延时的作用是数据的变化到dom的变化是有一定的延时的，为了确保计算的高度一定是DOM渲染后的高度，只有当DOM渲染好了才能计算高度
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    // 监听滚动的位置， 以判断scrollY到底落在那个区间
    scrollY (newY) {
      const listHeight = this.listHeight // 因下面会多次使用，开始先保留这个listHeight（高度的集合）
      // 当滚动到顶部newY>0
      if (newY > 0) {
        this.currentIndex = 0 // 第一个元素是高亮的
        return
      }
      // 当在中间部分滚动时
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i] // 每个listGroup区间的上限
        let height2 = listHeight[i + 1] // 每个listGroup区间的下限
        // 往上滚动Y是一个负值
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          this.diff = height2 + newY
          console.log(this.currentIndex)
          return
        }
      }
      // 当滚动到底部时，且-newY大于最后一个元素的上限时
      this.currentIndex = listHeight.length - 2 // 实际上listHeight的长度是大于listGroup元素的个数的，个数多一个，列表的第一个元素的上限是第二个元素的下限
    },
    diff (newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      // 为了减少DOM操作的频度， this.fixedTop哪来的？？？
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
