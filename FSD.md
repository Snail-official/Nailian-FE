# Feature-Sliced Design 구조 개선 계획

## 개요

Feature-Sliced Design(FSD)은 프론트엔드 프로젝트의 아키텍처 방법론으로, 기능 중심의 슬라이스된 구조를 통해 코드의 재사용성과 유지보수성을 높입니다.

## 현재 구조

```
src/
├── app/          # 앱 초기화, 프로바이더
│   ├── providers/  # 네비게이션
│   └── styles/     # 디자인 시스템 (이동 예정)
├── pages/        # 온보딩 페이지
│   └── onboarding/
│       ├── login/
│       └── nail-select/
├── features/     # 기능 단위
│   └── nail-selection/
├── entities/     # 비즈니스 엔티티
│   └── nail/
└── shared/       # 공통 모듈
    ├── ui/
    ├── assets/
    └── types/
```

## 레이어 구조

각 레이어는 하위 레이어에만 의존할 수 있습니다.

1. `app/` - 전역 설정, 프로바이더
2. `pages/` - 페이지 컴포넌트
3. `features/` - 기능 단위 모듈
4. `entities/` - 비즈니스 엔티티
5. `shared/` - 공통 모듈

## 슬라이스와 세그먼트

각 기능은 다음과 같은 세그먼트로 구성됩니다:

```
feature/
├── ui/      # 컴포넌트
├── model/   # 상태, 타입
└── api/     # 공개 인터페이스
```

### 예시: nail-selection 기능

```
features/nail-selection/
├── ui/
│   ├── NailItem/
│   └── NailGrid/
├── model/
│   ├── types.ts      # 타입 정의
│   ├── store.ts      # 상태 관리
│   └── constants.ts  # 상수
└── api/
    ├── index.ts      # 공개 API
    └── lib/          # 내부 구현
```

## 우선 개선 사항

### 1. 디자인 시스템 이동

- app/styles/common.ts를 shared 레이어로 이동
- FSD 의존성 규칙 준수

### 2. 공개 API 패턴 적용

```
// features/nail-selection/api/index.ts
export { NailItem } from '../ui/NailItem';
export { useNailSelection } from '../model/store';
export type { NailData } from '../model/types';
```

## 향후 고려사항

### 1. Widgets 레이어

- 현재는 페이지별 UI로 충분
- 공통 레이아웃 패턴이 확인되면 도입 검토

### 2. Processes 레이어

- 현재 온보딩 플로우는 단순하여 불필요
- 복잡한 다단계 프로세스 도입 시 검토

## 참고 자료

- [Feature-Sliced Design](https://feature-sliced.design/)
- [FSD 구조 예시](https://emewjin.github.io/feature-sliced-design/)
