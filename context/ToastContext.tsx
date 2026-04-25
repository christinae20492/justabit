import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info';
type ToastState = { type: ToastType; text1: string; text2?: string } | null;

type ShowFn = (type: ToastType, text1: string, text2?: string) => void;
let _handler: ShowFn | null = null;

export function _registerToastHandler(fn: ShowFn) {
  _handler = fn;
}

export function triggerToast(type: ToastType, text1: string, text2?: string) {
  _handler?.(type, text1, text2);
}

const THEME: Record<ToastType, { bg: string; text: string; border: string }> = {
  success: { bg: '#2b4732', text: '#caedd3', border: '#6ACF6A' },
  error:   { bg: '#4D1F1F', text: '#E8A1A1', border: '#ad3d3d' },
  info:    { bg: '#243439', text: '#c5e5f1', border: '#52808D' },
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<ShowFn>((type, text1, text2) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ type, text1, text2 });
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 130,
    }).start();
    timer.current = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, 3000);
  }, [anim]);

  useEffect(() => {
    _registerToastHandler(show);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      _handler = null;
    };
  }, [show]);

  const colors = toast ? THEME[toast.type] : THEME.info;

  return (
    <View style={styles.root}>
      {children}
      {toast ? (
        <Animated.View
          style={[
            styles.toast,
            {
              backgroundColor: colors.bg,
              borderLeftColor: colors.border,
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0],
                  }),
                },
              ],
            },
          ]}>
          <Text style={[styles.text1, { color: colors.text }]}>{toast.text1}</Text>
          {toast.text2 ? (
            <Text style={[styles.text2, { color: colors.text }]}>{toast.text2}</Text>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toast: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 999,
    zIndex: 999,
  },
  text1: { fontWeight: '600', fontSize: 14 },
  text2: { fontSize: 13, marginTop: 3, opacity: 0.85 },
});
