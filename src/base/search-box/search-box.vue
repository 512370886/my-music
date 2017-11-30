<template>
  <div class="search-box">
  	<i class="icon-search"></i>
  	<input ref="query" class="box" v-model="query" :placeholder="placeholder"/>
  	<i @click="clear" v-show="query" class="icon-dismiss"></i>
  </div>
</template>

<script type="text/ecmascript-6">
import {debounce} from 'common/js/util'
export default {
  props: {
    // 搜索框的placeholder有外部传入，实现在不同的组件间动态改变
    placeholder: {
      type: String,
      default: '搜索歌曲，歌手'
    }
  },
  data () {
    return {
      query: '' // 与input里的v-model实现双向绑定
    }
  },
  methods: {
    // 清空query
    clear () {
      this.query = ''
    },
    // 定义的方法在父组件search.vue中被调用，然后接收到父组件search.vue传过来的query,然后赋值给本组件的query
    setQuery (query) {
      this.query = query
    },
    // 让表单失去焦点的方法
    blur () {
      this.$refs.query.blur()
    }
  },
  created () {
    // 用$watch观测query的变化，然后向外派发一个事件，告诉外部我发生变化了，便于父组件的监听
    // $watch和在下面写个watch对象的能是一样的
    this.$watch('query', debounce((newQuery) => { // 通过debounce函数进行节流处理优化
      this.$emit('query', newQuery)
    }, 500))
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped="scoped">
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
