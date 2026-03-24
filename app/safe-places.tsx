import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import PageHeader from '@/components/PageHeader';
import { SAFE_PLACES_DATA } from '@/constants/stalking';

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SafePlacesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const filteredData = useMemo(() => {
    let data = SAFE_PLACES_DATA;

    if (selectedCategory) {
      data = data.filter((cat) => cat.category === selectedCategory);
    }

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      data = data
        .map((cat) => ({
          ...cat,
          places: cat.places.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.address.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.places.length > 0);
    }

    return data;
  }, [selectedCategory, searchText]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <PageHeader title="안전 장소" subtitle="긴급 대피·상담 안내" showBack />

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.lightText} />
        <TextInput
          style={styles.searchInput}
          placeholder="장소 이름, 주소 검색..."
          placeholderTextColor={COLORS.lightText}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.lightText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        <TouchableOpacity
          style={[styles.tab, !selectedCategory && styles.tabActive]}
          onPress={() => setSelectedCategory(null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, !selectedCategory && styles.tabTextActive]}>
            전체
          </Text>
        </TouchableOpacity>
        {SAFE_PLACES_DATA.map((cat) => (
          <TouchableOpacity
            key={cat.category}
            style={[
              styles.tab,
              selectedCategory === cat.category && styles.tabActive,
            ]}
            onPress={() =>
              setSelectedCategory(
                selectedCategory === cat.category ? null : cat.category
              )
            }
            activeOpacity={0.7}
          >
            <Ionicons
              name={cat.icon as any}
              size={14}
              color={
                selectedCategory === cat.category
                  ? COLORS.white
                  : cat.color
              }
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.tabText,
                selectedCategory === cat.category && styles.tabTextActive,
              ]}
            >
              {cat.category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Places list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredData.map((cat) => (
          <View key={cat.category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View
                style={[
                  styles.categoryIconWrap,
                  { backgroundColor: cat.color + '18' },
                ]}
              >
                <Ionicons name={cat.icon as any} size={18} color={cat.color} />
              </View>
              <Text style={styles.categoryTitle}>{cat.category}</Text>
              <Text style={styles.categoryCount}>{cat.places.length}곳</Text>
            </View>

            {cat.places.map((place, idx) => (
              <View key={idx} style={styles.placeCard}>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <View style={styles.placeDetailRow}>
                    <Ionicons name="location" size={13} color={COLORS.lightText} />
                    <Text style={styles.placeDetail}>{place.address}</Text>
                  </View>
                  <View style={styles.placeDetailRow}>
                    <Ionicons name="time" size={13} color={COLORS.lightText} />
                    <Text style={styles.placeDetail}>{place.hours}</Text>
                  </View>
                  <Text style={styles.placeDesc}>{place.description}</Text>
                </View>

                <TouchableOpacity
                  style={styles.callBtn}
                  activeOpacity={0.8}
                  onPress={() => handleCall(place.phone)}
                >
                  <Ionicons name="call" size={16} color={COLORS.white} />
                  <Text style={styles.callBtnText}>전화하기</Text>
                  <Text style={styles.callBtnPhone}>{place.phone}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        {filteredData.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={40} color={COLORS.lightText} />
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          </View>
        )}

        {/* Emergency contacts bottom */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>긴급 연락처</Text>
          <Text style={styles.emergencySub}>
            위험한 상황이라면 즉시 연락하세요
          </Text>

          <TouchableOpacity
            style={styles.emergencyCard}
            activeOpacity={0.85}
            onPress={() => handleCall('112')}
          >
            <View style={[styles.emergencyIconWrap, { backgroundColor: COLORS.coral + '18' }]}>
              <Ionicons name="call" size={22} color={COLORS.coral} />
            </View>
            <View style={styles.emergencyTextArea}>
              <Text style={styles.emergencyName}>경찰 신고</Text>
              <Text style={styles.emergencyPhone}>112</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyCard}
            activeOpacity={0.85}
            onPress={() => handleCall('1366')}
          >
            <View style={[styles.emergencyIconWrap, { backgroundColor: COLORS.sage + '18' }]}>
              <Ionicons name="heart" size={22} color={COLORS.sage} />
            </View>
            <View style={styles.emergencyTextArea}>
              <Text style={styles.emergencyName}>여성긴급전화</Text>
              <Text style={styles.emergencyPhone}>1366</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyCard}
            activeOpacity={0.85}
            onPress={() => handleCall('1644-8422')}
          >
            <View style={[styles.emergencyIconWrap, { backgroundColor: COLORS.gold + '18' }]}>
              <Ionicons name="chatbubbles" size={22} color={COLORS.gold} />
            </View>
            <View style={styles.emergencyTextArea}>
              <Text style={styles.emergencyName}>법률사무소 청송</Text>
              <Text style={styles.emergencyPhone}>1644-8422</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyCard}
            activeOpacity={0.85}
            onPress={() => handleCall('02-735-8994')}
          >
            <View style={[styles.emergencyIconWrap, { backgroundColor: COLORS.plum + '18' }]}>
              <Ionicons name="phone-portrait" size={22} color={COLORS.plum} />
            </View>
            <View style={styles.emergencyTextArea}>
              <Text style={styles.emergencyName}>디지털성범죄피해자지원센터</Text>
              <Text style={styles.emergencyPhone}>02-735-8994</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyCard}
            activeOpacity={0.85}
            onPress={() => handleCall('119')}
          >
            <View style={[styles.emergencyIconWrap, { backgroundColor: COLORS.blue + '18' }]}>
              <Ionicons name="medkit" size={22} color={COLORS.blue} />
            </View>
            <View style={styles.emergencyTextArea}>
              <Text style={styles.emergencyName}>응급 구조</Text>
              <Text style={styles.emergencyPhone}>119</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            서울 지역 중심 데이터입니다. 지역별 정보는 1366에 문의하세요.{'\n'}
            운영시간은 변경될 수 있으니 방문 전 전화 확인을 권장합니다.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scroll: {
    flex: 1,
  },

  /* Search */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    paddingVertical: SPACING.xs,
  },

  /* Tabs */
  tabsScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 1,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmGray,
  },
  tabActive: {
    backgroundColor: COLORS.navy,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.slate,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  /* Category */
  categorySection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    flex: 1,
  },
  categoryCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    fontWeight: '500',
  },

  /* Place card */
  placeCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  placeInfo: {
    marginBottom: SPACING.md,
  },
  placeName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  placeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    marginBottom: 4,
  },
  placeDetail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },
  placeDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    marginTop: SPACING.sm,
    lineHeight: FONT_SIZE.sm * 1.5,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.sage,
    paddingVertical: SPACING.sm + 4,
    borderRadius: RADIUS.md,
    minHeight: 46,
  },
  callBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  callBtnPhone: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    opacity: 0.8,
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.lightText,
  },

  /* Emergency */
  emergencySection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  emergencyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  emergencySub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  emergencyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTextArea: {
    flex: 1,
  },
  emergencyName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  emergencyPhone: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    marginTop: 2,
  },

  /* Disclaimer */
  disclaimer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: FONT_SIZE.xs * 1.6,
  },
});
