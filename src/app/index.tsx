import { useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView, type WebViewNavigation } from 'react-native-webview';

const APP_URL = 'https://snapstudy-test.onrender.com/';
const APP_ORIGIN = 'https://snapstudy-test.onrender.com';

export default function SnapStudyScreen() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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
    if (nav.url.startsWith(APP_ORIGIN)) setFailed(false);
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
          <View style={styles.markLineLong} />
          <View style={styles.markLineMedium} />
          <View style={styles.markLineShort} />
        </View>
        <Text style={styles.title}>SnapStudy ist gerade offline.</Text>
        <Text style={styles.copy}>
          Deine gespeicherten Notizen bleiben erhalten. Prüfe deine Verbindung und lade die App neu.
        </Text>
        <Pressable
          accessibilityRole="button"
          style={styles.retryButton}
          onPress={() => {
            setFailed(false);
            setReloadKey((value) => value + 1);
          }}
        >
          <Text style={styles.retryText}>Erneut laden</Text>
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
        onError={() => setFailed(true)}
        onHttpError={(event) => {
          if (event.nativeEvent.statusCode >= 500) setFailed(true);
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
    backgroundColor: '#F7F5EF',
  },
  webview: {
    flex: 1,
    backgroundColor: '#F7F5EF',
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
    backgroundColor: '#F7F5EF',
  },
  loadingBar: {
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#6558D8',
  },
  loadingText: {
    color: '#6D7480',
    fontSize: 13,
    fontWeight: '700',
  },
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F7F5EF',
  },
  mark: {
    width: 58,
    height: 70,
    borderWidth: 3,
    borderColor: '#1C2433',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 24,
    gap: 7,
  },
  markLineLong: {
    height: 4,
    width: 28,
    borderRadius: 999,
    backgroundColor: '#6558D8',
  },
  markLineMedium: {
    height: 4,
    width: 22,
    borderRadius: 999,
    backgroundColor: '#6558D8',
  },
  markLineShort: {
    height: 4,
    width: 15,
    borderRadius: 999,
    backgroundColor: '#6558D8',
  },
  title: {
    marginTop: 22,
    color: '#1C2433',
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  copy: {
    marginTop: 10,
    maxWidth: 330,
    color: '#6D7480',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 22,
    minHeight: 50,
    minWidth: 170,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: '#6558D8',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
