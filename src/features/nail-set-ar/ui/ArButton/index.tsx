import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import ArIcon from '~/shared/assets/icons/ic_ar.svg';

/**
 * AR 버튼 컴포넌트 Props
 *
 * AR 기능을 실행하는 버튼 컴포넌트의 속성을 정의합니다.
 *
 * @property {() => void} onPress - 버튼 클릭 시 실행할 함수
 * @property {boolean} [disabled=false] - 버튼 비활성화 여부
 * @property {object} [style] - 버튼에 적용할 추가 스타일
 */
interface ArButtonProps {
  /** 버튼 클릭 핸들러 */
  onPress: () => void;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 스타일 */
  style?: object;
}

/**
 * AR 버튼 컴포넌트
 *
 * 네일 세트 상세 페이지에서 "내 손에 올려보기" AR 기능을 실행하는 버튼입니다.
 * 보라색 배경에 흰색 텍스트와 AR 아이콘이 포함된 둥근 버튼으로 구성되어 있습니다.
 * 사용자가 이 버튼을 클릭하면 AR 체험 기능이 실행됩니다.
 *
 * @param {ArButtonProps} props - AR 버튼 컴포넌트 속성
 * @param {() => void} props.onPress - 버튼 클릭 시 호출될 콜백 함수
 * @param {boolean} [props.disabled=false] - 버튼 비활성화 상태 여부
 * @param {object} [props.style] - 컴포넌트에 적용할 추가적인 스타일
 * @returns {JSX.Element} 렌더링된 AR 버튼
 *
 * @example
 * <ArButton onPress={() => console.log('AR 기능 실행')} />
 */
export default function ArButton({
  onPress,
  disabled = false,
  style,
}: ArButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <ArIcon width={26} height={26} color={colors.white} />
        <Text style={styles.text}>내 손에 올려보기</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.purple500,
    borderRadius: 24,
    height: 42,
    justifyContent: 'center',
    padding: 5,
    paddingHorizontal: 10,
    width: 179,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  text: {
    ...typography.body2_SB,
    color: colors.white,
    letterSpacing: -0.14,
    lineHeight: 21,
  },
});
