import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Project = {
  title: string;
  description: string;
  stack: string[];
};

const PROJECTS: Project[] = [
  {
    title: 'Zigtruck App',
    description: '실시간 화물 매칭 모바일 앱',
    stack: ['React Native', 'Firebase', 'WebView'],
  },
  {
    title: 'hu_portfolio',
    description: '나를 소개하는 포트폴리오 앱',
    stack: ['Expo', 'React Native', 'TypeScript'],
  },
];

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.name}>ChaeHyunHu</Text>
          <Text style={styles.role}>Mobile / React Native Developer</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {PROJECTS.map((project) => (
            <View key={project.title} style={styles.card}>
              <Text style={styles.cardTitle}>{project.title}</Text>
              <Text style={styles.cardDesc}>{project.description}</Text>
              <View style={styles.tagRow}>
                {project.stack.map((tech) => (
                  <View key={tech} style={styles.tag}>
                    <Text style={styles.tagText}>{tech}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    padding: 24,
  },
  header: {
    marginTop: 24,
    marginBottom: 32,
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
  },
  role: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  cardDesc: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#e2e8f0',
  },
});
