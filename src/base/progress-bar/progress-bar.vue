<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
  	<div class="bar-inner">
  	  <div class="progress" ref="progress"></div>
  	  <!--better-scroll 内部封装有一些对touch事件的监听，我们的自己受控处理这些touch事件，prevent为了阻止浏览器的默认行为-->
  	  <div class="progress-btn-wrapper" ref="progressBtn"
  	       @touchstart.prevent="progressTouchStart"
  	       @touchmove.prevent="progressTouchMove"
  	       @touchend="progressTouchEnd"
  	  >
  	  	<div class="progress-btn"></div>
  	  </div>
  	</div>
  </div>
</template>

<script type="text/ecmascript-6">
import {prefixStyle} from 'common/js/dom'
const progressBtnWidth = 16 // 进度条上的小球的按钮的宽度
const transform = prefixStyle('transform')
export default {
  props: {
    // 从父组件传入的百分比
    percent: {
      type: Number,
      default: 0
    }
  },
  created () {
    this.touch = {} // 用一个实例上的touch对象来维护在不同的touch回调函数之间的通信，用于在不同的回调函数之间的数据共享
  },
  methods: {
    progressTouchStart (e) {
      this.touch.initiated = true // touch事件初始化标志位，为true时表示已初始化
      this.touch.startX = e.touches[0].pageX // 记录手指开始点击的位置的X轴的值，touches[0]表示第一个手指触碰
      this.touch.left = this.$refs.progress.clientWidth // 记录进度条的已经滚过的偏移宽度， 即offSetWidth的值
    },
    progressTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      const deltaX = e.touches[0].pageX - this.touch.startX  // 当前位置减去起始位置得到移动的偏移量
      // this.touch.left + deltaX 为开始的位置+手指移动的偏移量， offsetWidth偏移量这个值首先要大于0，然后总的偏移值要小于进度条的总宽度
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
      this._offset(offsetWidth) // 置小球按钮以及进度条的偏移
    },
    // 拖动结束后
    progressTouchEnd () {
      this.touch.initiated = false
      this._triggerPercent() // 派发一个事件，去通知父组件改变了多少percent
    },
    // 点击后
    progressClick (e) {
      // 该方法获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置。
      const rect = this.$refs.progressBar.getBoundingClientRect() // 获取element实际的top、bottom、left、right定位值，我们利用它计算element的高度，如果为0，即可认为element不可见
      console.log(rect)
      const offsetWidth = e.pageX - rect.left // e.pageX点击的位置到屏幕最左边的距离
      this._offset(offsetWidth)
      // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
      // this._offset(e.offsetX) e.offsetX获取点击后的偏移量来设置小球按钮以及进度条的偏移
      this._triggerPercent() // 派发一个事件，去通知父组件改变了多少percent
    },
    // 点击或者拖动后重新计算播放比例
    _triggerPercent () {
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth // 计算进度条的总宽度
      // 点击或者拖动后运动的播放比例
      const percent = this.$refs.progress.clientWidth / barWidth
      this.$emit('percentChange', percent) // 向外派发一个事件，已经告诉父组件子组件当前运动了多少比例
    },
    // 设置小球按钮以及进度条的偏移
    _offset (offSetWidth) {
      this.$refs.progress.style.width = `${offSetWidth}px` // 进度条的偏移
      this.$refs.progressBtn.style[transform] = `translate3d(${offSetWidth}px, 0, 0)` // 小球按钮的偏移
    }
  },
  watch: {
    percent (newPercent) {
      // 判断条件为解决拖动进度条与播放进度的冲突
      if (newPercent >= 0 && !this.touch.initiated) {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth // 计算进度条的总宽度
        const offSetWidth = newPercent * barWidth // 进度条偏移的宽度
        this._offset(offSetWidth) // 设置进度条以及圆形按钮偏移的宽度
      }
    }
  }
}
</script>

<style scoped="scoped" lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
