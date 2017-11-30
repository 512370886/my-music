<template>
  <transition name="slide">
  	<music-list :rank="rank" :title="title" :bg-image="bgimage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getMusicList} from 'api/rank'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
export default {
  computed: {
    // 排行榜详情页歌曲标题
    title () {
      return this.topList.topTitle
    },
    // 排行榜详情页歌曲背景图片
    bgimage () {
      if (this.songs.length) {
        return this.songs[0].image
      }
      return ''
    },
    ...mapGetters([
      'topList' // 获取在rank组件中写入的各个排行榜详情页数据
    ])
  },
  created () {
    this._getMusicList() // 获取排行榜详情页歌曲列表数据
  },
  data () {
    return {
      songs: [], // 排行榜详情页歌曲列表数据
      rank: true // 控制排行榜详情页歌曲样式显示的标志位，传给music-list组件
    }
  },
  methods: {
    _getMusicList () {
      if (!this.topList.id) {
        this.$router.push('/rank')
        return
      }
      // 获取排行榜详情页歌曲列表数据
      getMusicList(this.topList.id).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.songlist)
          console.log(this.songs)
        }
      })
    },
    // 返回数据的处理
    _normalizeSongs (list) {
      let ret = []
      list.forEach((item) => {
        const musicData = item.data
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

<style  scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
