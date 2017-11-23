<template>
  <div class="slider" ref="slider">
  	<div class="slider-group" ref="sliderGroup">
  	  <slot></slot>
  	</div>
  	<div class="dots">
  		<span class="dot" v-for="(item,index) in dots" :class="{'active': currentPageIndex === index}"></span>
  	</div>
  </div>
</template>

<script type="text/ecmascript-6">
import Bscroll from 'better-scroll'
import {addClass} from 'common/js/dom.js'

export default {
  data () {
    return {
      dots: [],
      currentPageIndex: 0
    }
  },
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  mounted () {
    setTimeout(() => {
      this._setSliderWidth()
      this._initDots()
      this._initSlider()
      if (this.autoPlay) {
        this._autoPlay()
      }
    }, 20)
    // 监听当视口宽度发生变化是，从新计算轮播的宽度
    window.addEventListener('resize', () => {
      if (!this.slider) {
        return
      }
      this._setSliderWidth(true)
      this.slider.refresh()
    })
  },
  methods: {
    // 设置轮播图宽度
    _setSliderWidth (isResize) {
      this.children = this.$refs.sliderGroup.children // 获取滚动元素DOM对象
      console.log(this.children.length)
      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth // 获取轮播父容器的宽度
      console.log(sliderWidth)
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i] // 获取每个元素
        addClass(child, 'slider-item') // 给每个轮播图片添加class = slider-item
        child.style.width = sliderWidth + 'px' // 给每个轮播图片设置宽度
        width += sliderWidth // 总的轮播图的宽度
      }
      if (this.loop && !isResize) {
        width += 2 * sliderWidth // 左右各克隆两个DOM为保证可循环切换，所以总的轮播图的宽度要加两倍
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    // 初始化dots
    _initDots () {
      this.dots = new Array(this.children.length) // 场地为5的空数组
    },
    // 初始化slider
    _initSlider () {
      this.slider = new Bscroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: true,
        snapLoop: this.loop,
        snapThreshold: 0.3,
        snapSpeed: 400,
        click: true
      })
      // better-scroll初始化的时候给绑定的事件，然后派发一个叫做‘scrollEnd’的事件
      this.slider.on('scrollEnd', () => {
        let pageIndex = this.slider.getCurrentPage().pageX // better-scroll提供的方法获取pageIndex,表示第几个子元素
        if (this.loop) {
          pageIndex -= 1
        }
        this.currentPageIndex = pageIndex
        if (this.autoPlay) {
          clearTimeout(this.timer)
          this._autoPlay()
        }
      })
    },
    _autoPlay () {
      let pageIndex = this.currentPageIndex + 1 // 自动播放会自动跳到下一张，所以pageIndex要加1，currentPageIndex是从0开始的
      if (this.loop) {
        pageIndex += 1
      }
      // 自动轮播定时器
      this.timer = setTimeout(() => {
        this.slider.goToPage(pageIndex, 0, 400) // better-scroll提供的一个方法‘goToPage（X轴，Y轴，时间间隔）’
      }, this.interval)
    }
  },
  // 当组件中有计时器时，组件在被切换时对计时器的清理动作，有利于内存的释放
  destroyed () {
    clearTimeout(this.timer)
  }
}
</script>

<style scoped="scoped" lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/variable.styl'

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
