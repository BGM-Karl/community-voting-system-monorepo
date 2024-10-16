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
        投票結果: {{ votingEvent.title }}
      </h1>

      <div v-if="votingEvent.result">
        <p class="mb-4">
          {{ votingEvent.description }}
        </p>
        <div
          v-for="option in optionResults"
          :key="option.optionId"
          class="mb-4"
        >
          <p class="font-semibold">
            {{ option.content }}
          </p>
          <div class="flex items-start flex-col gap-0.5">
            <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2 relative">
              <div
                class="bg-blue-600 h-2.5 rounded-full absolute"
                :style="{ width: `${option.percentage}%` }"
              />
              <div
                class="bg-gray-300 h-2.5  absolute -translate-x-1/2 w-0.5"
                :style="{ left: `${(votingEvent.requiredParticipationRate + votingEvent.requiredWeightRate) / 2 * 100}%` }"
              />
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2 relative">
              <div
                class="bg-yellow-400 h-2.5 rounded-full absolute"
                :style="{ width: `${option.participationPercentage}%` }"
              />
              <div
                class="bg-gray-300 h-2.5  absolute -translate-x-1/2 w-0.5"
                :style="{ left: `${(votingEvent.requiredParticipationRate) * 100}%` }"
              />
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2 relative">
              <div
                class="bg-green-600 h-2.5 rounded-full absolute"
                :style="{ width: `${option.weightPercentage}%` }"
              />
              <div
                class="bg-gray-300 h-2.5  absolute -translate-x-1/2 w-0.5"
                :style="{ left: `${(votingEvent.requiredWeightRate) * 100}%` }"
              />
            </div>
            <span class="text-sm">{{ option.percentage }}%</span>
          </div>
          <p class="text-sm text-gray-600">
            <span class="text-yellow-400">● </span>票數: {{ option.votes }} ({{ option.participationPercentage }}%) |
            <span class="text-green-600">● </span>權重: {{ option.weight }} ({{ option.weightPercentage }}%)
          </p>
        </div>
        <div class="mt-6">
          <p>
            參與戶數: {{ votingEvent.result.participatingHouseholds }} / {{ votingEvent.totalHouseholds }}
            <span v-html="participationRateText" />
          </p>
          <p>
            參與權重: {{ votingEvent.result.participatingWeight }} / {{ votingEvent.totalWeight }}
            <span v-html="weightRateText" />
          </p>
        </div>
      </div>
      <div v-else>
        <p>尚未有投票結果</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { promiseTimeout, useAsyncState } from '@vueuse/core';
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getVotingEvent } from '../domain/voting-event/api';
import { RouteName } from '../router/router';


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


const getPercentage = (option: NonNullable<typeof votingEvent['value']>['result']['optionResults'][number]) => {
  const result = {
    participationPercentage: 0,
    weightPercentage: 0,
    percentage: 0
  }
  if (!votingEvent.value || !votingEvent.value.result) return result;
  if (votingEvent.value.totalHouseholds === 0) return result;
  const totalVotes = votingEvent.value.totalHouseholds;
  result.participationPercentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
  const totalWeight = votingEvent.value.totalWeight;
  result.weightPercentage = totalWeight > 0 ? Math.round((option.weight / totalWeight) * 100) : 0;
  // return (votesRate + weightRate) / 2;
  result.percentage = (result.participationPercentage + result.weightPercentage) / 2;
  return result;
};


const optionResults = computed(() => {
  if (!votingEvent.value || !votingEvent.value.result) return [];
  return votingEvent.value.result.optionResults
    .map(option => ({
      ...option,
      ...getPercentage(option),
    }))
    .sort((a, b) => b.percentage - a.percentage);

});


/** 參與戶數參與率說明文字 */
const participationRateText = computed(() => {
  const eventItem = votingEvent.value;
  if (!eventItem || !eventItem.result) return '';
  // 參與率
  const rate = eventItem.result.participatingHouseholds / eventItem.totalHouseholds
  const rateText = `${Math.round(rate * 100)}%`
  // 門檻率
  const requiredRateText = `${Math.round(eventItem.requiredParticipationRate * 100)}%`
  // 通過或未通過
  const passText = rate >= eventItem.requiredParticipationRate ? '通過' : '未通過'
  // 通過或未通過的文字顏色
  const passColor = rate >= eventItem.requiredParticipationRate ? 'text-green-600' : 'text-red-600'
  return `（參與率: ${rateText} <span class="${passColor}">${passText}目標${requiredRateText}</span>）`
});

/** 參與權重率說明文字 */
const weightRateText = computed(() => {
  const eventItem = votingEvent.value;
  if (!eventItem || !eventItem.result) return '';
  // 參與率
  const rate = eventItem.result.participatingWeight / eventItem.totalWeight
  const rateText = `${Math.round(rate * 100)}%`
  // 門檻率
  const requiredRateText = `${Math.round(eventItem.requiredWeightRate * 100)}%`
  // 通過或未通過
  const passText = rate >= eventItem.requiredWeightRate ? '通過' : '未通過'
  // 通過或未通過的文字顏色
  const passColor = rate >= eventItem.requiredWeightRate ? 'text-green-600' : 'text-red-600'
  return `（參與率: ${rateText} <span class="${passColor}">${passText}目標${requiredRateText}</span>）`
});

</script>