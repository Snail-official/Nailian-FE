import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface EmptyViewProps {
  message?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  navigateTo?: {
    screen: 'MainHome' | 'ARExperiencePage' | 'MyPage';
    params?: undefined;
  };
}

/**
 * 엠티 뷰 컴포넌트
 *
 * 데이터가 없을 때 표시되는 화면으로,
 * 메시지와 액션 버튼을 제공합니다.
 *
 * @param {EmptyViewProps} props - 컴포넌트 props
 * @returns {JSX.Element} 엠티 뷰 컴포넌트
 */
export default function EmptyView({
  message,
  buttonText,
  onButtonPress,
  navigateTo,
}: EmptyViewProps) {
  const navigation = useNavigation<NavigationProp>();

  const handleButtonPress = () => {
    if (onButtonPress) {
      onButtonPress();
      return;
    }
    if (navigateTo) {
      navigation.replace(navigateTo.screen);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emptyText}>{message}</Text>
      <Button variant="chip_black" onPress={handleButtonPress}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    ...typography.body4_M,
    color: colors.white,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  emptyText: {
    ...typography.body2_SB,
    color: colors.gray500,
    marginBottom: vs(12),
    textAlign: 'center',
  },
});
