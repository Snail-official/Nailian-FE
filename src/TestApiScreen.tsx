import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { fetchHomeBanners } from './entities/banner/api';
import { fetchNails } from './entities/nail-tip/api';
import {
  fetchNailPreferences,
  saveNailPreferences,
} from './entities/nail-preference/api';
import {
  createUserNailSet,
  fetchNailSetDetail,
  fetchNailSetFeed,
  fetchRecommendedNailSets,
  fetchSimilarNailSets,
  fetchUserNailSets,
} from './entities/nail-set/api';
import { fetchUserProfile } from './entities/user/api';

// 상수 색상 정의
const COLORS = {
  backgroundGray: '#eee',
};

function TestApiScreen() {
  const [responseData, setResponseData] = useState<string | null>(null);

  /**
   * API 호출을 처리하는 함수
   *
   * @template T API 응답 데이터 타입
   * @param {() => Promise<T>} apiFunction - 호출할 API 함수
   * @param {string} label - API 호출 설명 (로깅 및 UI 표시용)
   */
  async function handleApiCall<T>(
    apiFunction: () => Promise<T>,
    label: string,
  ) {
    try {
      setResponseData(`"${label}" API 호출 중...`);
      const data = await apiFunction();
      console.log(data);
      setResponseData(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponseData(
        error instanceof Error
          ? `"${label}" API 오류: ${error.message}`
          : `"${label}" API 오류: 알 수 없는 오류 발생`,
      );
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📡 API 테스트</Text>

      {/* API 호출 버튼 목록 */}
      <Button
        title="홈 배너 조회"
        onPress={() => handleApiCall(fetchHomeBanners, '홈 배너')}
      />
      <Button
        title="네일 목록 조회"
        onPress={() =>
          handleApiCall(() => fetchNails({ page: 1, size: 5 }), '네일 목록')
        }
      />
      <Button
        title="네일 취향 조회"
        onPress={() => handleApiCall(fetchNailPreferences, '네일 취향')}
      />
      <Button
        title="네일 취향 저장"
        onPress={() =>
          handleApiCall(
            () => saveNailPreferences({ selectedPreferences: [1, 2, 3] }),
            '네일 취향 저장',
          )
        }
      />
      <Button
        title="추천 네일 세트 조회"
        onPress={() =>
          handleApiCall(fetchRecommendedNailSets, '추천 네일 세트')
        }
      />
      <Button
        title="사용자 네일 세트 조회"
        onPress={() =>
          handleApiCall(
            () => fetchUserNailSets({ page: 1, size: 5 }),
            '사용자 네일 세트',
          )
        }
      />
      <Button
        title="네일 세트 생성"
        onPress={() =>
          handleApiCall(
            () =>
              createUserNailSet({
                thumb: 1,
                index: 2,
                middle: 3,
                ring: 4,
                pinky: 5,
              }),
            '네일 세트 생성',
          )
        }
      />
      <Button
        title="네일 피드 조회"
        onPress={() =>
          handleApiCall(
            () => fetchNailSetFeed({ style: 'SIMPLE', page: 1, size: 5 }),
            '네일 피드',
          )
        }
      />
      <Button
        title="네일 세트 상세 조회"
        onPress={() =>
          handleApiCall(
            () => fetchNailSetDetail({ nailSetId: 1 }),
            '네일 세트 상세',
          )
        }
      />
      <Button
        title="유사 네일 세트 조회"
        onPress={() =>
          handleApiCall(
            () =>
              fetchSimilarNailSets({
                nailSetId: 7,
                style: 'SIMPLE',
                page: 1,
                size: 5,
              }),
            '유사 네일 세트',
          )
        }
      />
      <Button
        title="사용자 정보 조회"
        onPress={() => handleApiCall(fetchUserProfile, '사용자 정보')}
      />

      {/* API 응답 데이터 출력 */}
      {responseData && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>📝 응답 데이터:</Text>
          <Text>{responseData}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// 스타일 외부로 분리
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  responseContainer: {
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 5,
    marginTop: 20,
    padding: 10,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default TestApiScreen;
