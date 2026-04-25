import { triggerToast } from '@/context/ToastContext';

export const showToast = {
  success: (text1: string, text2?: string) => triggerToast('success', text1, text2),
  error: (text1: string, text2?: string) => triggerToast('error', text1, text2),
  info: (text1: string, text2?: string) => triggerToast('info', text1, text2),
};
