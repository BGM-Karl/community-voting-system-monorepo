<template>
  <q-list class="">
    <template
      v-for="group in list"
      :key="group.label"
    >
      <q-expansion-item
        :label="group.label"
        group="list"
        popup
      >
        <q-item
          v-for="item in group.items"
          :key="item.label"
          v-ripple
          clickable
          dense
          @click="() => router.push(item.path)"
        >
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </template>
  </q-list>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
console.log('router.options.routes', router.options.routes)

type List = {
  label: string;
  items: {
    label: string;
    path: Parameters<typeof router.push>[0];
  }[];
}[]

/** 目前預期兩層，第一層是分類，第二層是按鈕 */
const list: List = [
  {
    label: '投票活動',
    items: [
      { label: '投票活動列表', path: '/voting-events' },
    ],
  },

  {
    label: '住戶管理',
    items: [
      { label: '住戶列表', path: '/members' },
    ],
  },

]
</script>

<style scoped lang="sass">
  </style>
