import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
export const C = {
  ink: "#203B34",
  forest: "#163F36",
  muted: "#687970",
  paper: "#FFFFFF",
  canvas: "#F5F5EF",
  line: "#E3E8DE",
  mint: "#E5EEDF",
  lime: "#D7EDAC",
  amber: "#F8EBCF",
  coral: "#F7E2D8",
};
export type IconName =
  | "home"
  | "pill"
  | "plan"
  | "heart"
  | "bell"
  | "arrow"
  | "check"
  | "chevron"
  | "close"
  | "sun"
  | "message"
  | "settings"
  | "leaf"
  | "clock";
const paths: Record<IconName, string> = {
  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  pill: "m9 15 6-6M5 19a5.65 5.65 0 0 1 0-8l6-6a5.65 5.65 0 0 1 8 8l-6 6a5.65 5.65 0 0 1-8 0Z",
  plan: "M8 5H5v16h14V5h-3M9 3h6v4H9ZM8 12h8M8 16h5",
  heart: "M12 21S2 15 2 8a5 5 0 0 1 10-1A5 5 0 0 1 22 8c0 7-10 13-10 13Z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  chevron: "m9 5 7 7-7 7",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M6 18 18 6",
  sun: "M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
  message: "M21 3H3v14h4v4l6-4h8ZM7 8h10M7 12h6",
  settings: "M4 7h16M4 17h16M8 4v6m8 4v6",
  leaf: "M20 3C7 2 2 8 5 16c8 4 16-1 15-13ZM3 22 15 10",
  clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
};
export function Icon({
  name,
  color = C.forest,
  size = 22,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={paths[name]}
        stroke={color}
        strokeWidth={1.65}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export function Face({
  value,
  selected = false,
  size = 42,
}: {
  value: number;
  selected?: boolean;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle
        cx="24"
        cy="24"
        r="21"
        fill={
          selected
            ? C.forest
            : ["#F4DDD2", "#F7E6C4", "#EEECD4", "#E3EDCE", "#D1E9CA"][value - 1]
        }
      />
      <Circle cx="17" cy="20" r="1.8" fill={selected ? "white" : C.forest} />
      <Circle cx="31" cy="20" r="1.8" fill={selected ? "white" : C.forest} />
      <Path
        d={
          [
            "M16 33Q24 22 32 33",
            "M17 31Q24 25 31 31",
            "M17 29H31",
            "M17 27Q24 34 31 27",
            "M15 26Q24 39 33 26",
          ][value - 1]
        }
        stroke={selected ? "white" : C.forest}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}
export function Plant() {
  return (
    <Svg width={100} height={132} viewBox="0 0 100 132">
      <Path
        d="M52 115C50 84 59 67 68 36"
        stroke="#C7DFA7"
        strokeWidth="2"
        fill="none"
      />
      <Path d="M56 87C17 88 17 56 24 50c27 4 37 21 32 37Z" fill="#97B997" />
      <Path d="M61 64C53 34 76 21 88 26c4 26-12 40-27 38Z" fill="#D7EDAC" />
      <Path d="M54 104C69 78 87 80 92 88c-7 22-25 29-38 16Z" fill="#BDD5A2" />
      <Path d="M59 63C28 59 30 30 40 24c19 8 25 24 19 39Z" fill="#759E87" />
      <Rect x="36" y="109" width="35" height="18" rx="8" fill="#EBEEE0" />
    </Svg>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: C.forest }]}>
        {title}
      </Text>
      {icon && (
        <Icon name={icon} color={secondary ? C.forest : "white"} size={19} />
      )}
    </Pressable>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.section}>
      <Text style={s.h2}>{title}</Text>
      {action && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={s.textButton}
        >
          <Text style={s.link}>{action}</Text>
          <Icon name="arrow" size={16} />
        </Pressable>
      )}
    </View>
  );
}
export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },
  shell: {
    flex: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    backgroundColor: C.canvas,
  },
  content: { paddingHorizontal: 24, paddingBottom: 30, gap: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: -1.1,
    color: C.forest,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: C.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECEEE5",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    color: C.muted,
    textTransform: "uppercase",
  },
  h1: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "600",
    letterSpacing: -1.3,
    color: C.ink,
  },
  h2: { fontSize: 20, fontWeight: "600", letterSpacing: -0.5, color: C.ink },
  h3: { fontSize: 16, fontWeight: "600", color: C.ink },
  body: { fontSize: 15, lineHeight: 23, color: C.muted },
  small: { fontSize: 12, lineHeight: 18, color: C.muted },
  link: { fontSize: 13, fontWeight: "600", color: C.forest },
  card: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    gap: 14,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  textButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: C.forest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  secondary: { backgroundColor: C.mint },
  buttonText: { fontSize: 15, fontWeight: "600", color: "white" },
  hero: {
    backgroundColor: C.forest,
    borderRadius: 26,
    padding: 23,
    overflow: "hidden",
    minHeight: 178,
    justifyContent: "space-between",
  },
  heroTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "500",
    letterSpacing: -0.7,
    color: "white",
    maxWidth: "72%",
  },
  heroSmall: {
    fontSize: 12,
    lineHeight: 18,
    color: "#CBDECF",
    maxWidth: "72%",
  },
  plant: { position: "absolute", right: 8, top: 12 },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: C.mint,
  },
  pillText: { fontSize: 11, fontWeight: "600", color: C.forest },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 3,
    marginVertical: 7,
  },
  moodButton: {
    alignItems: "center",
    gap: 9,
    paddingVertical: 7,
    flex: 1,
    borderRadius: 18,
  },
  moodLabel: { fontSize: 11, color: C.muted },
  divider: { height: 1, backgroundColor: C.line },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: C.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  grow: { flex: 1, gap: 4 },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: C.paper,
    borderTopWidth: 1,
    borderColor: C.line,
    paddingTop: 9,
    paddingBottom: 7,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minHeight: 55,
    flex: 1,
  },
  navIcon: { borderRadius: 18, paddingVertical: 4, paddingHorizontal: 16 },
  navText: { fontSize: 11, color: C.muted },
  input: {
    backgroundColor: "#F7F8F3",
    borderWidth: 1,
    borderColor: "#D7E0D4",
    borderRadius: 14,
    minHeight: 52,
    padding: 14,
    fontSize: 16,
    color: C.ink,
  },
  chip: {
    paddingHorizontal: 14,
    minHeight: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.line,
    justifyContent: "center",
    backgroundColor: C.paper,
  },
  chipActive: { backgroundColor: C.mint, borderColor: C.forest },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  overlay: {
    flex: 1,
    backgroundColor: "#102E2880",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.canvas,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "94%",
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  sheetHead: {
    padding: 24,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sheetContent: { padding: 24, paddingTop: 8, gap: 20, paddingBottom: 36 },
  notice: { padding: 14, backgroundColor: C.mint, borderRadius: 16, gap: 5 },
  toast: {
    marginHorizontal: 24,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.forest,
  },
  toastText: { color: "white", fontSize: 13, lineHeight: 20 },
  progress: {
    height: 6,
    backgroundColor: "#E7ECE3",
    borderRadius: 6,
    overflow: "hidden",
  },
  task: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  checkbox: {
    width: 27,
    height: 27,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#BDCCBC",
    alignItems: "center",
    justifyContent: "center",
  },
});
