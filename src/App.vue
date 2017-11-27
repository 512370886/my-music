<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
    	<router-view></router-view>
    </keep-alive>
    <player></player> <!--应用相关的播放器，在任何路由下都可以播放，切换路由不会影响播发器的播放-->
  </div>
</template>

<script type="text/ecmascript-6">
import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'
import Player from 'components/player/player'

export default {
  components: {
    MHeader,
    Tab,
    Player
  }
}
</script>

<style scoped="scoped" lang="stylus" rel="stylesheet/stylus">
  
</style>
