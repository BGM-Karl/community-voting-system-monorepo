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

const list: List = [
  {
    label: 'voting activity',
    items: [
      { label: 'Voting event list', path: '/voting-events' },
    ],
  },

  {
    label: 'resident management',
    items: [
      { label: 'household list', path: '/members' },
    ],
  },

]
</script>

<style scoped lang="sass">
  </style>
