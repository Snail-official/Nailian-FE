import { useEffect } from 'react';

type ToastPosition = 'top' | 'bottom';

interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
}

type ToastEvent = {
  message: string;
  options?: ToastOptions;
};

class ToastEmitter {
  private static instance: ToastEmitter;

  private listeners: ((event: ToastEvent) => void)[] = [];

  static getInstance(): ToastEmitter {
    if (!ToastEmitter.instance) {
      ToastEmitter.instance = new ToastEmitter();
    }
    return ToastEmitter.instance;
  }

  showToast(message: string, options?: ToastOptions) {
    this.listeners.forEach(listener => listener({ message, options }));
  }

  addListener(listener: (event: ToastEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const toast = ToastEmitter.getInstance();
