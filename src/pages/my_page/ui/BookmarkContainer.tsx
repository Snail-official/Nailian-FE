import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import ArrowRightIcon from '~/shared/assets/icons/ic_arrow_right.svg';

const BookmarkBar = require('~/shared/assets/images/bookmark_bar.png');

interface BookmarkContainerProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyPage'>;
}

/**
 * 네일 보관함 컨테이너 컴포넌트
 */
export function BookmarkContainer({ navigation }: BookmarkContainerProps) {
  const handleNailBookmarkPress = () => {
    navigation.navigate('BookmarkPage');
  };

  return (
    <TouchableOpacity
      style={styles.bookmarkContainer}
      onPress={handleNailBookmarkPress}
      activeOpacity={1}
    >
      <View style={styles.bookmarkContent}>
        <Text style={styles.bookmarkTitle}>네일 보관함</Text>
        <View style={styles.bookmarkCountContainer}>
          <ArrowRightIcon
            width={scale(24)}
            height={scale(24)}
            color={colors.gray100}
          />
        </View>
      </View>
      <Image source={BookmarkBar} style={styles.bookmarkBar} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bookmarkBar: {
    height: '100%',
    left: 0,
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  bookmarkContainer: {
    backgroundColor: colors.purple500,
    borderRadius: scale(12),
    height: vs(72),
    marginHorizontal: scale(20),
    marginTop: vs(24),
    overflow: 'hidden',
    position: 'relative',
  },
  bookmarkContent: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    paddingLeft: scale(18),
    paddingRight: scale(8),
    position: 'relative',
    zIndex: 2,
  },
  bookmarkCountContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bookmarkTitle: {
    ...typography.body1_B,
    color: colors.white,
    marginRight: scale(8),
    width: scale(80),
  },
});
