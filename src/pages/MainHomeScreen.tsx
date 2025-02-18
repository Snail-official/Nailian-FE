import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';
import { RootStackParamList } from '~/shared/types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingLogin'>;
};

export default function MainHomeScreen({ navigation }: Props) {
  return (
    <View>
      <Text>홈 화면</Text>
    </View>
  );
}
