import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RootStackParamList } from '~/shared/types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import { fetchNailSetDetail, deleteUserNailSet } from '~/entities/nail-set/api';
import { useModalStore } from '~/shared/ui/Modal';
import { toast } from '~/shared/lib/toast';
import { useErrorStore } from '~/features/error/model/errorStore';
import {
  BookmarkButton,
  SimilarNailSets,
  NailSetDisplay,
  NailSetDeleteButton,
} from './ui';

type NailSetDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'NailSetDetailPage'
>;
type NailSetDetailScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

/**
 * 네일 세트 상세 페이지
 */
function NailSetDetailPage() {
  const navigation = useNavigation<NailSetDetailScreenNavigationProp>();
  const route = useRoute<NailSetDetailScreenRouteProp>();
  const { nailSetId, styleId, styleName } = route.params;
  const { showModal } = useModalStore();
  const queryClient = useQueryClient();
  const errorStore = useErrorStore();

  // 북마크 모드 여부 확인
  const isBookmarkMode = styleName === '네일 보관함';

  // 네일 세트 상세 정보 조회
  const {
    data: nailSet,
    isLoading: loading,
    error: detailError,
  } = useQuery({
    queryKey: ['nailSet', nailSetId],
    queryFn: () => fetchNailSetDetail({ nailSetId }),
  });

  // 북마크 삭제 함수
  const handleDeleteBookmark = useCallback(async () => {
    try {
      await deleteUserNailSet({ nailSetId });
      queryClient.invalidateQueries({ queryKey: ['userNailSets'] });

      toast.showToast('삭제되었습니다', {
        position: 'bottom',
      });
      navigation.goBack();
    } catch (error) {
      errorStore.showError('보관함에서 삭제 중 오류가 발생했습니다');
    }
  }, [nailSetId, navigation, queryClient, errorStore]);

  // 삭제 모달 표시 함수
  const handleDeleteBookmarkPress = useCallback(() => {
    showModal('CONFIRM', {
      title: '해당 아트를 삭제하시겠어요?',
      description: ' ',
      confirmText: '돌아가기',
      cancelText: '삭제하기',
      onConfirm: () => {},
      onCancel: handleDeleteBookmark,
    });
  }, [showModal, handleDeleteBookmark]);

  // 로딩 중 화면
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple500} />
      </View>
    );
  }

  // 에러 화면
  if (detailError || !nailSet?.data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {detailError instanceof Error
            ? detailError.message
            : '데이터를 불러오는데 실패했습니다.'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TabBarHeader
        title={isBookmarkMode ? '아트 상세' : `${styleName} 상세`}
        onBack={() => navigation.goBack()}
        rightContent={
          <NailSetDeleteButton
            isBookmarkMode={isBookmarkMode}
            onPress={handleDeleteBookmarkPress}
          />
        }
      />

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollViewContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <NailSetDisplay nailSet={nailSet.data} />

        <BookmarkButton nailSetId={nailSetId} isBookmarkMode={isBookmarkMode} />

        <SimilarNailSets
          nailSetId={nailSetId}
          styleId={styleId}
          styleName={styleName}
          isBookmarkMode={isBookmarkMode}
          navigation={navigation}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: colors.warn_red || 'red',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scrollViewContentContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
});

export default NailSetDetailPage;
