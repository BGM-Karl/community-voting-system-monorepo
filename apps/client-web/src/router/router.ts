import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    label?: string;
  }
}

export enum RouteName {
  LOGIN = 'login',

  HOME = 'home',
  VOTING_EVENT = 'voting-event',
  VOTING_VOTE = 'voting-vote',
  VOTING_RESULTS = 'voting-results'
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: {
      name: RouteName.HOME,
    }
  },
  {
    path: `/${RouteName.LOGIN}`,
    name: RouteName.LOGIN,
    component: () => import('../views/the-login.vue')
  },
  {
    path: `/${RouteName.HOME}`,
    name: RouteName.HOME,
    component: () => import('../views/voting-event-list.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: `/${RouteName.VOTING_EVENT}/:id`,
    name: RouteName.VOTING_EVENT,
    component: () => import('../views/voting-event-details.vue')
  },
  {
    path: `/${RouteName.VOTING_VOTE}/:id`,
    name: RouteName.VOTING_VOTE,
    component: () => import('../views/voting-process.vue')
  },
  {
    path: `/${RouteName.VOTING_RESULTS}/:id`,
    name: RouteName.VOTING_RESULTS,
    component: () => import('../views/voting-results.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
