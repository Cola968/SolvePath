import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { z } from 'zod';
import {
  AppButton,
  AppInput,
  AppText,
  Card,
  Choice,
  Feedback,
  Page,
  ProgressBar,
  SectionTitle,
  StatTile,
} from '../components/ui';
import { demoProblems, misconceptionLabel } from '../data/problems';
import { topicScore, topRisks } from '../domain/profile/progress';
import { useSession } from '../features/session/store';
import { spacing, useTheme } from '../theme/tokens';

export default function ExamScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const subject = useSession((state) => state.examSubject);
  const chosenTopics = useSession((state) => state.examTopics);
  const savedDate = useSession((state) => state.examDate);
  const profile = useSession((state) => state.profile);
  const setExam = useSession((state) => state.setExam);
  const selectProblem = useSession((state) => state.selectProblem);
  const [date, setDate] = useState(savedDate);

  const topics = useMemo(
    () => [
      ...new Set(
        demoProblems
          .filter((problem) => problem.subject === subject)
          .map((problem) => problem.topic),
      ),
    ],
    [subject],
  );

  const candidates = demoProblems.filter(
    (problem) =>
      problem.subject === subject &&
      (chosenTopics.length === 0 || chosenTopics.includes(problem.topic)),
  );

  const risks = topRisks(profile).filter((risk) =>
    candidates.some((problem) => problem.topic === risk.topic),
  );

  const demoRisks = candidates
    .flatMap((problem) => problem.commonMistakes.map((mistake) => mistake.label))
    .filter((value, index, all) => all.indexOf(value) === index)
    .slice(0, 3);

  const dateIsValid = z.iso.date().safeParse(date).success;
  const selectedTopicProgress = Object.entries(profile.topics).filter(([key]) =>
    chosenTopics.length === 0
      ? key.startsWith(`${subject}:`)
      : chosenTopics.some((topic) => key === `${subject}:${topic}`),
  );
  const readiness =
    selectedTopicProgress.length === 0
      ? null
      : Math.round(
          selectedTopicProgress.reduce((sum, [, progress]) => sum + topicScore(progress), 0) /
            selectedTopicProgress.length,
        );

  function toggleTopic(topic: string) {
    setExam(
      subject,
      chosenTopics.includes(topic)
        ? chosenTopics.filter((item) => item !== topic)
        : [...chosenTopics, topic],
      date,
    );
  }

  function startTraining() {
    const riskyTopic = risks[0]?.topic;
    const next =
      candidates.find(
        (problem) => problem.topic === riskyTopic && !profile.solvedProblemIds.includes(problem.id),
      ) ??
      candidates.find((problem) => !profile.solvedProblemIds.includes(problem.id)) ??
      candidates[0];

    if (!next) return;
    setExam(subject, chosenTopics, date);
    selectProblem(next.id);
    router.push('/stuck');
  }

  return (
    <Page
      title="Prüfung vorbereiten"
      subtitle="Wähle Fach, Themen und Termin. SolvePath priorisiert bekannte Schwachstellen."
      eyebrow="Exam Mode"
    >
      <Card>
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <StatTile
            value={readiness === null ? '–' : `${readiness}%`}
            label="Sicherheit"
            tone="accent"
          />
          <StatTile value={risks.length.toString()} label="Fokuspunkte" tone="warning" />
          <StatTile value={candidates.length.toString()} label="Aufgaben" />
        </View>
      </Card>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Fach</SectionTitle>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Choice
              label="Mathematik"
              selected={subject === 'math'}
              onPress={() => setExam('math', [], date)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Choice
              label="Physik"
              selected={subject === 'physics'}
              onPress={() => setExam('physics', [], date)}
            />
          </View>
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Themen</SectionTitle>
        <AppText variant="caption" muted>
          Ohne Auswahl werden alle verfügbaren Themen berücksichtigt.
        </AppText>
        <View style={{ gap: spacing.sm }}>
          {topics.map((topic) => (
            <Choice
              key={topic}
              label={topic}
              selected={chosenTopics.includes(topic)}
              onPress={() => toggleTopic(topic)}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Prüfungstermin</SectionTitle>
        <AppInput
          accessibilityLabel="Prüfungstermin"
          placeholder="JJJJ-MM-TT"
          value={date}
          onChangeText={setDate}
          keyboardType="numbers-and-punctuation"
        />
        {date && !dateIsValid ? (
          <Feedback
            title="Datum prüfen"
            message="Verwende ein gültiges Datum im Format JJJJ-MM-TT."
            kind="error"
          />
        ) : dateIsValid ? (
          <ProgressBar value={100} label={`Termin: ${date}`} />
        ) : null}
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Priorität</SectionTitle>
        <Card>
          {(risks.length ? risks.slice(0, 3) : demoRisks.map((label) => ({ label }))).map(
            (item, index, arr) => {
              const label =
                'misconceptionId' in item ? misconceptionLabel(item.misconceptionId) : item.label;
              const detail =
                'misconceptionId' in item
                  ? `${item.topic} · ${item.count}× erkannt`
                  : 'Typischer Fehler in den gewählten Themen';

              return (
                <View
                  key={label}
                  style={{
                    paddingBottom: index === arr.length - 1 ? 0 : spacing.md,
                    marginBottom: index === arr.length - 1 ? 0 : spacing.md,
                    borderBottomWidth: index === arr.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                    gap: spacing.xs,
                  }}
                >
                  <AppText style={{ fontWeight: '700' }}>{label}</AppText>
                  <AppText variant="caption" muted>
                    {detail}
                  </AppText>
                </View>
              );
            },
          )}
        </Card>
      </View>

      <AppButton
        label="Fokus-Training starten"
        onPress={startTraining}
        disabled={!dateIsValid || candidates.length === 0}
      />
    </Page>
  );
}
