import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface GradientProps {
  children: React.ReactNode;
  style: ViewStyle;
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

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    flexShrink: 0,
    height: 154,
    position: 'absolute',
    width: 375,
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
