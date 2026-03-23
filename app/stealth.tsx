import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { useAppContext } from '@/contexts/AppContext';

const SECRET_PIN = '1234';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_MARGIN = 8;
const BUTTONS_PER_ROW = 4;
const BUTTON_SIZE =
  (SCREEN_WIDTH - 32 - BUTTON_MARGIN * 2 * BUTTONS_PER_ROW) / BUTTONS_PER_ROW;

type ButtonType = 'number' | 'operator' | 'function' | 'zero';

interface CalcButton {
  label: string;
  type: ButtonType;
  wide?: boolean;
}

const BUTTON_ROWS: CalcButton[][] = [
  [
    { label: 'AC', type: 'function' },
    { label: 'C', type: 'function' },
    { label: '±', type: 'function' },
    { label: '÷', type: 'operator' },
  ],
  [
    { label: '7', type: 'number' },
    { label: '8', type: 'number' },
    { label: '9', type: 'number' },
    { label: '×', type: 'operator' },
  ],
  [
    { label: '4', type: 'number' },
    { label: '5', type: 'number' },
    { label: '6', type: 'number' },
    { label: '-', type: 'operator' },
  ],
  [
    { label: '1', type: 'number' },
    { label: '2', type: 'number' },
    { label: '3', type: 'number' },
    { label: '+', type: 'operator' },
  ],
  [
    { label: '0', type: 'zero', wide: true },
    { label: '.', type: 'number' },
    { label: '=', type: 'operator' },
  ],
];

// ── Weather fake data ──
const WEATHER_FORECAST = [
  { day: '오늘', temp: '18°', icon: 'sunny-outline' as const, status: '맑음' },
  { day: '내일', temp: '16°', icon: 'cloudy-outline' as const, status: '흐림' },
  { day: '수요일', temp: '20°', icon: 'partly-sunny-outline' as const, status: '구름조금' },
  { day: '목요일', temp: '14°', icon: 'rainy-outline' as const, status: '비' },
  { day: '금요일', temp: '17°', icon: 'sunny-outline' as const, status: '맑음' },
];

// ── Memo fake data ──
const FAKE_MEMOS = [
  { id: '1', title: '장보기 목록', date: '3월 22일', preview: '우유, 달걀, 빵...' },
  { id: '2', title: '회의 메모', date: '3월 20일', preview: '다음주 월요일 10시...' },
  { id: '3', title: '여행 계획', date: '3월 18일', preview: '제주도 3박 4일...' },
  { id: '4', title: '읽을 책 목록', date: '3월 15일', preview: '1. 코스모스 2. 사피엔스...' },
  { id: '5', title: '운동 루틴', date: '3월 12일', preview: '월수금 - 상체, 화목 - 하체...' },
];

// ═══════════════════════════════════════════════
// Calculator Stealth
// ═══════════════════════════════════════════════
function CalculatorMode({ onExit }: { onExit: () => void }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [resetOnNext, setResetOnNext] = useState(false);
  const [digitSequence, setDigitSequence] = useState('');

  const calculate = useCallback(
    (a: number, op: string, b: number): number => {
      switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '×': return a * b;
        case '÷': return b !== 0 ? a / b : 0;
        default: return b;
      }
    },
    []
  );

  const handlePress = useCallback(
    (label: string) => {
      if (/^[0-9]$/.test(label)) {
        const newSequence = digitSequence + label;
        setDigitSequence(newSequence);
        if (resetOnNext) {
          setDisplay(label);
          setResetOnNext(false);
        } else {
          setDisplay((prev) => (prev === '0' ? label : prev + label));
        }
        return;
      }
      if (label === '.') {
        setDigitSequence('');
        if (resetOnNext) { setDisplay('0.'); setResetOnNext(false); }
        else if (!display.includes('.')) { setDisplay((prev) => prev + '.'); }
        return;
      }
      if (label === '±') {
        setDigitSequence('');
        setDisplay((prev) => {
          const num = parseFloat(prev);
          if (num === 0) return prev;
          return String(-num);
        });
        return;
      }
      if (label === 'AC') {
        setDisplay('0'); setPreviousValue(null); setOperator(null);
        setResetOnNext(false); setDigitSequence('');
        return;
      }
      if (label === 'C') {
        setDisplay('0'); setDigitSequence('');
        return;
      }
      if (label === '=') {
        if (digitSequence === SECRET_PIN) { onExit(); return; }
        setDigitSequence('');
        if (operator && previousValue !== null) {
          const current = parseFloat(display);
          const result = calculate(previousValue, operator, current);
          const resultStr = Number.isInteger(result)
            ? String(result)
            : String(parseFloat(result.toFixed(8)));
          setDisplay(resultStr);
          setPreviousValue(null); setOperator(null); setResetOnNext(true);
        }
        return;
      }
      if (['+', '-', '×', '÷'].includes(label)) {
        setDigitSequence('');
        const current = parseFloat(display);
        if (operator && previousValue !== null && !resetOnNext) {
          const result = calculate(previousValue, operator, current);
          const resultStr = Number.isInteger(result)
            ? String(result)
            : String(parseFloat(result.toFixed(8)));
          setDisplay(resultStr); setPreviousValue(result);
        } else {
          setPreviousValue(current);
        }
        setOperator(label); setResetOnNext(true);
      }
    },
    [display, previousValue, operator, resetOnNext, digitSequence, calculate, onExit]
  );

  const getButtonStyle = (type: ButtonType, wide?: boolean) => {
    const base: any[] = [calcStyles.button];
    if (wide) base.push(calcStyles.buttonWide);
    switch (type) {
      case 'operator': base.push(calcStyles.buttonOperator); break;
      case 'function': base.push(calcStyles.buttonFunction); break;
      default: base.push(calcStyles.buttonNumber); break;
    }
    return base;
  };

  const getTextStyle = (type: ButtonType) => {
    switch (type) {
      case 'operator': return [calcStyles.buttonText, calcStyles.operatorText];
      case 'function': return [calcStyles.buttonText, calcStyles.functionText];
      default: return [calcStyles.buttonText];
    }
  };

  const formattedDisplay = (() => {
    if (display.length > 12) {
      const num = parseFloat(display);
      return num.toExponential(5);
    }
    return display;
  })();

  return (
    <View style={calcStyles.container}>
      <StatusBar barStyle="light-content" />
      <View style={calcStyles.displayContainer}>
        <Text
          style={[calcStyles.displayText, formattedDisplay.length > 8 && calcStyles.displayTextSmall]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formattedDisplay}
        </Text>
      </View>
      <View style={calcStyles.buttonGrid}>
        {BUTTON_ROWS.map((row, rowIndex) => (
          <View key={rowIndex} style={calcStyles.row}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn.label}
                style={getButtonStyle(btn.type, btn.wide)}
                onPress={() => handlePress(btn.label)}
                activeOpacity={0.6}
              >
                <Text style={getTextStyle(btn.type)}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════
// Weather Stealth
// ═══════════════════════════════════════════════
function WeatherMode({ onExit }: { onExit: () => void }) {
  const [location, setLocation] = useState('서울');

  const handleSearch = () => {
    if (location.trim() === SECRET_PIN) {
      onExit();
    }
  };

  return (
    <View style={weatherStyles.container}>
      <StatusBar barStyle="light-content" />

      {/* Search bar */}
      <View style={weatherStyles.searchRow}>
        <TextInput
          style={weatherStyles.searchInput}
          value={location}
          onChangeText={setLocation}
          placeholder="도시 검색"
          placeholderTextColor="rgba(255,255,255,0.4)"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          onPress={handleSearch}
          style={weatherStyles.searchButton}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {/* Current weather */}
      <View style={weatherStyles.currentWeather}>
        <Text style={weatherStyles.cityName}>서울</Text>
        <Text style={weatherStyles.temperature}>18°</Text>
        <Text style={weatherStyles.status}>맑음</Text>
        <Text style={weatherStyles.highLow}>최고 21° / 최저 12°</Text>
      </View>

      {/* Forecast */}
      <View style={weatherStyles.forecastCard}>
        {WEATHER_FORECAST.map((item, index) => (
          <View
            key={item.day}
            style={[
              weatherStyles.forecastRow,
              index < WEATHER_FORECAST.length - 1 && weatherStyles.forecastBorder,
            ]}
          >
            <Text style={weatherStyles.forecastDay}>{item.day}</Text>
            <Ionicons name={item.icon} size={22} color="rgba(255,255,255,0.8)" />
            <Text style={weatherStyles.forecastStatus}>{item.status}</Text>
            <Text style={weatherStyles.forecastTemp}>{item.temp}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════
// Memo Stealth
// ═══════════════════════════════════════════════
function MemoMode({ onExit }: { onExit: () => void }) {
  const handleLongPress = (index: number) => {
    // Secret: long-press on the 4th memo (index 3) triggers exit
    if (index === 3) {
      onExit();
    }
  };

  return (
    <View style={memoStyles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={memoStyles.header}>
        <Text style={memoStyles.headerTitle}>메모</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="create-outline" size={24} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={memoStyles.searchBar}>
        <Ionicons name="search" size={16} color={COLORS.lightText} />
        <Text style={memoStyles.searchPlaceholder}>검색</Text>
      </View>

      {/* Memo list */}
      <FlatList
        data={FAKE_MEMOS}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={memoStyles.memoItem}
            activeOpacity={0.6}
            onLongPress={() => handleLongPress(index)}
            delayLongPress={800}
          >
            <Text style={memoStyles.memoTitle}>{item.title}</Text>
            <View style={memoStyles.memoMeta}>
              <Text style={memoStyles.memoDate}>{item.date}</Text>
              <Text style={memoStyles.memoPreview} numberOfLines={1}>
                {item.preview}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={memoStyles.separator} />}
        contentContainerStyle={memoStyles.listContent}
      />

      {/* Bottom count */}
      <View style={memoStyles.footer}>
        <Text style={memoStyles.footerText}>{FAKE_MEMOS.length}개의 메모</Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════════
export default function StealthCalculatorScreen() {
  const { setStealthMode, safetySettings } = useAppContext();

  const handleExit = useCallback(() => {
    setStealthMode(false);
  }, [setStealthMode]);

  switch (safetySettings.fakeIcon) {
    case 'weather':
      return <WeatherMode onExit={handleExit} />;
    case 'memo':
      return <MemoMode onExit={handleExit} />;
    case 'calculator':
    default:
      return <CalculatorMode onExit={handleExit} />;
  }
}

// ═══════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════

const calcStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.stealthBg,
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  displayContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 120,
  },
  displayText: {
    color: COLORS.stealthText,
    fontSize: 72,
    fontWeight: '300',
    letterSpacing: -1,
  },
  displayTextSmall: {
    fontSize: 48,
  },
  buttonGrid: {
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    margin: BUTTON_MARGIN,
  },
  buttonWide: {
    width: BUTTON_SIZE * 2 + BUTTON_MARGIN * 2,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'flex-start',
    paddingLeft: BUTTON_SIZE * 0.35,
  },
  buttonNumber: {
    backgroundColor: COLORS.stealthButton,
  },
  buttonOperator: {
    backgroundColor: COLORS.stealthButtonOrange,
  },
  buttonFunction: {
    backgroundColor: '#a5a5a5',
  },
  buttonText: {
    color: COLORS.stealthText,
    fontSize: 28,
    fontWeight: '500',
  },
  operatorText: {
    fontSize: 32,
    fontWeight: '400',
  },
  functionText: {
    color: COLORS.black,
  },
});

const weatherStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3a5c',
    paddingTop: 60,
  },
  searchRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentWeather: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  cityName: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '300',
    marginBottom: SPACING.xs,
  },
  temperature: {
    color: COLORS.white,
    fontSize: 80,
    fontWeight: '200',
    lineHeight: 90,
  },
  status: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZE.xl,
    fontWeight: '400',
    marginTop: SPACING.xs,
  },
  highLow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs,
  },
  forecastCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  forecastBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  forecastDay: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    width: 60,
  },
  forecastStatus: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZE.sm,
  },
  forecastTemp: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '500',
    width: 40,
    textAlign: 'right',
  },
});

const memoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: RADIUS.sm,
    marginHorizontal: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  searchPlaceholder: {
    color: COLORS.lightText,
    fontSize: FONT_SIZE.md,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
  },
  memoItem: {
    paddingVertical: SPACING.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  memoTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  memoMeta: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  memoDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
  },
  memoPreview: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.borderLight,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
  },
});
