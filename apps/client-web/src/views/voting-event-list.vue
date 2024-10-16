<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">
      投票事件列表
    </h1>
    <q-inner-loading :showing="isLoading" />
    <q-list
      v-if="isReady && votingEvents"
      bordered
      separator
    >
      <q-item
        v-for="votingEventItem in votingEvents.data"
        :key="votingEventItem.id"
        v-ripple
        clickable
        @click="showEventDetails(votingEventItem.id)"
      >
        <q-item-section>
          <q-item-label class="text-lg font-semibold">
            {{ votingEventItem.title }}
          </q-item-label>
          <q-item-label caption>
            {{ votingEventItem.description }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-chip
            :color="getStatusColor(votingEventItem.status)"
            text-color="white"
          >
            {{ votingEventItem.status }}
          </q-chip>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { RouteName } from '../router/router';
import { useAsyncState } from '@vueuse/core'
import { getVotingEvents } from '../domain/voting-event/api';


const router = useRouter();

const { state: votingEvents, isLoading, isReady, execute } = useAsyncState(async () => {
  return await getVotingEvents()
}, undefined)
const getStatusColor = (status?: string) => {
  switch (status) {
    case '未開始': return 'blue';
    case '進行中': return 'green';
    case '已結束': return 'red';
    default: return 'grey';
  }
};

const showEventDetails = (eventId: string) => {
  router.push({ name: RouteName.VOTING_EVENT, params: { id: eventId } });
};
</script>