import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const APP_URL = 'https://snapstudy-live-v3.onrender.com/';
const APP_ORIGIN = 'https://snapstudy-live-v3.onrender.com';

export default function SnapStudyScreen() {
  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const palette = dark
    ? { background: '#000000', surface: '#1C1C1E', label: '#F2F2F7', secondary: '#AEAEB2', blue: '#0A84FF' }
    : { background: '#F2F2F7', surface: '#FFFFFF', label: '#1C1C1E', secondary: '#6C6C70', blue: '#007AFF' };
  const injectedSafeArea = `
    document.documentElement.style.setProperty('--native-safe-top', '${Math.round(insets.top)}px');
    document.documentElement.style.setProperty('--native-safe-bottom', '${Math.round(insets.bottom)}px');
    true;
  `;

  const [canGoBack, setCanGoBack] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const retryCount = useRef(0);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) return false;
      webViewRef.current?.goBack();
      return true;
    });
    return () => subscription.remove();
  }, [canGoBack]);

  const onNavigation = (nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
    if (nav.url.startsWith(APP_ORIGIN)) {
      retryCount.current = 0;
      setFailed(false);
    }
  };

  const handleLoadFailure = () => {
    if (retryCount.current < 2) {
      retryCount.current += 1;
      setTimeout(() => setReloadKey((value) => value + 1), 1400);
      return;
    }
    setFailed(true);
  };

  const shouldLoad = (request: { url: string }) => {
    const { url } = request;
    if (
      url.startsWith(APP_ORIGIN) ||
      url.startsWith('about:blank') ||
      url.startsWith('blob:')
    ) {
      return true;
    }
    void Linking.openURL(url);
    return false;
  };

  if (failed) {
    return (
      <View style={[styles.errorScreen, { backgroundColor: palette.background }]}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <View style={[styles.statusGlyph, { backgroundColor: dark ? '#1C1C1E' : '#EDEDF2' }]}>
          <Text style={[styles.statusGlyphText, { color: palette.secondary }]}>!</Text>
        </View>
        <Text style={[styles.title, { color: palette.label }]}>Keine Verbindung</Text>
        <Text style={[styles.copy, { color: palette.secondary }]}>
          SnapStudy konnte gerade nicht geladen werden. Deine gespeicherten Notizen bleiben erhalten.
        </Text>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: palette.blue, opacity: pressed ? 0.76 : 1 },
          ]}
          onPress={() => {
            retryCount.current = 0;
            setFailed(false);
            setReloadKey((value) => value + 1);
          }}
        >
          <Text style={styles.retryText}>Erneut versuchen</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.browserButton,
            { backgroundColor: pressed ? (dark ? '#2C2C2E' : '#E9E9EE') : 'transparent' },
          ]}
          onPress={() => void Linking.openURL(APP_URL)}
        >
          <Text style={[styles.browserText, { color: palette.blue }]}>Im Browser öffnen</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <WebView
        key={reloadKey}
        ref={webViewRef}
        source={{ uri: APP_URL }}
        style={[styles.webview, { backgroundColor: palette.background }]}
        injectedJavaScriptBeforeContentLoaded={injectedSafeArea}
        injectedJavaScript={injectedSafeArea}
        originWhitelist={['https://*', 'blob:*', 'about:*']}
        onNavigationStateChange={onNavigation}
        onShouldStartLoadWithRequest={shouldLoad}
        onError={handleLoadFailure}
        onHttpError={(event) => {
          if (event.nativeEvent.statusCode >= 500) handleLoadFailure();
        }}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures
        pullToRefreshEnabled
        mixedContentMode="never"
        mediaPlaybackRequiresUserAction
        allowsInlineMediaPlayback
        cacheEnabled
        incognito={false}
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.loading, { backgroundColor: palette.background }]}>
            <ActivityIndicator size="small" color={palette.blue} />
            <Text style={[styles.loadingText, { color: palette.secondary }]}>SnapStudy</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
  },
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  statusGlyph: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusGlyphText: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '600',
  },
  title: {
    marginTop: 22,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    letterSpacing: -0.35,
    textAlign: 'center',
  },
  copy: {
    marginTop: 8,
    maxWidth: 314,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    minHeight: 50,
    minWidth: 188,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  },
  browserButton: {
    marginTop: 8,
    minHeight: 44,
    minWidth: 188,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  browserText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
});
