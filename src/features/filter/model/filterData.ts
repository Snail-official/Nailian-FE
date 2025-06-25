import { Image } from 'react-native';
import { Category, Color, Shape } from '~/shared/api/types';
import { colors } from '~/shared/styles/design';

// 카테고리 데이터
export const categoryItems = [
  {
    id: 'ONE_COLOR' as Category,
    name: '원컬러',
    image: Image.resolveAssetSource(
      require('~/shared/assets/images/onecolor_nukki.png'),
    ).uri,
  },
  {
    id: 'FRENCH' as Category,
    name: '프렌치',
    image: Image.resolveAssetSource(
      require('~/shared/assets/images/french_nukki.png'),
    ).uri,
  },
  {
    id: 'GRADIENT' as Category,
    name: '그라데이션',
    image: Image.resolveAssetSource(
      require('~/shared/assets/images/gradient_nukki.png'),
    ).uri,
  },
  {
    id: 'ART' as Category,
    name: '아트',
    image: Image.resolveAssetSource(
      require('~/shared/assets/images/art_nukki.png'),
    ).uri,
  },
];

// 색상 데이터
export const colorItems = [
  { id: 'WHITE' as Color, name: '화이트', color: colors.white },
  { id: 'BLACK' as Color, name: '블랙', color: colors.gray900 },
  { id: 'BEIGE' as Color, name: '베이지', color: '#F7EDD1' },
  { id: 'PINK' as Color, name: '핑크', color: '#FFBBD3' },
  { id: 'YELLOW' as Color, name: '옐로우', color: '#FFF53A' },
  { id: 'GREEN' as Color, name: '그린', color: '#CDFB90' },
  { id: 'BLUE' as Color, name: '블루', color: '#CADCFF' },
  { id: 'SILVER' as Color, name: '실버', color: '#EAEAEA' },
];

// 모양 데이터
export const shapeItems = [
  {
    id: 'SQUARE' as Shape,
    name: '스퀘어',
    image: Image.resolveAssetSource(
      require('~/shared/assets/images/img_square.png'),
    ).uri,
  },
  {
    id: 'ROUND' as Shape,
    name: '라운드',
    image: Image.resolveAssetSource(
      require('~/shared/assets/images/img_round.png'),
    ).uri,
  },
  {
    id: 'ALMOND' as Shape,
    name: '아몬드',
    image: Image.resolveAssetSource(
      require('~/shared/assets/images/img_almond.png'),
    ).uri,
  },
  {
    id: 'BALLERINA' as Shape,
    name: '발레리나',
    image: Image.resolveAssetSource(
      require('~/shared/assets/images/img_ballet.png'),
    ).uri,
  },
  {
    id: 'STILETTO' as Shape,
    name: '스틸레토',
    image: Image.resolveAssetSource(
      require('~/shared/assets/images/img_still.png'),
    ).uri,
  },
];
