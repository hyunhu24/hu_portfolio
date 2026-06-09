import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Project, PROJECTS } from './projects';

type Props = {
  onOpenProject: (project: Project) => void;
};

export default function PortfolioScreen({ onOpenProject }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>ChaeHyunHu</Text>
        <Text style={styles.role}>Mobile / React Native Developer</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {PROJECTS.map((project) => (
          <TouchableOpacity
            key={project.id}
            activeOpacity={0.7}
            style={[styles.card, project.highlight && styles.cardHighlight]}
            onPress={() => onOpenProject(project)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{project.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
            <Text style={styles.cardDesc}>{project.description}</Text>
            <View style={styles.tagRow}>
              {project.stack.map((tech) => (
                <View key={tech} style={styles.tag}>
                  <Text style={styles.tagText}>{tech}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  cardHighlight: {
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
    flexShrink: 1,
  },
  chevron: {
    fontSize: 24,
    color: '#64748b',
    marginLeft: 8,
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
