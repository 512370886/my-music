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
      songs: []
    }
  },
  computed: {
    title () {
      return this.singer.name
    },
    bgImage () {
      return this.singer.avatar
    },
    ...mapGetters([
      'singer'
    ])
  },
  created () {
    this._getDetail()
    console.log(this.singer)
  },
  methods: {
    _getDetail: function () {
      if (!this.singer.mid) {
        this.$router.push('/singer')
      }
      getSingerDetail(this.singer.mid).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalLizeSongs(res.data.list)
          console.log(this.songs)
        }
      })
    },
    _normalLizeSongs (list) {
      let ret = []
      list.forEach((item) => {
        let {musicData} = item
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