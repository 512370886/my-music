<template>
	<div ref="wrapper">
	  <slot></slot>
	</div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'

export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: null
    },
    // 作用是否要better-scroll去监听滚动事件，为true时需要，为false时不需要
    listenScroll: {
      type: Boolean,
      default: false
    },
    // better-scroll提供的pullup属性来判断是否开启上拉刷新的标志位，为true时开启，为false时不开启
    pullup: {
      type: Boolean,
      default: false
    },
    // 这个也是better-scroll的属性
    beforeScroll: {
      type: Boolean,
      default: false
    },
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  mounted () {
    setTimeout(() => {
      this._initScroll()
    }, 20)
  },
  methods: {
    _initScroll () {
      if (!this.$refs.wrapper) {
        return
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      })
      // 如果scroll监听了滚动事件，scroll组件派发的滚动事件以获取滚动位置
      if (this.listenScroll) {
        let self = this
        this.scroll.on('scroll', (pos) => { // pos 是一个对象，有x, y的属性
          self.$emit('scroll', pos) // 向外派发了以个scroll事件
        })
      }
      // 对外派发一个上拉到底的事件
      if (this.pullup) {
        // 监听scrollEnd事件，当下拉到底滚动结束的时候，然后向外派发一个scrollToEnd事件
        this.scroll.on('scrollEnd', () => {
          if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
            this.$emit('scrollToEnd') // 向外派发一个scrollToEnd事件
          }
        })
      }
      // 对外派发滚动事件
      if (this.beforeScroll) {
        // better-scroll 监听beforeScrollStart事件，然后向外派发事件
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll') // 向外派发一个beforeScroll事件
        })
      }
    },
    enable () {
      this.scroll && this.scroll.enable()
    },
    disable () {
      this.scroll && this.scroll.disable()
    },
    refresh () {
      this.scroll && this.scroll.refresh()
    },
    // better-scroll封装的方法，滚动到相依位置
    scrollTo () {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    // better-scroll封装的方法， 滚动到相应元素DOM
    scrollToElement () {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    }
  },
  watch: {
    data () {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
