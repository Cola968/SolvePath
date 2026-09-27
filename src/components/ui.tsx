import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, typeScale, useTheme } from '../theme/tokens';

type TextVariant = 'caption' | 'body' | 'lead' | 'title' | 'hero';

export function AppText({
  children,
  variant = 'body',
  muted = false,
  style,
}: {
  children: ReactNode;
  variant?: TextVariant;
  muted?: boolean;
  style?: object;
}) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        {
          color: muted ? colors.muted : colors.ink,
          fontSize: typeScale[variant],
          lineHeight: typeScale[variant] * 1.35,
          fontWeight:
            variant === 'title' || variant === 'hero' ? '700' : variant === 'lead' ? '600' : '400',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Page({
  title,
  subtitle,
  children,
  back = true,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  back?: boolean;
  eyebrow?: string;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.xl,
          paddingBottom: spacing.huge,
          gap: spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.sm }}>
          {back ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Zurück"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              style={{ minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center' }}
            >
              <AppText style={{ color: colors.primary }}>‹ Zurück</AppText>
            </Pressable>
          ) : null}
          {eyebrow ? (
            <AppText
              variant="caption"
              style={{ color: colors.primary, fontWeight: '700', letterSpacing: 1.5 }}
            >
              {eyebrow.toUpperCase()}
            </AppText>
          ) : null}
          <AppText variant="hero">{title}</AppText>
          {subtitle ? <AppText muted>{subtitle}</AppText> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          padding: spacing.xl,
          gap: spacing.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  busy = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  busy?: boolean;
}) {
  const { colors } = useTheme();
  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.primarySoft
        : 'transparent';
  const textColor = variant === 'primary' ? colors.white : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy }}
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => ({
        minHeight: 54,
        borderRadius: radius.md,
        backgroundColor,
        borderWidth: variant === 'ghost' ? 1 : 0,
        borderColor: colors.border,
        opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
      })}
    >
      {busy ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText style={{ color: textColor, fontWeight: '700', textAlign: 'center' }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

export function AppInput(props: TextInputProps) {
  const { colors } = useTheme();
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.muted}
      style={[
        {
          minHeight: 54,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          padding: spacing.lg,
          color: colors.ink,
          fontSize: typeScale.body,
          textAlignVertical: 'top',
        },
        props.style,
      ]}
    />
  );
}

export function Choice({
  label,
  selected,
  onPress,
  disabled = false,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 54,
        padding: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
        opacity: pressed ? 0.75 : 1,
        justifyContent: 'center',
      })}
    >
      <AppText style={{ fontWeight: selected ? '700' : '400' }}>{label}</AppText>
    </Pressable>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={{ gap: spacing.sm }}>
      {label ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="caption" muted>
            {label}
          </AppText>
          <AppText variant="caption">{clamped}%</AppText>
        </View>
      ) : null}
      <View
        style={{
          height: 8,
          borderRadius: radius.pill,
          backgroundColor: colors.surfaceAlt,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: 8,
            width: `${clamped}%`,
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
          }}
        />
      </View>
    </View>
  );
}

export function Feedback({
  title,
  message,
  kind = 'neutral',
}: {
  title: string;
  message: string;
  kind?: 'success' | 'error' | 'neutral';
}) {
  const { colors } = useTheme();
  const backgroundColor = kind === 'error' ? colors.dangerSoft : colors.primarySoft;
  const foreground = kind === 'error' ? colors.danger : colors.primary;
  return (
    <View
      accessibilityRole="alert"
      style={{ padding: spacing.lg, backgroundColor, borderRadius: radius.md, gap: spacing.xs }}
    >
      <AppText style={{ color: foreground, fontWeight: '700' }}>{title}</AppText>
      <AppText>{message}</AppText>
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <AppText variant="lead">{children}</AppText>;
}
