import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import Button from '~/shared/ui/Button';
import { scale, vs } from '~/shared/lib/responsive';

interface FormContentProps {
  defaultValue: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  errorMessage: string;
}

// 응모 모달의 양식 입력 화면 컴포넌트
export function FormContent({
  defaultValue,
  onChangeText,
  onSubmit,
  isLoading,
  errorMessage,
}: FormContentProps) {
  // 키보드 닫기
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.contentContainer}>
          {/* 타이틀 */}
          <Text style={styles.titleText}>응모가 완료되었습니다.</Text>

          {/* 설명 텍스트 */}
          <Text style={styles.descriptionText}>
            경품 지급을 위해 이메일 혹은 전화번호 입력이 필요합니다.{'\n'}
            미입력시, 선정되어도 경품 수령이 불가할 수 있습니다.{'\n'}
            이벤트 참여 시 개인정보 수집 활용 동의로 간주됩니다.
          </Text>

          {/* 입력 영역 */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.textInput, errorMessage && styles.textInputError]}
              defaultValue={defaultValue}
              onChangeText={onChangeText}
              placeholder="ex. 010-1234-5678"
              placeholderTextColor={colors.gray300}
              textAlign="center"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>

          {/* 버튼 영역 */}
          <View style={styles.confirmButtonContainer}>
            <Button
              variant="secondarySmallRight"
              onPress={onSubmit}
              disabled={isLoading}
              loading={isLoading}
            >
              <Text style={styles.applyButtonText}>확인</Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  applyButtonText: {
    ...typography.body2_SB,
    color: colors.white,
    letterSpacing: -0.14,
    textAlign: 'center',
  },
  confirmButtonContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: vs(23),
    paddingBottom: vs(15),
    width: '100%',
  },
  contentContainer: {
    alignItems: 'flex-start',
    flex: 1,
    paddingHorizontal: spacing.large,
    paddingTop: vs(32),
  },
  descriptionText: {
    ...typography.body4_M,
    alignSelf: 'flex-start',
    color: colors.gray500,
    marginTop: vs(6),
    textAlign: 'left',
    width: '100%',
  },
  errorText: {
    ...typography.body4_M,
    alignSelf: 'flex-start',
    color: colors.warn_red,
    marginLeft: scale(2),
    marginTop: vs(2),
    textAlign: 'left',
  },
  inputWrapper: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: vs(22),
    width: scale(287),
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: '100%',
  },
  textInput: {
    ...typography.body5_M,
    backgroundColor: colors.gray100,
    borderRadius: scale(8),
    color: colors.gray900,
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    textAlign: 'center',
    width: '100%',
  },
  textInputError: {
    borderColor: colors.warn_red,
    borderWidth: 1,
  },
  titleText: {
    ...typography.title2_SB,
    alignSelf: 'flex-start',
    color: colors.gray850,
    textAlign: 'left',
    width: '100%',
  },
});
