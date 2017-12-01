<template>
  <scroll class="suggest" 
  	      :data="result" 
  	      :pullup="pullup"
  	      :beforeScroll="beforeScroll"
  	      @scrollToEnd="searchMore"
  	      @beforeScroll="listScroll"
  	      ref="suggest"
  	      >
  	<ul class="suggest-list">
  		<li @click="selectItem(item)" class="suggest-item" v-for="item in result">
  		  <div class="icon">
  		  	<i :class="getIconCls(item)"></i>
  		  </div>
  		  <div class="name">
  		  	<p class="text" v-html="getDisplayName(item)"></p>
  		  </div>
  		</li>
  		<loading v-show="hasMore" title=""></loading>
  	</ul>
  	<div v-show="!hasMore && !result.length" class="no-result-wrapper">
  		<no-result title="抱歉，暂无搜索结果！"></no-result>
  	</div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import {search} from 'api/search'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import Singer from 'common/js/singer'
import {mapMutations, mapActions} from 'vuex'
import NoResult from 'base/no-result/no-result'

const TYPE_SINGER = 'singer'
const perpage = 20 // 每个页面展示多少条数据
export default {
  data () {
    return {
      page: 1, // 搜索列表当前是第几页
      result: [], // 搜索结果数据
      pullup: true, // 是否开启上拉刷新的标志位，为true时开启，为false时不开启， 此数据传给scroll组件
      beforeScroll: true, // 是否要scroll监听他的开始滚动的标志位
      hasMore: true // 判断是否加载完的标志位
    }
  },
  props: {
    // 检索词，从外部组件传入的搜索词
    query: {
      type: String,
      default: ''
    },
    // 需不需要在搜索列表中展示歌手的标志位，true是需要展示，false是不需要展示
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    // 根据搜索框的内容返回来的相关数据
    search () {
      this.page = 1 // 第一次页面加载时的页数是1，重置的操作，不然就会乱
      this.hasMore = true // 第一次加载的时候，认为还有更多要加载，所以hasMore置为true，重置的操作
      this.$refs.suggest.scrollTo(0, 0) // 第一次加载数据时让scroll在query发生改变时总是滚动到顶部，重置的操作
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this.result = this._genResult(res.data)
          console.log(this.result)
          this._checkMore(res.data)
        }
      })
    },
    // 上拉刷新，在这里监听到了从scroll组件派发的事件scrollToEnd然调用的方法
    searchMore () {
//    if (!this.hasMore) {
//      return
//    }
      this.page++ // 下拉加载更多的时候，页数要自加
      this.hasMore = true
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this.result = this.result.concat(this._genResult(res.data)) // 两个数组的拼接
          console.log(this.result)
          this._checkMore(res.data)
        }
      })
    },
    // 判读每个item是歌曲还是歌手来决定图标的显示样式
    getIconCls (item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    // 每条item的显示名称
    getDisplayName (item) {
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return `${item.name}-${item.singer}`
      }
    },
    selectItem (item) {
      if (item.type === TYPE_SINGER) {
        // 构造一个歌手的对象
        const singer = new Singer({
          mid: item.singermid,
          name: item.singername
        })
        // 根据构造歌手的对象里的mid跳转到相应歌手的子路由
        this.$router.push({
          path: `/search/${singer.mid}` // 跳转到子路由
        })
        this.setSinger(singer) // 通过maMutation修改state里的singer数据
      } else {
        this.insertSong(item) // 给state里当前的playlist添加一首歌曲，而不是改变整个playlist里的数据
      }
      this.$emit('select') // 向外派发一个事件
    },
    // 代理scroll组件中的refresh()方法，在其父组件中就可以调用scroll的refresh()方法了
    refresh () {
      this.$refs.suggest.refresh()
    },
    // 监听到scroll派发过来的beforeScroll事件然后执行的回调函数
    listScroll () {
      this.$emit('listScroll') // 派发一个事件
    },
    // 根据返回来的数据判断是否所有的数据都加载完了
    _checkMore (data) {
      const song = data.song
      if (!song.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {
        this.hasMore = false
      }
    },
    // 对搜索的返回结果进行处理
    _genResult (data) {
      let ret = []
      if (data.zhida && data.zhida.singerid) {
        ret.push({...data.zhida, ...{type: TYPE_SINGER}}) // 用两个对象扩展运算符，把两对象添加到一个对象上
      }
      if (data.song) {
        ret = ret.concat(this._nomalizeSongs(data.song.list)) // 两个数字相连接
      }
      return ret
    },
    // 对data.song.list里的数据进行处理
    _nomalizeSongs (list) {
      let ret = []
      list.forEach((musicData) => {
        if (musicData.songid && musicData.albumid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    // 把在vuex定义的方法在组件中映射出来， 之后就可以在组件中使用此方法去提交相应的Mutation去改变state里相应的数据了
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
  // 当检索词发生变化是，调用search（）方法从服务端请求相关数据
    query () {
      this.search()
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped="scoped">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
