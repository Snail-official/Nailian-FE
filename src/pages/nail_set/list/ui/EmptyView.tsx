import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * 네일 보관함 엠티 뷰 컴포넌트
 *
 * 보관함에 저장된 네일 세트가 없을 때 표시되는 화면으로,
 * 메시지와 다른 네일 세트를 둘러볼 수 있는 버튼을 제공합니다.
 *
 * @returns {JSX.Element} 엠티 뷰 컴포넌트
 */
export default function EmptyView() {
  const navigation = useNavigation<NavigationProp>();

  const handleBrowsePress = () => {
    navigation.replace('MainHome');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emptyText}>저장된 아트가 없어요</Text>
      <Button variant="chip_black" onPress={handleBrowsePress}>
        <Text style={styles.buttonText}>아트 둘러보기</Text>
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
