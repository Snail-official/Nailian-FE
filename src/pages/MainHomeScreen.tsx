import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors } from '~/shared/styles/design';
import NailSet from '~/features/nail-set/ui/NailSet';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainHome'>;
};

function MainHomeScreen({ navigation }: Props) {
  // 네일셋 클릭 핸들러 (예시)
  const handleNailSetPress = () => {
    // 향후 네일셋 상세 페이지로 이동 구현
    // navigation.navigate('NailSetDetail', { id: 1 });
    console.log('네일셋 클릭됨');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>네일 세트 컴포넌트 테스트</Text>

      {/* 기본 네일셋 */}
      <View style={styles.demoContainer}>
        <Text style={styles.sectionTitle}>기본 네일셋</Text>
        <NailSet nailImages={{}} />
      </View>

      {/* 커스텀 스타일 네일셋 */}
      <View style={styles.demoContainer}>
        <Text style={styles.sectionTitle}>커스텀 스타일 네일셋</Text>
        <NailSet
          nailImages={{}}
          onPress={handleNailSetPress}
          style={styles.customNailSet}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray50,
    flex: 1,
    padding: 16,
  },
  customNailSet: {
    backgroundColor: colors.white,
    borderColor: colors.gray200,
    borderWidth: 1,
    width: '90%',
  },
  demoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    color: colors.gray600,
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    color: colors.gray800,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});

export default MainHomeScreen;
