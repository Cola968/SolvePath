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
  SectionTitle,
} from '../components/ui';
import { demoProblems } from '../data/problems';
import { topRisks } from '../domain/profile/progress';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

export default function ExamScreen() {
  const router = useRouter();
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
    const next =
      candidates.find((problem) => !profile.solvedProblemIds.includes(problem.id)) ?? candidates[0];
    if (!next) return;
    setExam(subject, chosenTopics, date);
    selectProblem(next.id);
    router.push('/stuck');
  }
  return (
    <Page
      title="Prüfung vorbereiten"
      subtitle="Wähle Fach und Themen. SolvePath zeigt dir lokale Risikothemen und startet eine passende Demo-Aufgabe."
      eyebrow="Exam Mode · Vorschau"
    >
      <Card>
        <SectionTitle>Fach</SectionTitle>
        <View style={{ gap: spacing.sm }}>
          <Choice
            label="Physik"
            selected={subject === 'physics'}
            onPress={() => setExam('physics', [], date)}
          />
          <Choice
            label="Mathematik"
            selected={subject === 'math'}
            onPress={() => setExam('math', [], date)}
          />
        </View>
      </Card>
      <Card>
        <SectionTitle>Themen</SectionTitle>
        <AppText muted>Ohne Auswahl werden alle Themen des Fachs trainiert.</AppText>
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
      </Card>
      <Card>
        <SectionTitle>Prüfungstermin</SectionTitle>
        <AppInput
          accessibilityLabel="Prüfungstermin"
          placeholder="JJJJ-MM-TT"
          value={date}
          onChangeText={setDate}
          keyboardType="numbers-and-punctuation"
        />
        <AppText muted>Beispiel: 2026-12-15</AppText>
      </Card>
      <Card>
        <SectionTitle>Deine größten Risiken</SectionTitle>
        {risks.length
          ? risks.map((risk, index) => (
              <AppText key={risk.misconceptionId}>
                {index + 1}. {risk.misconceptionId.replace(/_/g, ' ')} · {risk.count} Mal erkannt
              </AppText>
            ))
          : demoRisks.map((risk, index) => (
              <AppText key={risk}>
                {index + 1}. {risk}
              </AppText>
            ))}
        <AppText variant="caption" muted>
          {risks.length ? 'Aus deinem lokalen Fehlerprofil' : 'Vorschau aus den Demo-Aufgaben'}
        </AppText>
      </Card>
      {date && !dateIsValid ? (
        <Feedback
          title="Datum prüfen"
          message="Verwende ein gültiges Datum im Format JJJJ-MM-TT."
          kind="error"
        />
      ) : null}
      <AppButton
        label="Training starten"
        onPress={startTraining}
        disabled={!dateIsValid || candidates.length === 0}
      />
    </Page>
  );
}
