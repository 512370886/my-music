<template>
	<transition name="slide">
	  <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
	</transition>
  
</template>

<script type="text/ecmascript-6">
import {mapGetters} from 'vuex'
import {getSingerDetail} from 'api/singer'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
import MusicList from 'components/music-list/music-list.vue'

export default {
  data () {
    return {
      songs: [] // 歌手详情页的歌曲列表
    }
  },
  computed: {
    title () {
      return this.singer.name
    },
    bgImage () {
      return this.singer.avatar
    },
    // 从vuex取在组件singer里写入的歌手数据
    ...mapGetters([
      'singer'
    ])
  },
  created () {
    this._getDetail() // 获取歌手列表详情数据
    console.log(this.singer)
  },
  methods: {
    _getDetail: function () {
      // 在当前页面刷新获取不到this.singer.mid时回退到歌手页面，处理一些边界情况的常用手段
      if (!this.singer.mid) {
        this.$router.push('/singer')
      }
      // 获取歌手列表详情数据
      getSingerDetail(this.singer.mid).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalLizeSongs(res.data.list) // 歌手详情页的歌曲列表赋值
          console.log(this.songs)
        }
      })
    },
    _normalLizeSongs (list) {
      let ret = []
      list.forEach((item) => {
        let {musicData} = item // 对象结构负值，即一个新对象的值等于上面遍历出来的对象item，拿到musicData的一个对象
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped="scoped">
  @import "~common/stylus/variable"
  
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>