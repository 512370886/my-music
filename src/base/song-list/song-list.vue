<template>
  <div class="song-list">
  	<ul>
  	  <li @click="selectItem(song, index)" class="item" v-for="(song, index) in songs">
  	  	<div class="rank" v-show="rank">
  	  		<span :class="getRankCls(index)">{{getRankText(index)}}</span>
  	  	</div>
  	  	<div class="content">
  	  	  <h2 class="name">{{song.name}}</h2>
  	  	  <p class="desc">{{getDesc(song)}}</p>
  	  	</div>
  	  </li>
  	</ul>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    // 接收从music-list父组件传过来的数据
    songs: {
      type: Array,
      default: []
    },
    // 接收从music-list父组件传过来的数据
    rank: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 点击相应的歌曲
    selectItem (item, index) {
      this.$emit('select', item, index) // 派发一个select事件，告诉父组件我被点击了以及被点击的元素是什么他的索引是什么，以便父组件可以监听得到
    },
    // 歌曲描述
    getDesc (song) {
      return `${song.singer} · ${song.album}`
    },
    // 排行榜详情页前三名歌曲添加图片样式
    getRankCls (index) {
      if (index <= 2) {
        return `icon icon${index}` // 图片样式
      } else {
        return 'text'
      }
    },
    // 排行榜详情页第四名以后的列表的排名text显示
    getRankText (index) {
      if (index > 2) {
        return index + 1 // 因排行是从1开始排的，索引index要+1
      }
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped="scoped">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  
  .song-list
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      .rank
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-theme
          font-size: $font-size-large
      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
</style>
