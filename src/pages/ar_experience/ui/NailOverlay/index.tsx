import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { scale } from '~/shared/lib/responsive';
import { INailSet } from '~/shared/types/nail-set';

/**
 * 네일 오버레이 컴포넌트 Props
 * @property {Object} nailSet - 현재 선택된 네일 세트 (손가락별 네일 이미지 정보)
 */
interface NailOverlayProps {
  nailSet: Partial<INailSet>;
}

/**
 * 각 손톱 위치 정보
 * @property {number} x - X 좌표 (왼쪽 기준)
 * @property {number} y - Y 좌표 (위쪽 기준)
 * @property {number} width - 네일 이미지 너비
 * @property {number} height - 네일 이미지 높이
 * @property {number} rotation - 회전 각도 (도 단위)
 */
interface NailPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

/**
 * 손톱별 위치 정보
 *
 * 좌표와 변형 값들은 기본 손 이미지를 기준으로 측정된 값입니다.
 * 해당 값들은 실제 이미지와 화면 크기에 따라 조정이 필요할 수 있습니다.
 */
const NAIL_POSITIONS: Record<keyof Omit<INailSet, 'id'>, NailPosition> = {
  // 엄지손가락 - 가장 오른쪽에 위치
  thumb: {
    x: scale(264),
    y: scale(135),
    width: scale(58),
    height: scale(50),
    rotation: 25, // 약간 기울임
  },
  // 검지손가락
  index: {
    x: scale(202),
    y: scale(27),
    width: scale(49),
    height: scale(35),
    rotation: 1,
  },
  // 중지손가락
  middle: {
    x: scale(159),
    y: scale(6),
    width: scale(53),
    height: scale(39),
    rotation: -2,
  },
  // 약지손가락
  ring: {
    x: scale(116),
    y: scale(31),
    width: scale(51),
    height: scale(37),
    rotation: -5,
  },
  // 소지손가락 - 가장 왼쪽에 위치
  pinky: {
    x: scale(79),
    y: scale(88),
    width: scale(40),
    height: scale(28),
    rotation: -5, // 반대 방향으로 약간 기울임
  },
};

/**
 * 네일 오버레이 컴포넌트
 *
 * 고정된 손 이미지 위에 선택된 네일팁을 오버레이합니다.
 * 각 손가락에 맞는 위치와 변형(회전, 크기 등)을 적용하여 자연스럽게 보이도록 합니다.
 *
 * @param {NailOverlayProps} props - 네일 오버레이 속성
 * @returns {JSX.Element} 렌더링된 네일 오버레이 컴포넌트
 */
export default function NailOverlay({ nailSet }: NailOverlayProps) {
  // 어떤 네일팁도 선택되지 않은 경우 빈 컴포넌트 반환
  if (!nailSet || Object.keys(nailSet).length === 0) {
    return null;
  }

  return (
    <View style={styles.overlayContainer}>
      {/* 각 손가락별 네일팁 렌더링 */}
      {(Object.keys(NAIL_POSITIONS) as Array<keyof typeof NAIL_POSITIONS>).map(
        fingerType => {
          // 해당 손가락에 선택된 네일팁이 있는지 확인
          const nail = nailSet[fingerType];

          // 선택된 네일팁이 없거나 이미지 URL이 없으면 렌더링하지 않음
          if (!nail || typeof nail !== 'object' || !nail.imageUrl) {
            return null;
          }

          const position = NAIL_POSITIONS[fingerType];

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
                      ? [{ rotateY: '35deg' }, { rotateX: '20deg' }]
                      : fingerType === 'pinky'
                        ? [{ rotateY: '-20deg' }, { rotateX: '-5deg' }]
                        : [{ rotateY: '0deg' }, { rotateX: '0deg' }]),
                  ],
                },
              ]}
              resizeMode="cover"
            />
          );
        },
      )}
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
