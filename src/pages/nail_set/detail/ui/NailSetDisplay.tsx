import React from 'react';
import { View, StyleSheet } from 'react-native';
import { INailSet } from '~/shared/types/nail-set';
import { vs } from '~/shared/lib/responsive';
import NailSet from '~/features/nail-set/ui/NailSet';

interface NailSetDisplayProps {
  nailSet: INailSet;
}

/**
 * 메인 네일 세트 표시 컴포넌트
 */
export function NailSetDisplay({ nailSet }: NailSetDisplayProps) {
  return (
    <View style={styles.nailSetContainer}>
      <NailSet nailImages={nailSet} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  nailSetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(24),
    width: '100%',
  },
});
