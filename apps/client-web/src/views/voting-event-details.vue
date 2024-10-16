<template>
  <div>
    <q-inner-loading
      :showing="isLoading"
      label="正在載入投票資訊"
    />

    <div
      v-if="isReady && votingEvent"
      class="p-4"
    >
      <h1 class="text-2xl font-bold mb-4">
        {{ votingEvent.title }}
      </h1>
      <p class="mb-4">
        {{ votingEvent.description }}
      </p>
      <div class="mb-4">
        <q-chip
          :color="getStatusColor(votingEvent.status)"
          text-color="white"
        >
          {{ votingEvent.status }}
        </q-chip>
      </div>
      <div class="mb-4">
        <p>開始時間: {{ formatDate(votingEvent.timestamp.startAt) }}</p>
        <p>結束時間: {{ formatDate(votingEvent.timestamp.endAt) }}</p>
      </div>
      <q-btn
        v-if="votingEvent.status === '進行中'"
        color="primary"
        @click="startVoting"
      >
        開始投票
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { date } from 'quasar';
import { RouteName } from '../router/router';
import { useAsyncState } from '@vueuse/core';
import { getVotingEvent } from '../domain/voting-event/api';

interface VotingEvent {
  _id: string;
  title: string;
  description: string;
  status: '未開始' | '進行中' | '已結束';
  startTime: string;
  endTime: string;
}

const route = useRoute();
const router = useRouter();

const votingEventId = computed(() => route.params.id as string);
const {
  state: votingEvent,
  execute,
  isLoading,
  isReady
} = useAsyncState(async () => {
  const result = await getVotingEvent(votingEventId.value);
  if (result?.status === '已結束') {
    router.replace({
      name: RouteName.VOTING_RESULTS,
      params: { id: votingEventId.value }
    });
  }
  return result;
}, undefined)

watch(votingEventId, () => {
  execute();
});


// onMounted(() => {
//   const votingEventId = route.params.id as string;
//   const votingEventItem = votingEventData[votingEventId];
//   if (!votingEventItem) {
//     return;
//   }
//   votingEvent.value = votingEventItem
//   if (votingEventItem.status === '已結束') {
//     router.replace({
//       name: RouteName.VOTING_RESULTS,
//       params: { id: votingEventItem._id }
//     });
//   }
// });

const getStatusColor = (status: string) => {
  switch (status) {
    case '未開始': return 'blue';
    case '進行中': return 'green';
    case '已結束': return 'red';
    default: return 'grey';
  }
};

const formatDate = (dateString: string) => {
  return date.formatDate(dateString, 'YYYY-MM-DD HH:mm:ss');
};

const startVoting = () => {
  router.replace({
    name: RouteName.VOTING_VOTE,
    params: { id: votingEventId.value }
  });
};
</script>