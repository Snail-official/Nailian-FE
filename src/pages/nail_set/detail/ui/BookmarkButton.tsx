import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { saveUserNailSet } from '~/entities/nail-set/api';
import { toast } from '~/shared/lib/toast';
import { APIError } from '~/shared/api/types';
import { useErrorStore } from '~/features/error/model/errorStore';
import BookmarkIcon from '~/shared/assets/icons/ic_group.svg';

interface BookmarkButtonProps {
  nailSetId: number;
  isBookmarkMode: boolean;
}

/**
 * 북마크 저장 버튼 컴포넌트
 */
export function BookmarkButton({
  nailSetId,
  isBookmarkMode,
}: BookmarkButtonProps) {
  const errorStore = useErrorStore();
  const queryClient = useQueryClient();

  // 북마크 저장 뮤테이션
  const { mutate: saveBookmark } = useMutation({
    mutationFn: saveUserNailSet,
    onSuccess: () => {
      // 북마크 리스트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['userNailSets'] });

      toast.showToast('보관함에 저장되었습니다.', {
        iconType: 'check',
      });
    },
    onError: (error: unknown) => {
      if (error instanceof APIError && error.code === 409) {
        toast.showToast('이미 저장된 네일입니다.');
      } else {
        errorStore.showError('보관함 저장에 실패했습니다');
      }
    },
  });

  const handleBookmarkToggle = useCallback(() => {
    if (!nailSetId) return;
    saveBookmark({ nailSetId });
  }, [nailSetId, saveBookmark]);

  // 북마크 모드에서는 버튼을 표시하지 않음
  if (isBookmarkMode) {
    return null;
  }

  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={handleBookmarkToggle}
        activeOpacity={1}
      >
        <View style={styles.buttonContent}>
          <BookmarkIcon
            width={scale(15)}
            height={scale(15)}
            color={colors.white}
          />
          <Text style={styles.bookmarkButtonText}>보관함에 저장</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bookmarkButton: {
    alignItems: 'center',
    backgroundColor: colors.gray900,
    borderRadius: scale(4),
    height: vs(33),
    paddingVertical: scale(6),
    width: scale(122),
  },
  bookmarkButtonText: {
    ...typography.body2_SB,
    color: colors.white,
    marginLeft: scale(6),
  },
  buttonContent: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  buttonsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(12),
    justifyContent: 'center',
    marginBottom: vs(24),
  },
});
