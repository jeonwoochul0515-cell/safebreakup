import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { THERAPIST_DATA, MENTAL_HEALTH_RESOURCES } from '@/constants/trauma-recovery';

const SPECIALIZATION_FILTERS = ['데이트폭력', '스토킹', '성폭력', 'PTSD', '우울증'];
const TYPE_FILTERS = ['대면', '비대면'];

export default function TherapistDirectoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  };

  const filteredTherapists = useMemo(() => {
    return THERAPIST_DATA.filter((t) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          t.name.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.specializations.some((s) => s.toLowerCase().includes(q)) ||
          t.credentials.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Specialization filter
      if (selectedSpecs.length > 0) {
        const hasSpec = selectedSpecs.some((s) => t.specializations.includes(s));
        if (!hasSpec) return false;
      }

      // Type filter
      if (selectedType) {
        if (!t.type.includes(selectedType)) return false;
      }

      return true;
    });
  }, [searchQuery, selectedSpecs, selectedType]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>전문 상담사 찾기</Text>
        <View style={styles.headerBackButton} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.lightText} />
          <TextInput
            style={styles.searchInput}
            placeholder="이름, 지역, 전문분야 검색"
            placeholderTextColor={COLORS.lightText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.lightText} />
            </TouchableOpacity>
          )}
        </View>

        {/* Specialization Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          {SPECIALIZATION_FILTERS.map((spec) => {
            const isActive = selectedSpecs.includes(spec);
            return (
              <TouchableOpacity
                key={spec}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => toggleSpec(spec)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {spec}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Type Filters */}
        <View style={styles.typeRow}>
          {TYPE_FILTERS.map((type) => {
            const isActive = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, isActive && styles.typeChipActive]}
                onPress={() => setSelectedType(isActive ? null : type)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={type === '대면' ? 'person' : 'videocam'}
                  size={14}
                  color={isActive ? COLORS.sage : COLORS.slate}
                />
                <Text style={[styles.typeChipText, isActive && styles.typeChipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
          {(selectedSpecs.length > 0 || selectedType) && (
            <TouchableOpacity
              style={styles.clearFilter}
              onPress={() => { setSelectedSpecs([]); setSelectedType(null); }}
            >
              <Text style={styles.clearFilterText}>필터 초기화</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Empathy Message */}
        <View style={styles.empathyBanner}>
          <Ionicons name="heart" size={16} color={COLORS.sage} />
          <Text style={styles.empathyText}>전문 상담은 회복의 중요한 발걸음입니다</Text>
        </View>

        {/* Therapist Cards */}
        <Text style={styles.resultCount}>{filteredTherapists.length}명의 상담사</Text>

        {filteredTherapists.map((therapist) => (
          <View key={therapist.id} style={styles.therapistCard}>
            <View style={styles.therapistHeader}>
              <View style={styles.therapistAvatar}>
                <Ionicons name="person" size={24} color={COLORS.plum} />
              </View>
              <View style={styles.therapistHeaderInfo}>
                <Text style={styles.therapistName}>{therapist.name}</Text>
                <Text style={styles.therapistCredentials}>{therapist.credentials}</Text>
              </View>
            </View>

            {/* Specialization Badges */}
            <View style={styles.specRow}>
              {therapist.specializations.map((spec) => (
                <View key={spec} style={styles.specBadge}>
                  <Text style={styles.specBadgeText}>{spec}</Text>
                </View>
              ))}
            </View>

            {/* Location & Type */}
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="location" size={14} color={COLORS.slate} />
                <Text style={styles.detailText}>{therapist.location}</Text>
              </View>
              <View style={styles.typeBadge}>
                <Ionicons
                  name={therapist.type.includes('비대면') ? 'videocam' : 'person'}
                  size={12}
                  color={COLORS.sage}
                />
                <Text style={styles.typeBadgeText}>{therapist.type}</Text>
              </View>
            </View>

            {/* Bio */}
            <Text style={styles.therapistBio}>{therapist.bio}</Text>

            {/* Phone */}
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => Linking.openURL(`tel:${therapist.phone}`)}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={16} color={COLORS.white} />
              <Text style={styles.callButtonText}>{therapist.phone}</Text>
            </TouchableOpacity>
          </View>
        ))}

        {filteredTherapists.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={COLORS.borderLight} />
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
            <Text style={styles.emptySubtext}>다른 조건으로 검색해보세요</Text>
          </View>
        )}

        {/* Public Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>공공 지원 기관</Text>
          {MENTAL_HEALTH_RESOURCES.map((resource) => (
            <TouchableOpacity
              key={resource.phone}
              style={styles.resourceCard}
              onPress={() => Linking.openURL(`tel:${resource.phone}`)}
              activeOpacity={0.7}
            >
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceName}>{resource.name}</Text>
                <Text style={styles.resourceDesc}>{resource.description}</Text>
                <Text style={styles.resourceHours}>{resource.hours}</Text>
              </View>
              <View style={styles.resourcePhoneSection}>
                <Text style={styles.resourcePhone}>{resource.phone}</Text>
                <Ionicons name="call" size={16} color={COLORS.sage} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerBackButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText },

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.darkText },

  // Filters
  filterScroll: { marginBottom: SPACING.sm },
  filterRow: { gap: SPACING.xs, paddingRight: SPACING.md },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmGray,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterChipActive: { backgroundColor: COLORS.plum + '20', borderColor: COLORS.plum },
  filterChipText: { fontSize: FONT_SIZE.sm, color: COLORS.slate, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.plum, fontWeight: '700' },

  typeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md, alignItems: 'center' },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmGray,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  typeChipActive: { backgroundColor: COLORS.sage + '20', borderColor: COLORS.sage },
  typeChipText: { fontSize: FONT_SIZE.sm, color: COLORS.slate, fontWeight: '600' },
  typeChipTextActive: { color: COLORS.sage, fontWeight: '700' },
  clearFilter: { marginLeft: 'auto' },
  clearFilterText: { fontSize: FONT_SIZE.xs, color: COLORS.coral, fontWeight: '600' },

  // Empathy
  empathyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.sage + '15',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  empathyText: { fontSize: FONT_SIZE.sm, color: COLORS.sage, fontWeight: '600', flex: 1 },

  resultCount: { fontSize: FONT_SIZE.sm, color: COLORS.slate, fontWeight: '600', marginBottom: SPACING.md },

  // Therapist Card
  therapistCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  therapistHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  therapistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  therapistHeaderInfo: { flex: 1 },
  therapistName: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText },
  therapistCredentials: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginTop: 2 },

  specRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  specBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.plum + '15',
  },
  specBadgeText: { fontSize: FONT_SIZE.xs, color: COLORS.plum, fontWeight: '600' },

  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: FONT_SIZE.sm, color: COLORS.slate },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.sage + '15',
  },
  typeBadgeText: { fontSize: FONT_SIZE.xs, color: COLORS.sage, fontWeight: '600' },

  therapistBio: { fontSize: FONT_SIZE.sm, color: COLORS.slate, lineHeight: FONT_SIZE.sm * 1.6, marginBottom: SPACING.md },

  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: COLORS.sage,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  callButtonText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.slate, fontWeight: '600', marginTop: SPACING.md },
  emptySubtext: { fontSize: FONT_SIZE.sm, color: COLORS.lightText, marginTop: SPACING.xs },

  // Resources
  resourcesSection: { marginTop: SPACING.xl, borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText, marginBottom: SPACING.md },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  resourceInfo: { flex: 1 },
  resourceName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText },
  resourceDesc: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginTop: 2 },
  resourceHours: { fontSize: FONT_SIZE.xs, color: COLORS.sage, fontWeight: '600', marginTop: 2 },
  resourcePhoneSection: { alignItems: 'center', gap: 4 },
  resourcePhone: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.sage },
});
