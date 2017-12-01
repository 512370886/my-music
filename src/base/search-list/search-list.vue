<template>
  <div class="search-list" v-show="searches.length">
  	<transition-group name="list" tag="ul">
  		<li :key="item" @click="selectItem(item)" class="search-item" v-for="item in searches">
  		  <span class="text">{{item}}</span>
  		  <span class="icon" @click.stop="deleteOne(item)">
  		  	<i class="icon-delete"></i>
  		  </span>
  		</li>
  	</transition-group>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    searches: {
      type: Array,
      default: []
    }
  },
  methods: {
    // 选择
    selectItem (item) {
      this.$emit('select', item) // 派发一个点击事件
    },
    // 删除
    deleteOne (item) {
      this.$emit('delete', item) // 派发一个点击事件
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped="scoped">
  @import "~common/stylus/variable"

  .search-list
    .search-item
      display: flex
      align-items: center
      height: 40px
      overflow: hidden
      &.list-enter-active, &.list-leave-active
        transition: all 0.1s
      &.list-enter, &.list-leave-to
        height: 0
      .text
        flex: 1
        color: $color-text-l
      .icon
        extend-click()
        .icon-delete
          font-size: $font-size-small
          color: $color-text-d
</style>
