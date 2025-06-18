import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '~/shared/types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import { fetchNailSetDetail } from '~/entities/nail-set/api';
import {
  BookmarkButton,
  SimilarNailSets,
  DeleteModal,
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteBookmarkPress = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

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

      <DeleteModal
        nailSetId={nailSetId}
        navigation={navigation}
        show={showDeleteModal}
        onClose={handleDeleteModalClose}
      />
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
