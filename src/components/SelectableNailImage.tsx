import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/common';
import CheckIcon from '../assets/icons/ic_check.svg';

interface SelectableNailImageProps {
  source: ReturnType<typeof require>; // any 대신 구체적인 타입 사용
  isSelected: boolean;
  onSelect: () => void;
}

const styles = StyleSheet.create({
  checkIconContainer: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  container: {
    height: 103,
    position: 'relative',
    width: 103,
  },
  image: {
    backgroundColor: colors.gray200,
    borderRadius: 4,
    height: '100%',
    width: '100%',
  },
  selectedOverlay: {
    borderColor: colors.gray850,
    borderRadius: 4,
    borderWidth: 1,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

function SelectableNailImage({
  source,
  isSelected,
  onSelect,
}: SelectableNailImageProps): JSX.Element {
  return (
    <TouchableOpacity onPress={onSelect} style={styles.container}>
      <Image source={source} style={styles.image} />
      {isSelected && (
        <View style={styles.selectedOverlay}>
          <View style={styles.checkIconContainer}>
            <CheckIcon width={18} height={18} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default SelectableNailImage;
