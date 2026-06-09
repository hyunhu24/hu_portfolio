import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";

import { analyzeRelationship, AnalyzeResponse } from "../api/analyze";

export default function RelationshipScreen() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [relationship, setRelationship] = useState("");
  const [conversation, setConversation] = useState("");
  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  // 하단 입력칸이 키보드에 가리지 않도록, 포커스되면 그 칸까지 스크롤.
  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const onPickFile = async () => {
    try {
      setError(null);
      const res = await DocumentPicker.getDocumentAsync({
        type: ["text/*", "application/json"],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.length) return;
      const asset = res.assets[0];
      const content = await new File(asset.uri).text();
      setConversation((prev) =>
        prev.trim() ? `${prev}\n${content}` : content,
      );
      setLoadedFileName(asset.name);
    } catch (e) {
      setError(
        e instanceof Error
          ? `파일을 읽지 못했어요: ${e.message}`
          : "파일을 읽지 못했어요.",
      );
    }
  };

  const onAnalyze = async () => {
    if (!name.trim()) {
      setError("상대방 이름(별칭)은 필수예요.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const parsedAge = age.trim() ? Number(age) : undefined;
      const data = await analyzeRelationship({
        name: name.trim(),
        age: Number.isNaN(parsedAge as number) ? undefined : parsedAge,
        gender: gender.trim() || undefined,
        relationship: relationship.trim() || undefined,
        conversation: conversation.trim(),
        question: question.trim() || undefined,
      });
      setResult(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했어요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>관계 심리 분석</Text>
        <Text style={styles.subtitle}>
          상대방(B) 정보와 대화를 입력하면 AI가 심리를 추정해줘요.
        </Text>

        <Field label="이름 / 별칭 *">
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="예: 민수"
            placeholderTextColor="#64748b"
          />
        </Field>

        <View style={styles.row}>
          <View style={styles.half}>
            <Field label="나이">
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="예: 28"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
              />
            </Field>
          </View>
          <View style={styles.half}>
            <Field label="성별">
              <TextInput
                style={styles.input}
                value={gender}
                onChangeText={setGender}
                placeholder="예: 남성"
                placeholderTextColor="#64748b"
              />
            </Field>
          </View>
        </View>

        <Field label="나와의 관계">
          <TextInput
            style={styles.input}
            value={relationship}
            onChangeText={setRelationship}
            placeholder="예: 썸 타는 사이, 친구, 직장 동료"
            placeholderTextColor="#64748b"
          />
        </Field>

        <View style={styles.field}>
          <View style={styles.convHeader}>
            <Text style={styles.label}>대화 내용 (카카오톡 등)</Text>
            <TouchableOpacity onPress={onPickFile} style={styles.fileButton}>
              <Text style={styles.fileButtonText}>파일 불러오기</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={conversation}
            onChangeText={setConversation}
            placeholder={
              '직접 붙여넣거나 "파일 불러오기"로 .txt 대화를 가져오세요.\n나: 오늘 뭐해?\n민수: 그냥 집에 있어 ㅎㅎ'
            }
            placeholderTextColor="#64748b"
            multiline
            scrollEnabled
            textAlignVertical="top"
          />
          {loadedFileName ? (
            <Text style={styles.fileInfo}>불러온 파일: {loadedFileName}</Text>
          ) : null}
        </View>

        <Field label="B에게 묻고 싶은 질문 (선택)">
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            placeholder="예: 민수가 나한테 호감이 있을까?"
            placeholderTextColor="#64748b"
            onFocus={scrollToBottom}
            returnKeyType="done"
          />
        </Field>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onAnalyze}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.buttonText}>분석하기</Text>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}

        {result && (
          <View style={styles.resultBox}>
            <ResultItem title="성격" body={result.personality} />
            <ResultItem title="현재 감정/심리" body={result.emotional_state} />
            {result.predicted_answer ? (
              <ResultItem title="예상 답변" body={result.predicted_answer} />
            ) : null}
            <ResultItem title="관계 조언" body={result.advice} />
            <ResultItem title="주의사항" body={result.caution} muted />
          </View>
        )}

        <Text style={styles.disclaimer}>
          ※ 타인의 대화는 민감한 개인정보입니다. 동의된 데이터로만 사용하세요.
          AI 분석은 참고용이며 사실과 다를 수 있습니다.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function ResultItem({
  title,
  body,
  muted,
}: {
  title: string;
  body: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.resultItem}>
      <Text style={styles.resultTitle}>{title}</Text>
      <Text style={[styles.resultBody, muted && styles.resultBodyMuted]}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#f8fafc",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 6,
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#cbd5e1",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#f1f5f9",
    fontSize: 15,
  },
  textArea: {
    height: 160,
    maxHeight: 160,
  },
  convHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  fileButton: {
    backgroundColor: "#334155",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fileButtonText: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "600",
  },
  fileInfo: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  button: {
    backgroundColor: "#38bdf8",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  error: {
    color: "#f87171",
    marginTop: 14,
    fontSize: 14,
  },
  resultBox: {
    marginTop: 24,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
  },
  resultItem: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#38bdf8",
    marginBottom: 6,
  },
  resultBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#e2e8f0",
  },
  resultBodyMuted: {
    color: "#94a3b8",
  },
  disclaimer: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
    marginTop: 24,
  },
});
