import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';

/**
 * 메인 홈 푸터 컴포넌트
 */
export default function Footer() {
  return (
    <View style={styles.footerSection}>
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerText}>
            문의 메일 : snail.official.kr@gmail.com
          </Text>
          <View style={styles.footerNotice}>
            <Text style={styles.footerText}>유의사항</Text>
            <Text style={styles.footerText}>
              • 위 아트 이미지는 모두 AI로 생성되었습니다.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginLeft: scale(26),
    marginTop: vs(25),
  },
  footerNotice: {
    marginBottom: vs(28),
    marginTop: vs(14),
  },
  footerSection: {
    backgroundColor: colors.gray50,
    height: Platform.OS === 'android' ? vs(156) : vs(140),
    marginBottom: vs(27),
    width: '100%',
  },
  footerText: {
    ...typography.caption_M,
    color: colors.gray400,
    letterSpacing: -0.1,
  },
});
