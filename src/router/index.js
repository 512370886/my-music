import Vue from 'vue'
import Router from 'vue-router'

import Rank from '../components/rank/rank.vue'
import Recommend from '../components/recommend/recommend.vue'
import Search from '../components/search/search.vue'
import Singer from '../components/singer/singer.vue'
import SingerDetail from '../components/singer-detail/singer-detail.vue'
import Disc from 'components/disc/disc'
import TopList from 'components/top-list/top-list'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: 'Recommend'
    },
    {
      path: '/rank',
      name: Rank,
      component: Rank,
      children: [
        {
          path: ':id',
          component: TopList
        }
      ]
    },
    {
      path: '/recommend',
      name: Recommend,
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Disc
        }
      ]
    },
    {
      path: '/search',
      name: Search,
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/singer',
      name: Singer,
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    }
  ]
})
