<template>
  <transition name="slide">
  	<music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getSongList} from 'api/recommend'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
export default {
  computed: {
    // 推荐歌单详情页标题
    title () {
      return this.disc.dissname
    },
    // 推荐歌单详情页背景图片
    bgImage () {
      return this.disc.imgurl
    },
    ...mapGetters([
      'disc' // 从vuex列映射在recommend组件中写入的数据
    ])
  },
  data () {
    return {
      songs: [] // 热门歌单推荐详情页歌曲列表数据
    }
  },
  created () {
    this._getSongList() // 获取热门歌单推荐详情页数据
  },
  methods: {
    _getSongList () {
      if (!this.disc.disstid) {
        this.$router.push('/recommend')
        return
      }
      // 获取热门歌单推荐详情页数据
      getSongList(this.disc.dissid).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.cdlist[0].songlist) // 热门歌单推荐详情页歌曲列表数据
        }
      })
    },
    // 返回的数据处理
    _normalizeSongs (list) {
      let ret = []
      list.forEach((musicData) => {
        if (musicData.songid && musicData.albumid) {
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

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
    
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
