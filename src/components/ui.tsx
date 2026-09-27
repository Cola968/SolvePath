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
  numberOfLines,
}: {
  children: ReactNode;
  variant?: TextVariant;
  muted?: boolean;
  style?: object;
  numberOfLines?: number;
}) {
  const { colors } = useTheme();
  const fontWeight =
    variant === 'hero' ? '700' : variant === 'title' ? '700' : variant === 'lead' ? '600' : '400';

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          color: muted ? colors.muted : colors.ink,
          fontSize: typeScale[variant],
          lineHeight:
            variant === 'caption'
              ? 17
              : variant === 'body'
                ? 23
                : variant === 'lead'
                  ? 25
                  : variant === 'title'
                    ? 31
                    : 37,
          fontWeight,
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
          maxWidth: 680,
          alignSelf: 'center',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.giant,
          gap: spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.md }}>
          <View
            style={{
              minHeight: 40,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.md,
            }}
          >
            {back ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Zurück"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                hitSlop={10}
                style={({ pressed }) => ({
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
                })}
              >
                <AppText variant="lead" style={{ color: colors.ink }}>
                  ‹
                </AppText>
              </Pressable>
            ) : (
              <View style={{ width: 40 }} />
            )}

            {eyebrow ? (
              <AppText
                variant="caption"
                muted
                style={{ fontWeight: '700', letterSpacing: 0.3, textAlign: 'right' }}
              >
                {eyebrow}
              </AppText>
            ) : null}
          </View>

          <View style={{ gap: spacing.xs }}>
            <AppText variant="hero">{title}</AppText>
            {subtitle ? <AppText muted>{subtitle}</AppText> : null}
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
          padding: spacing.lg,
          gap: spacing.md,
          ...(elevated
            ? {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.18 : 0.05,
                shadowRadius: 10,
                elevation: 2,
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
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.xl,
        gap: spacing.md,
      }}
    >
      {kicker ? (
        <AppText
          variant="caption"
          style={{ color: colors.primary, fontWeight: '700', letterSpacing: 0.3 }}
        >
          {kicker}
        </AppText>
      ) : null}
      <AppText variant="title">{title}</AppText>
      {body ? <AppText muted>{body}</AppText> : null}
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
        ? colors.surface
        : 'transparent';
  const textColor = variant === 'primary' ? colors.white : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy }}
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => ({
        minHeight: 52,
        borderRadius: radius.md,
        backgroundColor,
        borderWidth: variant === 'primary' ? 0 : 1,
        borderColor: variant === 'ghost' ? 'transparent' : colors.borderStrong,
        opacity: disabled ? 0.42 : pressed ? 0.72 : 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
      })}
    >
      {busy ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
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
      selectionColor={colors.primary}
      style={[
        {
          minHeight: 52,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          color: colors.ink,
          fontSize: typeScale.body,
          lineHeight: 23,
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
        minHeight: 54,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
        opacity: disabled ? 0.45 : pressed ? 0.72 : 1,
        justifyContent: 'center',
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {prefix ? (
          <View
            style={{
              minWidth: 30,
              height: 30,
              paddingHorizontal: spacing.xs,
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? colors.primary : colors.surfaceAlt,
            }}
          >
            <AppText
              variant="caption"
              style={{ color: selected ? colors.white : colors.muted, fontWeight: '700' }}
            >
              {prefix}
            </AppText>
          </View>
        ) : (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: selected ? colors.primary : colors.borderStrong,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selected ? (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.primary,
                }}
              />
            ) : null}
          </View>
        )}
        <AppText style={{ flex: 1, fontWeight: selected ? '600' : '500' }}>{label}</AppText>
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
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
      }}
    >
      <AppText variant="caption" style={{ color: foreground, fontWeight: '700' }}>
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
        width: '100%',
        minHeight: 70,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: accent ? colors.primarySoft : colors.surface,
        borderWidth: 1,
        borderColor: accent ? colors.primary : colors.border,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: accent ? colors.primary : colors.surfaceAlt,
        }}
      >
        <AppText
          style={{ color: accent ? colors.white : colors.ink, fontWeight: '700' }}
        >
          {symbol}
        </AppText>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText style={{ fontWeight: '700' }}>{title}</AppText>
        <AppText variant="caption" muted>
          {subtitle}
        </AppText>
      </View>
      <AppText muted>›</AppText>
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

  return (
    <View
      style={{
        flex: 1,
        minWidth: 108,
        paddingVertical: spacing.sm,
        gap: 2,
      }}
    >
      <AppText variant="lead" style={{ color: foreground, fontWeight: '700' }}>
        {value}
      </AppText>
      <AppText variant="caption" style={{ fontWeight: '600' }}>
        {label}
      </AppText>
      {detail ? (
        <AppText variant="caption" muted numberOfLines={1}>
          {detail}
        </AppText>
      ) : null}
    </View>
  );
}

export function PathRail({ steps, current }: { steps: string[]; current: number }) {
  const { colors } = useTheme();
  const safeCurrent = Math.max(0, Math.min(current, steps.length - 1));
  const progress = ((safeCurrent + 1) / steps.length) * 100;

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
        <AppText variant="caption" muted>
          Schritt {safeCurrent + 1} von {steps.length}
        </AppText>
        <AppText variant="caption" style={{ fontWeight: '600' }}>
          {steps[safeCurrent]}
        </AppText>
      </View>
      <View
        style={{
          height: 4,
          borderRadius: radius.pill,
          backgroundColor: colors.surfaceStrong,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: 4,
            width: `${progress}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>
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
          <AppText variant="caption" style={{ fontWeight: '600' }}>
            {clamped}%
          </AppText>
        </View>
      ) : null}
      <View
        style={{
          height: 6,
          borderRadius: radius.pill,
          backgroundColor: colors.surfaceStrong,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: 6,
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
        : colors.primarySoft;
  const foreground =
    kind === 'error' ? colors.danger : kind === 'success' ? colors.success : colors.primary;

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
      <AppText style={{ color: foreground, fontWeight: '700' }}>{title}</AppText>
      <AppText>{message}</AppText>
    </View>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
      }}
    >
      <AppText variant="lead" style={{ fontWeight: '700' }}>
        {children}
      </AppText>
      {aside}
    </View>
  );
}
