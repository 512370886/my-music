<template>
  <div class="singer" ref="singer">
  	<list-view @select="selectSinger" :data = "singers" ref="list"></list-view>
  	<router-view></router-view> <!--挂载子路由-->
  </div>
</template>

<script type="text/ecmascript-6">
import {getSingerList} from 'api/singer'
import {ERR_OK} from 'api/config'
import Singer from 'common/js/singer'
import ListView from 'base/listview/listview'
import {mapMutations} from 'vuex'
import {playlistMixin} from 'common/js/mixin'
const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10
export default {
  mixns: [playlistMixin],
  data () {
    return {
      singers: []
    }
  },
  created () {
    this._getSingerList()
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.list.refresh()
    },
    // 监听从子组件派发的点击事件，实现路由跳转到子路由
    selectSinger (Singer) {
      this.$router.push({
        path: `/singer/${Singer.id}`
      })
      this.setSinger(Singer) // 歌手数据传入vuex
    },
    _getSingerList () {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singers = this._normallizeSinger(res.data.list)
        }
      })
    },
    // 整理歌手列表信息以获得自己想要的信息列表
    _normallizeSinger (list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      // 遍历入参list
      list.forEach((item, index) => {
        // 获取热门歌手列表信息（前10位歌手信息）
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({
            id: item.Fsinger_id,
            mid: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        // 获取其他歌手列表信息,判断map里是否有key值，如没有则给这个map添加key值
        const key = item.Findex
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        // 往map[key]里填充相关数据
        map[key].items.push(new Singer({
          id: item.Fsinger_id,
          mid: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      })
      // 为了得到有序列表，我们需要处理map，把map转换成有序列表
      let hot = []
      let ret = []
      for (let key in map) {
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      // ret列表按a~z的ASCII码排序
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  components: {
    ListView
  }
}
</script>

<style scoped="scoped" lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
    
</style>
