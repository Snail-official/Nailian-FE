import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { BottomSheet } from '~/pages/ar_experience/ui/BottomSheet';

/**
 * AR 체험 페이지
 * @returns {JSX.Element} AR 체험 페이지 컴포넌트
 */
export default function ARExperiencePage() {
  const [isExpanded, setIsExpanded] = useState(false);

  // 바텀시트 상태 변경 시 호출되는 콜백
  const handleSheetChanges = useCallback((index: number) => {
    setIsExpanded(index === 1);
  }, []);

  // 위치 전환 핸들러
  const toggleBottomSheet = useCallback(() => {
    // 핸들 컴포넌트에서 사용자가 직접 누를 때 호출
    // 실제 이동은 바텀시트 자체에서 처리됨
  }, []);

  // 바텀시트 핸들 컴포넌트
  const renderCustomHandle = (
    <View style={styles.header}>
      <View style={styles.indicator} />
      <TouchableOpacity onPress={toggleBottomSheet}>
        <Text style={styles.headerText}>
          {isExpanded ? '25% 위치로 내리기' : '75% 위치로 올리기'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 배경 영역 */}
      <View style={styles.backgroundArea} />

      {/* 바텀시트 */}
      <BottomSheet
        snapPoints={['25%', '75%']}
        initialIndex={0}
        onChange={handleSheetChanges}
        handleType="custom"
        customHandle={renderCustomHandle}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>바텀 시트 내용</Text>
        <Text style={styles.subtitle}>
          {isExpanded
            ? '바텀시트가 화면의 75% 위치에 표시됩니다.'
            : '바텀시트가 화면의 25% 위치에 표시됩니다.'}
        </Text>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.contentText}>
              확장된 상태에서만 보이는 추가 콘텐츠입니다.
            </Text>
            <Text style={styles.contentText}>
              @gorhom/bottom-sheet 라이브러리를 사용하여 부드럽고 안정적인
              바텀시트를 구현했습니다.
            </Text>
            <Text style={styles.contentText}>
              사용자 드래그 후 자동으로 25% 또는 75% 위치에 안착합니다.
            </Text>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundArea: {
    backgroundColor: colors.black,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 0,
  },
  bottomSheetBackground: {
    backgroundColor: colors.kakaoYellow,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  contentText: {
    ...typography.body2_SB,
    color: colors.gray700,
    marginBottom: 10,
  },
  expandedContent: {
    alignItems: 'center',
    marginTop: 30,
    padding: 10,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.kakaoYellow,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 15,
  },
  headerText: {
    ...typography.body2_SB,
    color: colors.gray700,
    marginTop: 10,
  },
  indicator: {
    backgroundColor: colors.gray700,
    borderRadius: 3,
    height: 4,
    width: 40,
  },
  subtitle: {
    ...typography.body2_SB,
    color: colors.gray700,
    marginTop: 10,
    textAlign: 'center',
  },
  title: {
    ...typography.head1_B,
    color: colors.gray800,
    marginTop: 20,
  },
});
