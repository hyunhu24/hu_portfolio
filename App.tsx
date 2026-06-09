import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import PortfolioScreen from './src/screens/PortfolioScreen';
import ProjectDetailScreen from './src/screens/ProjectDetailScreen';
import RelationshipScreen from './src/screens/RelationshipScreen';
import WebViewScreen from './src/screens/WebViewScreen';
import { Project } from './src/screens/projects';

type Route =
  | { name: 'home' }
  | { name: 'relationship' }
  | { name: 'webview'; project: Project }
  | { name: 'project'; project: Project };

function AppContent() {
  const [route, setRoute] = useState<Route>({ name: 'home' });

  const goHome = () => setRoute({ name: 'home' });

  const openProject = (project: Project) => {
    if (project.action === 'relationship') {
      setRoute({ name: 'relationship' });
    } else if (project.action === 'webview' && project.webUrl) {
      setRoute({ name: 'webview', project });
    } else {
      setRoute({ name: 'project', project });
    }
  };

  // 안드로이드 시스템 뒤로가기: 홈이 아니면 앱을 닫지 않고 이전(홈)으로 이동.
  useEffect(() => {
    const onBackPress = () => {
      if (route.name !== 'home') {
        goHome();
        return true; // 기본 동작(앱 종료) 막음
      }
      return false; // 홈에서는 기본 동작 허용
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [route]);

  const headerTitle =
    route.name === 'relationship'
      ? '관계 분석'
      : route.name === 'project' || route.name === 'webview'
        ? route.project.title
        : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="light" />

      {route.name !== 'home' && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goHome}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backText}>‹ 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
          <View style={styles.headerRight} />
        </View>
      )}

      <View style={styles.body}>
        {route.name === 'home' && (
          <PortfolioScreen onOpenProject={openProject} />
        )}
        {route.name === 'relationship' && <RelationshipScreen />}
        {route.name === 'webview' && route.project.webUrl && (
          <WebViewScreen url={route.project.webUrl} />
        )}
        {route.name === 'project' && (
          <ProjectDetailScreen project={route.project} />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    minWidth: 64,
  },
  backText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#f1f5f9',
    fontSize: 17,
    fontWeight: '700',
  },
  headerRight: {
    minWidth: 64,
  },
});
