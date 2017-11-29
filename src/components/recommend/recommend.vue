<template>
  <div class="recommend" ref="recommend">
  	<scroll ref="scroll" class="recommend-content" :data="discList">
  		<div>
  			<div v-if="recommends.length" class="slider-wrapper">
  			<slider>
  				<div v-for="item in recommends">
  					<a :href="item.linkUrl">
  						<img class="needsclick"  @load="loadImage" :src="item.picUrl"/>
  					</a>
  				</div>
  			</slider>
  		</div>
  		<div class="recommend-list">
  			<h1 class="list-title">热门歌单推荐</h1>
  			<ul>
  				<li @click="selectItem(item)" class="item" v-for="item in discList">
  					<div class="icon">
  						<img width="60" height="60" v-lazy="item.imgurl"/>
  					</div>
  					<div class="text">
  						<h2 class="name" v-html="item.creator.name"></h2>
  						<p class="desc" v-html="item.dissname"></p>
  					</div>
  				</li>
  			</ul>
  		</div>
  	</div>
  	<div class="loading-container" v-show="!discList.length">
  		<loading></loading>
  	</div>
  </scroll>
  <router-view></router-view>
 </div>
  		
</template>

<script type="text/ecmascript-6">
import {getRecommend, getDiscList} from 'api/recommend'
import {ERR_OK} from 'api/config'
import Slider from 'base/slider/slider.vue'
import Scroll from 'base/scroll/scroll.vue'
import Loading from 'base/loading/loading.vue'
import {playlistMixin} from 'common/js/mixin'
import {mapMutations} from 'vuex'

export default {
  mixins: [playlistMixin],
  data () {
    return {
      recommends: [], // 推荐slide轮播图片数据
      discList: [] // 热门歌单推荐列表数据
    }
  },
  created () {
    this._getRecommend() // 获取推荐页面轮播图数据
    setTimeout(() => {
      this._getDiscList() // 获取热门歌单推荐列表数据
    }, 1000)
  },
  methods: {
    // 重新计算列表滚动到底部的位置
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    // 进入热门歌单推荐列表详情页
    selectItem (item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      this.setDisc(item)
    },
    // 获取推荐页面轮播图数据的方法
    _getRecommend () {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          console.log(res.data.slider)
          this.recommends = res.data.slider
        }
      })
    },
    // 获取热门歌单推荐列表数据的方法
    _getDiscList () {
      getDiscList().then((res) => {
        if (res.code === ERR_OK) {
          console.log(res.data.list)
          this.discList = res.data.list
        }
      })
    },
    // 监听image的load事件，确保slider图片加载后better-scroll重新refresh()计算高度
    loadImage () {
      // 设置一个标志位，为使里面的方法只执行一次，以达到性能的优化
      if (!this.checkLoaded) {
        this.checkLoaded = true
        this.$refs.scroll.refresh()
      }
    },
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
  components: {
    Slider,
    Scroll,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
