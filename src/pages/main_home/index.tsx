import React from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors } from '~/shared/styles/design';
import Logo from '~/shared/assets/icons/logo.svg';
import Banner from './ui/banner';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainHome'>;
};

function MainHomeScreen({ navigation }: Props) {
  // 배너 클릭 핸들러
  const handleBannerPress = (banner: {
    id: number;
    imageUrl: string;
    link: string;
  }) => {
    console.log('배너 클릭:', banner.id);
    // 필요시 navigation.navigate 등 추가
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        {/* 로고 */}
        <View style={styles.logoContainer}>
          <Logo width={78} height={25} />
        </View>

        {/* 배너 */}
        <Banner onBannerPress={handleBannerPress} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    marginTop: 14,
    width: '100%',
  },
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
});

export default MainHomeScreen;
