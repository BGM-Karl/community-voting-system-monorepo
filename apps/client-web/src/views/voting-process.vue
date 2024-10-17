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
      <form @submit.prevent="submitVote">
        <div
          v-for="option in votingEvent.options"
          :key="option.id"
          class="mb-2"
        >
          <q-checkbox
            v-model="selectedOptions"
            :val="option.id"
            :label="option.content"
          />
        </div>
        <p class="text-sm text-gray-600 mb-4">
          You can select up to {{ votingEvent.maxSelectableOptions }}  option
        </p>
        <q-btn
          type="submit"
          color="primary"
          :disable="!isValidSelection"
        >
          vote
        </q-btn>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RouteName } from '../router/router';
import { promiseTimeout, useAsyncState } from '@vueuse/core';
import { getVotingEvent, votingEventClient } from '../domain/voting-event/api';
import to from 'await-to-js';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth.store';
import { storeToRefs } from 'pinia';
import { get } from 'lodash-es';


const authStore = useAuthStore();
const { jwtToken } = storeToRefs(authStore);
const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const selectedOptions = ref<string[]>([]);

const votingEventId = computed(() => route.params.id as string);
const {
  state: votingEvent,
  execute,
  isLoading,
  isReady
} = useAsyncState(async () => {
  const result = await getVotingEvent(votingEventId.value);
  if (result?.status === 'Ended') {
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

const isValidSelection = computed(() => {
  return selectedOptions.value.length > 0 &&
    selectedOptions.value.length <= (votingEvent.value?.maxSelectableOptions ?? 0);
});

const submitVote = async () => {
  if (isValidSelection.value) {
    console.log('提交的投票:', selectedOptions.value);
    const [error, result] = await to(votingEventClient.vote({
      params: { id: votingEventId.value },
      body: { optionIdList: selectedOptions.value },
      extraHeaders: {
        Authorization: `Bearer ${jwtToken.value.accessToken}`
      }
    }));

    console.log('Voting results', result);

    if (error) {
      console.error('Vote failed', error);
      $q.notify({
        type: 'negative',
        message: 'Vote failed'
      });
      return;
    }
    else if (result.status === 200) {
      $q.notify({
        type: 'positive',
        message: '投票成功'
      });

    }


    else if (result.status === 401) {
      $q.notify({
        type: 'negative',
        message: 'Vote failed，請先登入'
      });
      router.push({ name: RouteName.LOGIN });
      return;
    }
    else if (get(result, 'body.message', undefined)) {
      $q.notify({
        type: 'negative',
        message: `Vote failed ${get(result, 'body.message', '未知錯誤')}`
      });
    }
    await promiseTimeout(800);
    const link = router.resolve({ name: RouteName.VOTING_RESULTS, params: { id: votingEventId.value } });
    window.location.href = link.href;


  }
};
</script>