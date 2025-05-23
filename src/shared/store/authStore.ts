import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  loadTokens: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  clearTokens: () => Promise<void>;
};

export const useAuthStore = create<AuthState>(set => ({
  accessToken: null,
  refreshToken: null,

  // 앱 실행 시 한 번만 실행하여 토큰 로드
  loadTokens: async () => {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      set({
        accessToken: credentials.username,
        refreshToken: credentials.password,
      });
    }
  },

  // 로그인 시 토큰 저장 후 Zustand 상태 업데이트
  setTokens: async (accessToken, refreshToken) => {
    await Keychain.setGenericPassword(accessToken, refreshToken);
    set({ accessToken, refreshToken });
  },

  // 로그아웃 시 키체인 삭제 후 상태 초기화
  clearTokens: async () => {
    await Keychain.resetGenericPassword();
    set({ accessToken: null, refreshToken: null });
  },
}));
