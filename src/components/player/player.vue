<template>
  <div class="player" v-show="playlist.length > 0">
  	
  	<transition name="normal"
  	            @enter="enter"
  	            @after-enter="afterEnter"
  	            @leave="leave"
  	            @after-leave="afterLeave"
  	>
  		<div class="normal-player" v-show="fullScreen">
      <div class="background">
      	<img width="100%" height="100%" :src="currentSong.image"/>
      </div>
      <div class="top">
      	<div class="back" @click="back">
      	  <i class="icon-back"></i>
      	</div>
      	<h1 class="title" v-html="currentSong.name"></h1>
      	<h2 class="subtitle" v-html="currentSong.singer"></h2>
      </div>
      <div class="middle"
      	   @touchstart.prevent="middleTouchStart"
      	   @touchmove.prevent="middleTouchMove"
      	   @touchend="middleTouchEnd"
      	   >
      	   
      	<div class="middle-l" ref="middleL">
      	  <div class="cd-wrapper" ref="cdWrapper">
      	  	<div class="cd" :class="cdCls">
      	  	  <img class="image" :src="currentSong.image"/>
      	  	</div>
      	  </div>
      	  <div class="playing-lyric-wrapper">
      	  	<div class="playing-lyric">{{playingLyric}}</div>
      	  </div>
      	</div>
      	<scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
      		<div class="lyric-wrapper">
      			<div v-if="currentLyric">
      				<p ref="lyricLine"
      					 class="text"
      					 :class="{'current':currentLineNum === index}"
      					 v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
      			</div>
      		</div>
      	</scroll>
      </div>
      <div class="bottom">
      	<div class="dot-wrapper">
      			<span class="dot" :class="{'active':currentShow === 'cd'}"></span>
      			<span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
      		</div>
      	<div class="progress-wrapper">
      		<span class="time time-l">{{format(currentTime)}}</span>
      		<div class="progress-bar-wrapper">
      			<progress-bar :percent="percent" @percentChange="onProgressChange"></progress-bar>
      		</div>
      		<span class="time time-r">{{format(currentSong.duration)}}</span>
      	</div>
      	<div class="operators">
      	  <div class="icon i-left" @click="changeMode">
      	  	<i :class="iconMode"></i>
      	  </div>
      	  <div class="icon i-left" :class="disableCls">
      	  	<i @click="prev" class="icon-prev"></i>
      	  </div>
      	  <div class="icon i-center" :class="disableCls">
      	  	<i @click="togglePlaying" :class="playIcon"></i>
      	  </div>
      	  <div class="icon i-right" :class="disableCls">
      	  	<i @click="next" class="icon-next"></i>
      	  </div>
      	  <div class="icon i-right">
      	    <i class="icon" @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
      	  </div>
      	</div>
      </div>
  	</div>
  	
  	</transition>
  	
  	<transition name="mini">
  		<div class="mini-player" v-show="!fullScreen" @click="open">
  	  <div class="icon">
  	  	<img :class="cdCls" width="40" height="40" :src="currentSong.image"/>
  	  </div>
  	  <div class="text">
  	  	<h2 class="name" v-html="currentSong.name"></h2>
  	  	<p class="desc" v-html="currentSong.singer"></p>
  	  </div>
  	  <div class="control">
  	  	<progress-circle :radius="radius" :percent="percent">
  	  		<i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
  	  	</progress-circle>
  	  	
  	  </div>
  	  <div class="control" @click.stop="showPlaylist">
  	  	<i class="icon-playlist"></i>
  	  </div>
  	</div>
  	</transition>
  	<play-list ref="playlist"></play-list>
  	<!--播放功能的实现标签，audio会派发play，error， timeupdate，ended等事件，audio本身没有切换到下一首歌的功能-->
  	<audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import {mapGetters, mapMutations, mapActions} from 'vuex'
import animations from 'create-keyframe-animation' // 实现用js钩子实现css3动画的第三方库
import {prefixStyle} from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {playMode} from 'common/js/config'
// import {shuffle} from 'common/js/util'
import Lyric from 'lyric-parser' // 解析字符串第三方库
import Scroll from 'base/scroll/scroll'
import PlayList from 'components/playlist/playlist'
import {playerMixin} from 'common/js/mixin'
const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
export default {
  mixins: [playerMixin],
  data () {
    return {
      songReady: false, // 防疯狂快速点击的标志位，即只有当歌曲ready好的时候才能点击下一首或上一首歌，默认为false
      currentTime: 0, // 歌曲播放的当前时间
      radius: 32, // 迷你播放器的播放进度圆的半径，从父组件传给子组件
      currentLyric: null, // 当前歌曲的歌词
      currentLineNum: 0, // 当前歌词所在的行
      currentShow: 'cd', // 控制当前显示的是哪个页面，CD页面还是歌词页面
      playingLyric: '' // 在CD页面显示歌曲的当前播放的歌词
    }
  },
  computed: {
    // CD的旋转与暂停的样式控制，由CSS3样式来控制
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    // 大播放器的播放，暂停图标的转换
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
//  iconMode () {
//    return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
//  },
    // 迷你播放器的播放，暂停图标的切换
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    // 当按钮不能点击的时候，按钮增加一个disable
    disableCls () {
      return this.songReady ? '' : 'disable'
    },
    // 歌曲播放比例
    percent () {
      return this.currentTime / this.currentSong.duration
    },
    // 在组件中通过mapGetters从vuex中获取相关数据的当前状态，然后通过提交mutations来改变数据的状态
    ...mapGetters([
      'fullScreen', // 从vuex取到fullScreen来控制播放器的展开收起状态
      'playlist', // 从vuex取得播放列表
      'playing', // 播放器的播放状态
      'currentIndex' // 当前歌曲的索引
    ])
  },
  created () {
    this.touch = {} // 用一个实例上的touch对象来维护在不同的touch回调函数之间的通信，用于在不同的回调函数之间的数据共享，不需要添加getter和setter
  },
  methods: {
    // 点击收起播放器
    back () {
      this.setFullScreen(false) // 提交一个mutation
    },
    // 展开播放器
    open () {
      this.setFullScreen(true) // // 提交一个mutation
    },
    enter (el, done) {
      const {x, y, scale} = this._getPosAndScale() // 获取初始位置与出初始缩放比例
      // 创建一个css3动画
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0)  scale(${scale})` // 动画的初始值
        },
        60: {
          transform: `translate3d(0, 0, 0)  scale(1.1)` // 动画运行到60%时的值，scale放大到1.1倍
        },
        100: {
          transform: `translate3d(0, 0, 0)  scale(1)` // 运行到100%时的值，scale恢复到原来的大小
        }
      }
      // 注册实例化动画
      animations.registerAnimation({
        name: 'move',
        animation,
        // 预设
        presets: {
          duration: 400, // 动画的间隔
          easing: 'linear' // 缓动
        }
      })
      // 运行动画
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () {
      animations.unregisterAnimation('move') // 注销动画
      this.$refs.cdWrapper.style.animation = '' // cdWrapper 的DOM 的style样式置为空，请空animations
    },
    // 与enter相对的动画，不用animations，只要用js编写transition
    leave (el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s' // 给cdWrapper对应的DOM添加transition
      const {x, y, scale} = this._getPosAndScale() // 获取目标位置与目标缩放比例
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0)  scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done) // 动画完成时增加一个监听事件addEventListener，然后执行transitionend事件，这个事件执行完了就执行done回调函数
    },
    // afterLeave 清空动画样式
    afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    // 控制播放器的播放状态
    togglePlaying () {
      // 控制疯狂快速点击状态
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing) // 通过mapMutations里的方法提交mutation来改变播放状态
      // 歌曲在暂停和播放之间转换，当有歌词时
      if (this.currentLyric) {
        this.currentLyric.togglePlay() // 调用lyric-parser第三方库的API，实现歌词跟随歌曲的暂停和播放
      }
    },
    // audio 派发的事件方法，方法功能切换到下首歌曲
    end () {
      // 当当前播放模式是循环的时候
      if (this.mode === playMode.loop) {
        this.loop()
      // 其他播放模式的时候
      } else {
        this.next()
      }
    },
    // 循环播放的方法
    loop () {
      this.$refs.audio.currentTime = 0 // 把audio的属性currentTime重置为0，让歌曲变成开始播放的位置
      this.$refs.audio.play() // 歌曲播放
      if (this.currentLyric) {
        this.currentLyric.seek(0) // 调用lyric-parser第三方库的API，实现当单曲循环结束时，歌词偏移到开始的地方
      }
    },
    // 下一首歌
    next () {
      // 控制疯狂快速点击状态
      if (!this.songReady) {
        return
      }
      // 当歌曲列表里playlist只要一首歌曲时
      if (this.playlist.length === 1) {
        this.loop()
        return
      } else {
        let index = this.currentIndex + 1 // 下首歌，索引当前索引+1
        // 考虑到顺序播放的情况
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index) // 从mutations映射的方法
        // 当歌曲暂停时点击下一首歌时，歌曲播放了，但playing的状态没改变
        if (!this.playing) {
          this.togglePlaying() // 当playing状态处于false暂停状态时，从新调用togglePlaying()来改变playing的状态
        }
      }
      this.songReady = false // 这里songReady置为false，当ready（）执行时songReady变为true时才能点击切换到下一首
    },
    // 上一首歌
    prev () {
      // 控制疯狂快速点击状态
      if (!this.songReady) {
        return
      }
      // 当歌曲列表里playlist只要一首歌曲时
      if (this.playlist.length === 1) {
        this.loop()
        return
      } else {
        let index = this.currentIndex - 1 // 上一首歌，currentIndex-1
        // currentIndex=-1时为第一手歌，往前退就是最后一首歌的情况
        if (index === -1) {
          index = this.playlist.length - 1 // 最后一首歌的索引
        }
        this.setCurrentIndex(index) // 从mutations映射的方法
        // 当歌曲暂停时点击下一首歌时，歌曲播放了，但playing的状态没改变
        if (!this.playing) {
          this.togglePlaying() // 当playing状态处于false暂停状态时，从新调用togglePlaying()来改变playing的状态
        }
        this.songReady = false // 这里songReady置为false，当ready（）执行时songReady变为true时才能点击切换到上一首
      }
    },
    // audio标签派发的play事件，会在歌曲加载成功播放时触发运行运行，当歌曲ready的时候标志位songReady才为true
    ready () {
      this.songReady = true
      this.savePlayHistory(this.currentSong) // 用一个Action提交相应的Mutation把播放历史数据写入vuex
    },
    // 当因为网络问题或者下一首歌，上一首歌不存在的时候，audio无法加载歌曲的时候，就会触发error函数，以保证在加载歌曲失败的情况下，播放器的功能正常，否则因为加载失败而songReady不能只为true,从而导致所有的点击会失效
    error () {
      this.songReady = true
    },
    // audio运行时派发的timeupdate事件调用updateTime方法实时更新播放的当前时间，他的参数是个event对象，他的target是audio标签，audio标签有一个叫currentTime的属性，currentTime表示audio当前播放的一个时间戳，他是一个可读写的属性，可以修改他来控制播放的位置
    updateTime (e) {
      this.currentTime = e.target.currentTime // audio 标签的currentTime属性赋值个data里的currentTime
    },
    // 格式化时间戳方法
    format (interval) {
      interval = interval | 0  // 向下取整，相当于Math.floor()
      // 获取时间戳的分
      const minute = interval / 60 | 0
      const second = this._pad(interval % 60) // 获取时间戳的秒
      return `${minute}:${second}`
    },
    // 监听事件回调函数，从子组件progress-bar.vue派发出来的事件
    onProgressChange (percent) {
      const currentTime = this.currentSong.duration * percent // 根据从子组件progress-bar.vue派发出的percent计算出播放的当前时间
      this.$refs.audio.currentTime = currentTime // 重新计算 audio里的currentTime属性
      // 解决当在暂停状态下拖动后不播放的问题
      if (!this.playing) {
        this.togglePlaying()
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000) // 当拖动进度条时，歌词会根据歌曲播放的位置调到相应的位置
      }
    },
//  changeMode () {
//    const mode = (this.mode + 1) % 3
//    this.setPlayMode(mode)
//    let list = null
//    if (this.mode === playMode.random) {
//      list = shuffle(this.sequenceList)
//    } else {
//      list = this.sequenceList
//    }
//    this.resetCurrentIndex(list)
//    this.setPlayList(list)
//  },
//  resetCurrentIndex (list) {
//    let index = list.findIndex((item) => {
//      return item.id === this.currentSong.id
//    })
//    this.setCurrentIndex(index)
//  },
    // 获取歌曲歌词
    getLyric () {
      this.currentSong.getLyric().then((lyric) => {
        // 当一首歌的歌词与本身的歌词不匹配时，什么都不做，因为获取歌词的过程是一个异步的过程，防止在快速点击切换的时候，当的歌曲还没加载完成，又加载另外一首歌的歌词，实际上这样就加载了两次歌词，这样就会出现歌词乱掉的情况
        if (this.currentSong.lyric !== lyric) {
          return
        }
        this.currentLyric = new Lyric(lyric, this.handleLyric) // 解析歌词字符串，没到一个时间点都会执行handleLyric的回调 函数
        if (this.playing) {
          this.currentLyric.play() // 当歌曲在播放时，当前歌曲也随之播放，调用第三方库lyric-parser歌词解析的方法
        }
        console.log(this.currentLyric)
      }).catch(() => {
        // 当获取不到歌词时，做的重置清理动作
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    // 当歌曲的歌词每一行发生改变时回调一下，让当前的歌词变高亮
    handleLyric ({lineNum, txt}) {
      this.currentLineNum = lineNum // 单曲歌词所在的行
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5] // 如果lineNum大于5行时，当前元素往上偏移第五个
        this.$refs.lyricList.scrollToElement(lineEl, 1000) // 滚动到指定的元素，滚动时间为1秒的速度
      } else {
        this.$refs.lyricList.scrollToElement(0, 0, 1000) // 如果lineNum小于5行时，即在5行之内是，之间滚动到顶部
      }
      this.playingLyric = txt // 在CD页面显示歌曲的当前播放的歌词
    },
    middleTouchStart (e) {
      this.touch.initiated = true // touch事件初始化标志位，为true时表示已初始化
      const touch = e.touches[0] // 记录手指开始点击的位置，touches[0]表示第一个手指触碰
      this.touch.startX = touch.pageX // 记录手指开始点击的位置的X轴的值，touches[0]表示第一个手指触碰
      this.touch.startY = touch.pageY // 记录手指开始点击的位置的Y轴的值，touches[0]表示第一个手指触碰
    },
    // 播放列表的显示，调用playlist组件里的show方法
    showPlaylist () {
      this.$refs.playlist.show()
    },
    middleTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0] // 记录手指开始点击的位置，touches[0]表示第一个手指触碰
      const deltaX = touch.pageX - this.touch.startX // 当前touch的X位置与开始touch的X位置的偏移值
      const deltaY = touch.pageY - this.touch.startY // 当前touch的Y位置与开始touch的Y位置的偏移值
      // 当纵轴的偏移的绝对值大于横轴的偏移的绝对值时，认为是纵向滚动，什么都不做
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth // 歌词页面默认的起始位置是歌词页面左边框距离屏幕有边框的距离，他要么在最左边，要么全挡住CD页面在屏幕中间
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX)) // 左右滑动的距离
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth) // 滑动相对屏幕宽度的百分比
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0 ,0)` // 歌词页面滑动过程中的位置
      this.$refs.lyricList.$el.style[transitionDuration] = 0 // 滑动过程中不需要动画，置为0
      this.$refs.middleL.style.opacity = 1 - this.touch.percent // 修改CD页面的透明度
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd () {
      let offsetWidth
      let opacity
      // 从右向左滑的过程
      if (this.currentShow === 'cd') {
        // 当滑动大于0.1时
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth // 歌词页面最终停的位置
          opacity = 0
          this.currentShow = 'lyric' // 当前页面为歌词页面
        } else {
          offsetWidth = 0 // 不然歌词页面就要回到原来的位置，最右边的位置
          opacity = 1
        }
        // 从左向右滑的过程
      } else {
        if (this.touch.percent < 0.9) {
          offsetWidth = 0 // 歌词页面就要回到原来最右边的位置
          this.currentShow = 'cd' // 当前为CD页面
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth // 歌词页面最终停的位置，最左边的位置
          opacity = 0
        }
      }
      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0 ,0)` // 歌词页面上面的情况滑动的最终的位置
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms` // 歌词页面滑动的动画效果
      this.$refs.middleL.style.opacity = opacity // CD页面的显示透明度
      this.$refs.middleL.style[transitionDuration] = `${time}ms` // CD页面显示和隐藏的动画效果
    },
    // 补零方法，功能是补到几位用n = 2 来控制
    _pad (num, n = 2) {
      let len = num.toString().length // 获取传入的字符串的长度
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    // 获取唱片弹出动画的初始位置与初始缩放的尺寸
    _getPosAndScale () {
      const targetWidth = 40 // 迷你播放器CD图片的宽度
      const paddingLeft = 40 // 迷你播发器CD图片中心点与左边界的宽度
      const paddingBottom = 30 // 迷你播发器CD图片中心点与底部的宽度
      const paddingTop = 80 // 大唱片的顶部到屏幕顶部的宽度
      const width = window.innerWidth * 0.8  // 大CD图片的宽度是屏幕宽度的80%
      // 初始缩放比例
      const scale = targetWidth / width
      // 初始位置的X坐标值
      const x = -(window.innerWidth / 2 - paddingLeft)
      // 初始位置的Y坐标值
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    // 在组件中映射的mutations方法来提交mutation
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
//    setPlayingState: 'SET_PLAYING_STATE',
//    setCurrentIndex: 'SET_CURRENT_INDEX',
//    setPlayMode: 'SET_PLAY_MODE',
//    setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'savePlayHistory'
    ])
  },
  watch: {
    currentSong (newSong, oldSong) {
      // 当播放列表中只有一首歌被删除时，这个时候newSong.id是不存在的
      if (!newSong.id) {
        return
      }
      // 只要歌曲没变，就是歌曲的id没变，就return，就什么都不做
      if (newSong.id === oldSong.id) {
        return
      }
      // 当当前歌曲currentSong发生变化时，如果当前的歌曲的歌词还有的话，做的清理动作
      if (this.currentLyric) {
        this.currentLyric.stop()
        this.currentTime = 0
        this.playingLyric = ''
        this.currentLineNum = 0
      }
      // 当在微信里播放时，当微信在后台运行时，播放器的js是不会执行的，但audio是可以把当前的歌曲播放完的，当歌曲播放完后会触发audio的end事件，但这个end回调事件下的js不会执行，end回调不执行，当我们再次打开时songReady永远不会置为true,songReady不只为true那么歌曲的切换功能就不能实现了
      clearTimeout(this.timer)
      // 做一个长一点的延时调用play（），可解决使用手机浏览器从后台切到前台后当js执行的问题，这样可以保证手机浏览器从后台切到前台时，歌曲可以重新播放
      this.timer = setTimeout(() => {
        this.$refs.audio.play() // 当currentSong发生变化是调用audio的play方法
        this.getLyric() // 获取歌曲的歌词
      }, 1000)
    },
    // 监听playing的状态从而达到控制audio的播放状态
    playing (newPlaying) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause() // 调用audio的play（播放）与pause（暂停）的方法
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    PlayList
  }
}
</script>

<style scoped="scoped" lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
