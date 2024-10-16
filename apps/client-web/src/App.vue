<template>
  <q-layout view="hHh lpR fFf">
    <q-header
      elevated
      class="bg-primary text-white"
    >
      <q-toolbar>
        <q-btn
          v-if="canGoBack"
          flat
          round
          dense
          icon="arrow_back"
          @click="goBack"
        />
        <q-toolbar-title>
          區權投票系統
        </q-toolbar-title>
        <template v-if="route.name !== RouteName.LOGIN">
          <q-btn
            v-if="route.name !== RouteName.HOME"
            flat
            round
            dense
            icon="home"
            @click="goHome"
          />
          <q-btn
            v-else
            flat
            round
            dense
            icon="logout"
            @click="handleLogout"
          />
        </template>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">

import { useMeta, useQuasar } from 'quasar';
import { version } from '../package.json';
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth.store';
import { storeToRefs } from 'pinia';
import { RouteName } from './router/router';
const $q = useQuasar();

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const { selfMemberInfo } = storeToRefs(authStore);

router.isReady().then(async () => {
  const currentRoute = router.currentRoute.value;
  console.log('currentRoute', currentRoute);

  $q.loading.show();
  if (currentRoute.meta.requiresAuth) {
    await authStore.handleGetSelf();
    $q.loading.hide();
    if (!selfMemberInfo.value) {
      // if (currentRoute.name !== 'login') {
      //   router.push({ name: 'login' });
      // }
      if (currentRoute.meta.requiresAuth) {
        router.push({ name: RouteName.LOGIN });
      }
    }
    else {
      if (currentRoute.name === 'login') {
        $q.dialog({
          title: '歡迎使用區權投票系統',
          message: '請選擇您感興趣的投票事件',
          persistent: true,
          ok: '進入投票',
          cancel: '系統說明文件',
        })
          .onCancel(() => {
            window.open('https://capable-fear-dae.notion.site/11cc3123f68f80659578cbeaee9759b2?pvs=4', '_blank');
          })
          ;
        router.push({ name: RouteName.HOME });
      }
    }
  }
  $q.loading.hide();


});

const canGoBack = computed(() => {
  const routeName = route.name as RouteName;
  return [RouteName.HOME, RouteName.LOGIN].includes(routeName) === false
});

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push('/');
};
const handleLogout = () => {
  useAuthStore().handleLogout();
  router.push('/login');
};

useMeta(() => ({
  title: `區權投票系統`,
  // eslint-disable-next-line no-undef
  titleTemplate: (title) => `${title} v${version}`,
}));

console.log(`log 一下`);


</script>

<style lang="sass">
html, body, #app
  width: 100%
  height: 100%
  padding: 0
  margin: 0

#app
  display: flex
  flex-direction: column
</style>
