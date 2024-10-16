<template>
  <div class="p-5">
    <q-form
      v-if="isReady"
      @submit="login()"
    >
      <div class="px-6 sm:px-0">
        <div class="text-center text-lg font-bold font-medium text-[#585858]">
          登入會員
        </div>
        <div>
          <div class="text-sm font-normal text-[#21272A]">
            帳號
          </div>
          <q-input
            v-model="data.username"
            placeholder="請輸入手機號碼"
            filled
            class="mt-2 w-full"
            :autofocus="data.username.length === 0"
          />
          <div class="mt-1 w-full flex justify-end">
            <q-toggle
              v-model="rememberMeToggle"
              dense
              label="記住我"
            />
          </div>
        </div>

        <div class="mt-2">
          <div class="text-sm font-normal text-[#21272A]">
            密碼
          </div>
          <q-input
            v-model="data.password"
            :autofocus="data.username.length > 0 && data.password.length === 0"
            placeholder="請輸入密碼"
            filled
            :type="pswInputType"
            class="mt-2 w-full"
            :rules="[(val) => val.length > 0 || '請輸入密碼']"
          >
            <template #default>
              <div class="h-full flex flex-nowrap items-center pr-4">
                <q-btn
                  v-if="pswInputType === 'password'"
                  flat
                  dense
                  icon="visibility_off"
                  @click="pswInputType = 'text'"
                />
                <q-btn
                  v-else
                  flat
                  dense
                  icon="visibility"
                  @click="pswInputType = 'password'"
                />
                <q-icon
                  v-if="capsLockState"
                  size="32px"
                  name="keyboard_capslock"
                />
              </div>
            </template>
          </q-input>
        </div>

        <q-btn
          label="登入"
          unelevated
          class="rounded-s mt-6 w-full border-2 border-[#EEEEEE] border-solid py-2 font-semibold"
          type="submit"
        />
        <q-btn
          v-if="false"
          label="忘記密碼"
          color="primary"
          flat
          unelevated
          class="mt-6 w-full py-2 text-xs font-semibold underline underline-offset-1"
          type="submit"
        />
      </div>
    </q-form>
    <q-inner-loading :showing="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useKeyModifier } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router';
import { isString, pipe } from 'remeda';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import to from 'await-to-js';
import { RouteName } from '../router/router';
import { useAuthStore } from '../stores/auth.store';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const isLoading = ref(false);
const isReady = ref(false);
const authStore = useAuthStore();
const { jwtToken } = storeToRefs(authStore);

const pswInputType = ref<'password' | 'text'>('password');
const capsLockState = useKeyModifier('CapsLock');
const rememberMeToggle = ref<boolean>(false);

const data = ref({
  username: '',
  password: '',
});

// 記住我
watch(() => rememberMeToggle.value, (value) => {
  if (value) {
    localStorage.setItem('memberUserName', data.value.username);
  }
  else {
    localStorage.removeItem('memberUserName');
  }
});
onMounted(() => {
  const memberUserName = localStorage.getItem('memberUserName');
  if (memberUserName) {
    data.value.username = memberUserName;
    rememberMeToggle.value = true;
  }
  isReady.value = true;
});

watch(() => route.query, ({ phone }) => {
  if (phone && isString(phone)) {
    data.value.username = phone;
  }
}, {
  immediate: true,
});

async function login() {
  isLoading.value = true;
  const [err] = await to(authStore.handleLogin(data.value.username, data.value.password))
  if (!err) {
    router.push({ name: RouteName.HOME });
  }
  isLoading.value = false;
}
</script>

<style scoped></style>
