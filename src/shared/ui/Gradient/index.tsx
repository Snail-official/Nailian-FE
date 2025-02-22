import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

/**
 * 그라디언트 컨테이너 컴포넌트
 * 하단에서 상단으로 흰색 그라디언트 효과를 적용하는 컨테이너입니다.
 * 기본적으로 하단에 고정되며, 내부 컨텐츠는 하단에 정렬됩니다.
 * @example
 * <Gradient>
 *   <Button onPress={handlePress}>
 *     다음
 *   </Button>
 * </Gradient>
 */
interface GradientProps {
  /** 그라디언트 내부에 렌더링할 컨텐츠 */
  children: React.ReactNode;
  /** 컨테이너 스타일 */
  style?: ViewStyle;
}

function Gradient({ children, style }: GradientProps) {
  return (
    <View style={[styles.container, style]}>
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

Gradient.defaultProps = {
  style: {
    bottom: 0,
    flexShrink: 0,
    height: 154,
    position: 'absolute',
    width: 375,
  },
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  contentContainer: {
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
