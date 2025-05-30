import {
  requireNativeComponent,
  ViewStyle,
  NativeSyntheticEvent,
} from 'react-native';

// Event types for camera view
export interface CaptureCompleteEvent {
  capturedImagePath?: string;
  success: boolean;
  message?: string;
}

export interface CameraErrorEvent {
  code: string;
  message: string;
}

export interface CameraViewProps {
  style?: ViewStyle;
  onCaptureComplete?: (
    event: NativeSyntheticEvent<CaptureCompleteEvent>,
  ) => void;
  onError?: (event: NativeSyntheticEvent<CameraErrorEvent>) => void;
}

// CameraView를 한 번만 등록
export const CameraView = requireNativeComponent<CameraViewProps>('CameraView');
