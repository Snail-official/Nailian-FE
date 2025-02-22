import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

/**
 * 하단 그라디언트 컴포넌트
 * 화면 하단에 흰색 그라디언트 효과를 적용하는 컨테이너입니다.
 * 주로 버튼과 함께 사용되어 하단 영역을 자연스럽게 처리합니다.
 * @example
 * <Gradient>
 *   <Button variant="primaryMedium">
 *     <Text>다음</Text>
 *   </Button>
 * </Gradient>
 */
interface GradientProps {
  /** 그라디언트 내부에 렌더링할 컨텐츠 */
  children: React.ReactNode;
}

function Gradient({ children }: GradientProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.gradient}
        colors={[
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 0)',
        ]}
        locations={[0, 0.69, 0.94]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      />
      <View style={styles.contentContainer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    flexShrink: 0,
    height: 154,
    position: 'absolute',
    width: 375,
  },
  contentContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    width: '100%',
  },
  gradient: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
});

export default Gradient;
