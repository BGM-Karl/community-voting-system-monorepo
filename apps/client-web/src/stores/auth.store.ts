import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import to from 'await-to-js';
import { Notify } from 'quasar';
import { memberUserClient } from '../domain/member-user/api';
import { memberAuthClient } from '../domain/member-auth/api';
import { MemberUser } from '../domain/member-user/type';

export interface Token {
  accessToken: string;
  refreshToken: string;
}
interface State {
  data: string;
  token: Token;
  loginForm: { username: string; password: string };
}

export const useAuthStore = defineStore('auth', () => {
  const jwtToken = useStorage<State['token']>('token', {
    accessToken: '',
    refreshToken: '',
  });

  const selfMemberInfo = ref<MemberUser['response']['getSelf']>()

  async function handleGetSelf(tryRefresh = true) {
    const result = await memberUserClient.getSelf({
      extraHeaders: {
        Authorization: `Bearer ${jwtToken.value.accessToken}`,
      },
    });
    if (result.status === 200) {
      selfMemberInfo.value = result.body
    }
    else if (result.status === 401 && tryRefresh) {
      const [refreshErr, refreshResult] = await to(handleRefreshJwtToken())
      if (!refreshErr && refreshResult === 'success') {
        return await handleGetSelf(false)
      }
    }
    return selfMemberInfo.value
  }

  async function handleRefreshJwtToken() {
    const result = await memberAuthClient.refresh({
      extraHeaders: {
        authorization: `Bearer ${jwtToken.value.refreshToken}`,
      },
    });
    if (result.status === 200) {
      jwtToken.value = result.body
      return 'success'
    }
    return 'fail'
  }

  async function handleLogin(username: string, password: string, disableNotify: boolean = false) {
    // console.log('handleLogin');
    // :to="{ name: RouteName.MEMBER_INFO_HOME }"
    const result = await memberAuthClient.localLogin({
      body: {
        username,
        password,
      },
    });
    if (result.status === 200) {
      if (!disableNotify) {
        Notify.create({
          message: '登入成功',
          color: 'positive',
        });
      }

      jwtToken.value.accessToken = result.body.accessToken;
      jwtToken.value.refreshToken = result.body.refreshToken;
      await handleGetSelf()
      // router.push({ name: RouteName.MEMBER_INFO_HOME });
    }
    else {
      if (!disableNotify) {
        Notify.create({
          message: '登入失敗，請檢查帳號密碼',
          color: 'negative',
        });
      }
      throw new Error('登入失敗');
    }
  }

  function handleLogout() {
    jwtToken.value.accessToken = ''
    jwtToken.value.refreshToken = ''
  }

  return {
    jwtToken,
    selfMemberInfo,
    handleGetSelf,
    handleRefreshJwtToken,
    handleLogin,
    handleLogout,
  };
});
