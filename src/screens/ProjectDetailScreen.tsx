import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Project } from './projects';

type Props = {
  project: Project;
};

export default function ProjectDetailScreen({ project }: Props) {
  const hasUrl = !!project.url && project.url.trim().length > 0;
  const isApk = hasUrl && project.url!.toLowerCase().endsWith('.apk');
  const isPdf = hasUrl && project.url!.toLowerCase().includes('.pdf');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{project.title}</Text>
      <Text style={styles.desc}>{project.description}</Text>

      <Text style={styles.label}>기술 스택</Text>
      <View style={styles.tagRow}>
        {project.stack.map((tech) => (
          <View key={tech} style={styles.tag}>
            <Text style={styles.tagText}>{tech}</Text>
          </View>
        ))}
      </View>

      {hasUrl ? (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL(project.url as string)}
          >
            <Text style={styles.buttonText}>
              {isApk
                ? 'APK 다운로드 (Android)'
                : isPdf
                  ? 'PDF 열기 (브라우저)'
                  : '링크 열기'}
            </Text>
          </TouchableOpacity>
          {isApk && (
            <Text style={styles.note}>
              · 안드로이드 전용이에요 (아이폰은 설치 불가).{'\n'}· 다운로드 후 파일을 열면
              "출처를 알 수 없는 앱 설치 허용"을 한 번 켜야 설치됩니다.
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.note}>
          이 프로젝트의 링크는 아직 등록되지 않았어요. {'\n'}
          src/screens/projects.ts 의 url 값을 채우면 여기서 열 수 있어요.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 8,
  },
  desc: {
    fontSize: 15,
    color: '#cbd5e1',
    marginTop: 10,
    lineHeight: 22,
  },
  label: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 24,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  button: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginTop: 28,
  },
});
