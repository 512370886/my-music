<template>
  <transition name="drop">
  	<div class="top-tip" v-show="showFlag" @click.stop="hide">
  	  <slot></slot>
  	</div>
  </transition>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    // 有2秒钟的延时隐藏
    delay: {
      type: Number,
      default: 2000
    }
  },
  data () {
    return {
      showFlag: false // 控制该组件的显示和隐藏
    }
  },
  methods: {
    // 显示
    show () {
      this.showFlag = true
      clearTimeout(this.timer) // 当show()方法反复被调用时保证延时器只执行一次
      this.timer = setTimeout(() => {
        this.hide()
      }, this.delay)
    },
    // 隐藏
    hide () {
      this.showFlag = false
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped="scoped">
   @import "~common/stylus/variable"

  .top-tip
    position: fixed
    top: 0
    width: 100%
    z-index: 500
    background: $color-dialog-background
    &.drop-enter-active, &.drop-leave-active
      transition: all 0.3s
    &.drop-enter, &.drop-leave-to
      transform: translate3d(0, -100%, 0)
</style>