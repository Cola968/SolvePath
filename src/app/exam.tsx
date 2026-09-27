import { useMemo, useState } from 'react';
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
  Pill,
  SectionTitle,
  StatTile,
} from '../components/ui';
import { demoProblems, misconceptionLabel } from '../data/problems';
import { topicScore, topRisks } from '../domain/profile/progress';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

export default function ExamScreen() {
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
      title="Trainiere das Risiko, nicht den Stoffberg."
      subtitle="SolvePath priorisiert Fehlermuster und unsichere Entscheidungen für deine nächste Prüfung."
      eyebrow="Exam Mode"
    >
      <Card elevated>
        <Pill label="BETA FREIGESCHALTET" tone="accent" />
        <AppText variant="title">Exam Mode ist im Beta-Test vollständig verfügbar.</AppText>
        <AppText muted>
          Teste besonders die Themenauswahl, Priorisierung und den Wechsel in das Fokus-Training.
        </AppText>
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        <StatTile
          value={readiness === null ? '–' : `${readiness}%`}
          label="Readiness"
          detail={readiness === null ? 'noch keine Daten' : 'für gewählte Themen'}
          tone="accent"
        />
        <StatTile
          value={dateIsValid ? date.slice(5) : '–'}
          label="Prüfungstermin"
          detail={dateIsValid ? date.slice(0, 4) : 'Termin eintragen'}
          tone="primary"
        />
        <StatTile
          value={risks.length.toString()}
          label="bekannte Risiken"
          detail="aus deinem Lernprofil"
          tone="warning"
        />
      </View>

      <Card>
        <SectionTitle>1. Fach wählen</SectionTitle>
        <View style={{ gap: spacing.sm }}>
          <Choice
            prefix="P"
            label="Physik"
            selected={subject === 'physics'}
            onPress={() => setExam('physics', [], date)}
          />
          <Choice
            prefix="M"
            label="Mathematik"
            selected={subject === 'math'}
            onPress={() => setExam('math', [], date)}
          />
        </View>
      </Card>

      <Card>
        <SectionTitle>2. Themen eingrenzen</SectionTitle>
        <AppText muted>Ohne Auswahl trainiert SolvePath alle verfügbaren Themen des Fachs.</AppText>
        <View style={{ gap: spacing.sm }}>
          {topics.map((topic, index) => (
            <Choice
              key={topic}
              prefix={(index + 1).toString()}
              label={topic}
              selected={chosenTopics.includes(topic)}
              onPress={() => toggleTopic(topic)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>3. Prüfungstermin</SectionTitle>
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
          <Pill label="TERMIN GESPEICHERT" tone="primary" />
        ) : (
          <AppText variant="caption" muted>
            Beispiel: 2026-12-15
          </AppText>
        )}
      </Card>

      <Card elevated>
        <Pill label="PRIORISIERUNG" tone="warning" />
        <SectionTitle>Deine größten Risiken</SectionTitle>
        {risks.length
          ? risks.map((risk, index) => (
              <View key={risk.misconceptionId} style={{ flexDirection: 'row', gap: spacing.md }}>
                <Pill label={`#${index + 1}`} tone="warning" />
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontWeight: '800' }}>
                    {misconceptionLabel(risk.misconceptionId)}
                  </AppText>
                  <AppText variant="caption" muted>
                    {risk.topic} · {risk.count}× erkannt
                  </AppText>
                </View>
              </View>
            ))
          : demoRisks.map((risk, index) => (
              <View key={risk} style={{ flexDirection: 'row', gap: spacing.md }}>
                <Pill label={`#${index + 1}`} tone="neutral" />
                <AppText style={{ flex: 1 }}>{risk}</AppText>
              </View>
            ))}
        <AppText variant="caption" muted>
          {risks.length
            ? 'Priorität aus deinem lokalen Fehlerprofil.'
            : 'Vorschau aus typischen Fehlern der Demo-Aufgaben. Nach eigenen Versuchen wird sie personalisiert.'}
        </AppText>
      </Card>

      <AppButton
        label="Fokus-Training starten →"
        onPress={startTraining}
        disabled={!dateIsValid || candidates.length === 0}
      />
    </Page>
  );
}
