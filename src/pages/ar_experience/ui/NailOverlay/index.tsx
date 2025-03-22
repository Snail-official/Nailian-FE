import React, { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { INailSet } from '~/shared/types/nail-set';
import { NailSet } from '~/pages/ar_experience';
import { getNailPositionByShape } from './utils';
import { addDefaultShapesToNailSet } from './model';

/**
 * 네일 오버레이 컴포넌트 Props
 * @property {Object} nailSet - 현재 선택된 네일 세트 (손가락별 네일 이미지 정보)
 */
interface NailOverlayProps {
  nailSet: Partial<NailSet>;
}

/**
 * 네일 오버레이 컴포넌트
 *
 * 고정된 손 이미지 위에 선택된 네일팁을 오버레이합니다.
 * 각 손가락에 맞는 위치와 변형(회전, 크기 등)을 적용하여 자연스럽게 보이도록 합니다.
 * 각 네일의 쉐입(모양)에 따라 적절한 크기 조정을 적용합니다.
 *
 * @param {NailOverlayProps} props - 네일 오버레이 속성
 * @returns {JSX.Element} 렌더링된 네일 오버레이 컴포넌트
 */
export default function NailOverlay({ nailSet }: NailOverlayProps) {
  // 기본 쉐입 정보가 추가된 네일 세트
  const nailSetWithShapes = useMemo(
    () => addDefaultShapesToNailSet(nailSet),
    [nailSet],
  );

  // 어떤 네일팁도 선택되지 않은 경우 빈 컴포넌트 반환
  if (!nailSet || Object.keys(nailSet).length === 0) {
    return null;
  }

  return (
    <View style={styles.overlayContainer}>
      {/* 각 손가락별 네일팁 렌더링 */}
      {(
        Object.keys(nailSetWithShapes).filter(key => key !== 'id') as Array<
          keyof Omit<INailSet, 'id'>
        >
      ).map(fingerType => {
        // 해당 손가락에 선택된 네일팁이 있는지 확인
        const nail = nailSetWithShapes[fingerType];

        // 선택된 네일팁이 없거나 이미지 URL이 없으면 렌더링하지 않음
        if (!nail || typeof nail !== 'object' || !nail.imageUrl) {
          return null;
        }

        // 손가락 타입과 네일 정보에 기반하여 위치 및 크기 계산
        const position = getNailPositionByShape(fingerType, nail);

        return (
          <Image
            key={fingerType}
            source={{ uri: nail.imageUrl }}
            style={[
              styles.nailImage,
              {
                left: position.x,
                top: position.y,
                width: position.width,
                height: position.height,
                transform: [
                  { perspective: 800 }, // 원근감 설정 (값이 작을수록 원근감 강함)
                  { rotate: `${position.rotation}deg` },
                  // 손가락별 3D 회전 효과 추가
                  ...(fingerType === 'thumb'
                    ? [{ rotateY: '45deg' }, { rotateX: '25deg' }]
                    : fingerType === 'pinky'
                      ? [{ rotateY: '-10deg' }, { rotateX: '-5deg' }]
                      : [{ rotateY: '0deg' }, { rotateX: '0deg' }]),
                ],
              },
            ]}
            resizeMode="cover"
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nailImage: {
    // 네일팁 이미지의 기본 스타일
    borderRadius: 15,
    opacity: 0.9, // 네일팁이 손톱에 더 자연스럽게 보이도록 투명도 적용
    overflow: 'hidden',
    position: 'absolute',
  },
  overlayContainer: {
    // 손 이미지 위에 절대 위치로 오버레이
    bottom: 0,
    left: 0,
    pointerEvents: 'none', // 포인터 이벤트를 무시하여 하단 UI와 상호작용 가능하도록 함
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
