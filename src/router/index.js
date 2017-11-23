import Vue from 'vue'
import Router from 'vue-router'

// import Rank from 'components/rank/rank.vue'
// import Recommend from 'components/recommend/recommend.vue'
// import Search from 'components/search/search.vue'
// import Singer from 'components/singer/singer.vue'
// import SingerDetail from 'components/singer-detail/singer-detail.vue'
// import Disc from 'components/disc/disc'
// import TopList from 'components/top-list/top-list'
// import UserCenter from 'components/user-center/user-center'

Vue.use(Router)

const Recommend = (resolve) => {
  import('components/recommend/recommend.vue').then((module) => {
    resolve(module)
  })
}

const Singer = (resolve) => {
  import('components/singer/singer.vue').then((module) => {
    resolve(module)
  })
}

const Rank = (resolve) => {
  import('components/rank/rank.vue').then((module) => {
    resolve(module)
  })
}

const Search = (resolve) => {
  import('components/search/search.vue').then((module) => {
    resolve(module)
  })
}

const SingerDetail = (resolve) => {
  import('components/singer-detail/singer-detail.vue').then((module) => {
    resolve(module)
  })
}

const Disc = (resolve) => {
  import('components/disc/disc').then((module) => {
    resolve(module)
  })
}

const TopList = (resolve) => {
  import('components/top-list/top-list').then((module) => {
    resolve(module)
  })
}

const UserCenter = (resolve) => {
  import('components/user-center/user-center').then((module) => {
    resolve(module)
  })
}

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
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
    },
    {
      path: '/user',
      name: 'user',
      component: UserCenter
    }
  ]
})
