import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger' // 控制台输出插件

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production' // 判断环境是否要在控制台输出数据，开发环境则输出，线上则不用输出

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : [] // 控制台输出相关配置
})
