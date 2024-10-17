<template>
  <q-layout view="hHh LpR fFf">
    <q-header class="bg-[#1C4373]">
      <q-toolbar>
        <q-toolbar-title>
          <q-btn
            dense
            flat
            round
            icon="menu"
            @click="toggleDrawerVisible()"
          />

          <span class="text-xl font-medium">
            mamagement-system
          </span>
        </q-toolbar-title>

        <!-- <q-icon
          name="logout"
          size="1.5rem"
          class="mr-1 cursor-pointer"
          @click="logout"
        /> -->

        <q-icon
          name="person"
          size="1.5rem"
          class="mr-1"
        />
        <!-- {{ user?.name }} -->
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerVisible"
      show-if-above
      side="left"
      bordered
    >
      <menu-nav />
    </q-drawer>

    <q-page-container>
      <q-page class="flex-col">
        <router-view />
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { version } from '../package.json'
import MenuNav from './components/menu-nav.vue'

const $q = useQuasar()
$q.iconMapFn = (iconName) => ({
  icon: iconName.includes('sym_r') ? iconName : `sym_r_${iconName}`,
})

const router = useRouter()

router.push('')

watchEffect(() => {
  document.title = `mamagement-system v${version}`
})

const [drawerVisible, toggleDrawerVisible] = useToggle(true)
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
