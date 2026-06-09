import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  url: string;
};

export default function WebViewScreen({ url }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={styles.flex}>
      <WebView
        source={{ uri: url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() =>
          setError('페이지를 불러오지 못했어요. 주소 또는 서버 상태를 확인하세요.')
        }
        startInLoadingState
        style={styles.flex}
      />

      {loading && !error && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      )}

      {error && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSub}>{url}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f172a' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0f172a',
  },
  errorText: {
    color: '#f87171',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorSub: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 10,
  },
});
