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
          width: '100%',
          maxWidth: 760,
          alignSelf: 'center',
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.giant,
          gap: spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.md }}>
          {back ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Zurück"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              style={({ pressed }) => ({
                minHeight: 44,
                alignSelf: 'flex-start',
                justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <AppText style={{ color: colors.primary, fontWeight: '700' }}>‹ Zurück</AppText>
            </Pressable>
          ) : null}

          {eyebrow ? <Pill label={eyebrow.toUpperCase()} tone="primary" /> : null}

          <View style={{ gap: spacing.sm }}>
            <AppText variant="hero">{title}</AppText>
            {subtitle ? (
              <AppText muted style={{ maxWidth: 620 }}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
  elevated = false,
}: {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}) {
  const { colors, isDark } = useTheme();

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
          ...(elevated
            ? {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.18 : 0.08,
                shadowRadius: 18,
                elevation: 3,
              }
            : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function HeroCard({
  kicker,
  title,
  body,
  children,
}: {
  kicker?: string;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.primaryStrong,
        borderRadius: radius.xl,
        padding: spacing.xxl,
        gap: spacing.md,
        overflow: 'hidden',
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: colors.primary,
          opacity: 0.38,
          right: -70,
          top: -70,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.accent,
          opacity: 0.18,
          right: 36,
          bottom: -68,
        }}
      />
      {kicker ? (
        <AppText
          variant="caption"
          style={{ color: colors.primarySoft, fontWeight: '800', letterSpacing: 1.2 }}
        >
          {kicker.toUpperCase()}
        </AppText>
      ) : null}
      <AppText variant="title" style={{ color: colors.white, maxWidth: 520 }}>
        {title}
      </AppText>
      {body ? (
        <AppText style={{ color: colors.white, opacity: 0.82, maxWidth: 560 }}>{body}</AppText>
      ) : null}
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
        minHeight: 56,
        borderRadius: radius.md,
        backgroundColor,
        borderWidth: variant === 'ghost' ? 1 : 0,
        borderColor: colors.borderStrong,
        opacity: disabled ? 0.42 : pressed ? 0.78 : 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        transform: [{ scale: pressed && !disabled ? 0.992 : 1 }],
      })}
    >
      {busy ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText style={{ color: textColor, fontWeight: '800', textAlign: 'center' }}>
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
          minHeight: 56,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.borderStrong,
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
  prefix,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  prefix?: string;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 58,
        padding: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        justifyContent: 'center',
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {prefix ? (
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? colors.primary : colors.surfaceAlt,
            }}
          >
            <AppText
              style={{ color: selected ? colors.white : colors.primary, fontWeight: '800' }}
            >
              {prefix}
            </AppText>
          </View>
        ) : null}
        <AppText style={{ flex: 1, fontWeight: selected ? '700' : '500' }}>{label}</AppText>
        <AppText style={{ color: selected ? colors.primary : colors.muted }}>
          {selected ? '✓' : '›'}
        </AppText>
      </View>
    </Pressable>
  );
}

export function Pill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'primary' | 'accent' | 'warning';
}) {
  const { colors } = useTheme();
  const backgroundColor =
    tone === 'primary'
      ? colors.primarySoft
      : tone === 'accent'
        ? colors.accentSoft
        : tone === 'warning'
          ? colors.warningSoft
          : colors.surfaceAlt;
  const foreground =
    tone === 'primary'
      ? colors.primary
      : tone === 'accent'
        ? colors.accent
        : tone === 'warning'
          ? colors.warning
          : colors.muted;

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      }}
    >
      <AppText
        variant="caption"
        style={{ color: foreground, fontWeight: '800', letterSpacing: 0.6 }}
      >
        {label}
      </AppText>
    </View>
  );
}

export function ActionTile({
  symbol,
  title,
  subtitle,
  onPress,
  accent = false,
}: {
  symbol: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  accent?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 150,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
        backgroundColor: accent ? colors.primarySoft : colors.surface,
        borderWidth: 1,
        borderColor: accent ? colors.borderStrong : colors.border,
        opacity: pressed ? 0.74 : 1,
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: accent ? colors.primary : colors.surfaceAlt,
        }}
      >
        <AppText
          variant="lead"
          style={{ color: accent ? colors.white : colors.primary, fontWeight: '800' }}
        >
          {symbol}
        </AppText>
      </View>
      <View style={{ gap: spacing.xs }}>
        <AppText style={{ fontWeight: '800' }}>{title}</AppText>
        <AppText variant="caption" muted>
          {subtitle}
        </AppText>
      </View>
    </Pressable>
  );
}

export function StatTile({
  value,
  label,
  detail,
  tone = 'primary',
}: {
  value: string;
  label: string;
  detail?: string;
  tone?: 'primary' | 'accent' | 'warning';
}) {
  const { colors } = useTheme();
  const foreground =
    tone === 'accent' ? colors.accent : tone === 'warning' ? colors.warning : colors.primary;
  const backgroundColor =
    tone === 'accent'
      ? colors.accentSoft
      : tone === 'warning'
        ? colors.warningSoft
        : colors.primarySoft;

  return (
    <View
      style={{
        flex: 1,
        minWidth: 130,
        padding: spacing.lg,
        borderRadius: radius.lg,
        backgroundColor,
        gap: spacing.xs,
      }}
    >
      <AppText variant="title" style={{ color: foreground }}>
        {value}
      </AppText>
      <AppText style={{ fontWeight: '700' }}>{label}</AppText>
      {detail ? (
        <AppText variant="caption" muted>
          {detail}
        </AppText>
      ) : null}
    </View>
  );
}

export function PathRail({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <View
              key={step}
              style={{ flex: index === steps.length - 1 ? 0 : 1, flexDirection: 'row', alignItems: 'center' }}
            >
              <View
                accessibilityLabel={step}
                style={{
                  width: active ? 30 : 24,
                  height: active ? 30 : 24,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: done || active ? colors.primary : colors.surfaceAlt,
                  borderWidth: active ? 4 : 0,
                  borderColor: active ? colors.primarySoft : 'transparent',
                }}
              >
                <AppText
                  variant="caption"
                  style={{
                    color: done || active ? colors.white : colors.muted,
                    fontWeight: '800',
                  }}
                >
                  {done ? '✓' : index + 1}
                </AppText>
              </View>
              {index < steps.length - 1 ? (
                <View
                  style={{
                    height: 3,
                    flex: 1,
                    marginHorizontal: spacing.xs,
                    borderRadius: radius.pill,
                    backgroundColor: index < current ? colors.primary : colors.border,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
      <AppText variant="caption" muted>
        {steps[Math.max(0, Math.min(current, steps.length - 1))]}
      </AppText>
    </View>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View style={{ gap: spacing.sm }}>
      {label ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <AppText variant="caption" muted style={{ flex: 1 }}>
            {label}
          </AppText>
          <AppText variant="caption" style={{ fontWeight: '700' }}>
            {clamped}%
          </AppText>
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
  const backgroundColor =
    kind === 'error'
      ? colors.dangerSoft
      : kind === 'success'
        ? colors.successSoft
        : colors.accentSoft;
  const foreground =
    kind === 'error' ? colors.danger : kind === 'success' ? colors.success : colors.accent;

  return (
    <View
      accessibilityRole="alert"
      style={{
        padding: spacing.lg,
        backgroundColor,
        borderRadius: radius.md,
        gap: spacing.xs,
      }}
    >
      <AppText style={{ color: foreground, fontWeight: '800' }}>{title}</AppText>
      <AppText>{message}</AppText>
    </View>
  );
}

export function SectionTitle({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
      }}
    >
      <AppText variant="lead">{children}</AppText>
      {aside}
    </View>
  );
}
