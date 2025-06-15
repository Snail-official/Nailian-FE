import { INailSet } from '~/shared/types/nail-set';

export interface NailSetGridProps {
  data: INailSet[];
  onItemPress: (item: INailSet) => void;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  hasNextPage?: boolean;
}
