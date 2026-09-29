import { useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView, type WebViewNavigation } from 'react-native-webview';

const APP_URL = 'https://snapstudy-live-v3.onrender.com/';
const APP_ORIGIN = 'https://snapstudy-live-v3.onrender.com';

export default function SnapStudyScreen() {
  const webViewRef = useRef<WebView>(null);
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
      <View style={styles.errorScreen}>
        <StatusBar style="dark" />
        <View style={styles.mark}>
          <View style={styles.markFold} />
          <View style={styles.markLineLong} />
          <View style={styles.markLineMedium} />
          <View style={styles.markLineShort} />
        </View>
        <Text style={styles.title}>Keine Verbindung</Text>
        <Text style={styles.copy}>
          SnapStudy konnte gerade nicht geladen werden. Deine Notizen bleiben erhalten.
        </Text>
        <Pressable
          accessibilityRole="button"
          style={styles.retryButton}
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
          style={styles.browserButton}
          onPress={() => void Linking.openURL(APP_URL)}
        >
          <Text style={styles.browserText}>Im Browser öffnen</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <WebView
        key={reloadKey}
        ref={webViewRef}
        source={{ uri: APP_URL }}
        style={styles.webview}
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
          <View style={styles.loading}>
            <View style={styles.loadingBar} />
            <Text style={styles.loadingText}>SnapStudy wird geladen …</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  webview: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F5F6F8',
  },
  loadingBar: {
    width: 34,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#3568D4',
  },
  loadingText: {
    color: '#737A84',
    fontSize: 12,
    fontWeight: '500',
  },
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#F5F6F8',
  },
  mark: {
    width: 48,
    height: 58,
    borderWidth: 2,
    borderColor: '#2D333B',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingTop: 20,
    gap: 5,
    position: 'relative',
  },
  markFold: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 13,
    height: 13,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 5,
    backgroundColor: '#E2B84B',
  },
  markLineLong: {
    height: 2,
    width: 23,
    borderRadius: 999,
    backgroundColor: '#3568D4',
  },
  markLineMedium: {
    height: 2,
    width: 18,
    borderRadius: 999,
    backgroundColor: '#3568D4',
  },
  markLineShort: {
    height: 2,
    width: 13,
    borderRadius: 999,
    backgroundColor: '#3568D4',
  },
  title: {
    marginTop: 20,
    color: '#20242B',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '600',
    textAlign: 'center',
  },
  copy: {
    marginTop: 8,
    maxWidth: 300,
    color: '#737A84',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    minHeight: 44,
    minWidth: 168,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: '#3568D4',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  browserButton: {
    marginTop: 8,
    minHeight: 40,
    minWidth: 168,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  browserText: {
    color: '#5F6670',
    fontSize: 12,
    fontWeight: '500',
  },
});
