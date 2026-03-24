import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Switch,
  Platform,
  Animated,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Card from '@/src/components/Card';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import { SAFE_DNS_SERVERS, SETUP_INSTRUCTIONS, BLOCKED_DOMAINS } from '@/src/constants/blocklist';

type TabKey = 'dns' | 'setup' | 'domains';

const PLATFORM_TABS = [
  { key: 'android' as const, label: 'Android', icon: 'logo-android' },
  { key: 'ios' as const, label: 'iOS', icon: 'logo-apple' },
];

export default function BlockerScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('dns');
  const [platform, setPlatform] = useState<'android' | 'ios'>(
    Platform.OS === 'ios' ? 'ios' : 'android'
  );
  const [copiedDns, setCopiedDns] = useState<string | null>(null);
  const [blockerEnabled, setBlockerEnabled] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    setCopiedDns(label);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopiedDns(null), 2000);
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:SCREEN_TIME');
    } else {
      Linking.openSettings();
    }
  };

  const openNextDNS = () => {
    Alert.alert(
      'NextDNS Setup',
      'NextDNS lets you create a custom DNS profile that blocks adult content across ALL your apps and browser — including private mode.\n\nWe\'ll open nextdns.io for you to create a free account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open NextDNS',
          onPress: () => Linking.openURL('https://nextdns.io'),
        },
      ]
    );
  };

  const openAdGuard = () => {
    Alert.alert(
      'AdGuard DNS Family',
      'AdGuard Family DNS blocks adult content, ads, and malware at the DNS level.\n\nFree and no account required.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Learn More',
          onPress: () => Linking.openURL('https://adguard-dns.io/en/public-dns.html'),
        },
      ]
    );
  };

  const handleBlockerToggle = (val: boolean) => {
    setBlockerEnabled(val);
    if (val) {
      Alert.alert(
        '🛡️ Blocker Enabled',
        'To fully activate system-wide blocking, follow the DNS setup instructions in the "Setup Guide" tab.\n\nThis app cannot bypass iOS/Android security restrictions to automatically configure your DNS — you must do it manually once.',
        [
          { text: 'Show Setup Guide', onPress: () => setActiveTab('setup') },
          { text: 'OK' },
        ]
      );
    }
  };

  const instructions = SETUP_INSTRUCTIONS[platform];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield-checkmark" size={28} color={COLORS.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Content Blocker</Text>
              <Text style={styles.subtitle}>
                Block adult content at the DNS level — works on all apps and browsers
              </Text>
            </View>
          </View>

          {/* Master Toggle */}
          <Card style={styles.toggleCard} variant="bordered">
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.toggleDot, { backgroundColor: blockerEnabled ? COLORS.success : COLORS.danger }]} />
                <View>
                  <Text style={styles.toggleTitle}>
                    {blockerEnabled ? 'Blocking Active' : 'Blocking Inactive'}
                  </Text>
                  <Text style={styles.toggleSub}>
                    {blockerEnabled
                      ? 'DNS filter is configured — you are protected'
                      : 'Follow setup guide to activate'}
                  </Text>
                </View>
              </View>
              <Switch
                value={blockerEnabled}
                onValueChange={handleBlockerToggle}
                trackColor={{ false: COLORS.border, true: COLORS.success + '66' }}
                thumbColor={blockerEnabled ? COLORS.success : COLORS.textMuted}
              />
            </View>
          </Card>

          {/* Tabs */}
          <View style={styles.tabs}>
            {(['dns', 'setup', 'domains'] as TabKey[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => {
                  setActiveTab(tab);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'dns' ? 'DNS Servers' : tab === 'setup' ? 'Setup Guide' : 'Block List'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* DNS Servers Tab */}
          {activeTab === 'dns' && (
            <View>
              <Text style={styles.sectionDesc}>
                Configure one of these free DNS servers on your device to block adult content at the network level. Works in ALL browsers including private mode.
              </Text>
              {SAFE_DNS_SERVERS.map((dns) => (
                <Card key={dns.name} style={styles.dnsCard} variant="bordered">
                  <View style={styles.dnsHeader}>
                    <Text style={styles.dnsName}>{dns.name}</Text>
                    {dns.free && (
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>FREE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.dnsDesc}>{dns.description}</Text>

                  <View style={styles.dnsIps}>
                    {[
                      { label: 'Primary DNS', value: dns.ipv4Primary },
                      { label: 'Secondary DNS', value: dns.ipv4Secondary },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.label}
                        style={styles.dnsIpRow}
                        onPress={() => copyToClipboard(item.value, `${dns.name}-${item.label}`)}
                      >
                        <View>
                          <Text style={styles.dnsIpLabel}>{item.label}</Text>
                          <Text style={styles.dnsIpVal}>{item.value}</Text>
                        </View>
                        <View style={styles.copyBtn}>
                          <Ionicons
                            name={copiedDns === `${dns.name}-${item.label}` ? 'checkmark' : 'copy-outline'}
                            size={16}
                            color={copiedDns === `${dns.name}-${item.label}` ? COLORS.success : COLORS.accent}
                          />
                          <Text style={styles.copyText}>
                            {copiedDns === `${dns.name}-${item.label}` ? 'Copied!' : 'Copy'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {dns.dohUrl && (
                    <TouchableOpacity
                      style={styles.dohRow}
                      onPress={() => copyToClipboard(dns.dohUrl!, `${dns.name}-doh`)}
                    >
                      <Ionicons name="link" size={12} color={COLORS.textMuted} />
                      <Text style={styles.dohUrl} numberOfLines={1}>{dns.dohUrl}</Text>
                      <Ionicons
                        name={copiedDns === `${dns.name}-doh` ? 'checkmark' : 'copy-outline'}
                        size={12}
                        color={copiedDns === `${dns.name}-doh` ? COLORS.success : COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  )}
                </Card>
              ))}

              <TouchableOpacity style={styles.nextdnsBtn} onPress={openNextDNS}>
                <Ionicons name="settings" size={18} color="#fff" />
                <Text style={styles.nextdnsBtnText}>Set Up NextDNS (Most Powerful)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.adguardBtn} onPress={openAdGuard}>
                <Ionicons name="shield" size={18} color={COLORS.accent} />
                <Text style={styles.adguardBtnText}>AdGuard DNS Family Info</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Setup Guide Tab */}
          {activeTab === 'setup' && (
            <View>
              {/* Platform Selector */}
              <View style={styles.platformTabs}>
                {PLATFORM_TABS.map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    style={[styles.platformTab, platform === p.key && styles.platformTabActive]}
                    onPress={() => setPlatform(p.key)}
                  >
                    <Ionicons
                      name={p.icon as any}
                      size={16}
                      color={platform === p.key ? COLORS.accent : COLORS.textMuted}
                    />
                    <Text style={[styles.platformTabText, platform === p.key && { color: COLORS.accent }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionDesc}>
                Follow these steps to activate system-wide DNS blocking on your {platform === 'ios' ? 'iPhone/iPad' : 'Android device'}.
              </Text>

              {instructions.map((step) => (
                <View key={step.step} style={styles.stepCard}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{step.step}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDetail}>{step.detail}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.openSettingsBtn} onPress={openSettings}>
                <Ionicons name="settings-outline" size={18} color="#fff" />
                <Text style={styles.openSettingsBtnText}>Open Device Settings</Text>
              </TouchableOpacity>

              {platform === 'ios' && (
                <Card style={styles.iosProTip}>
                  <Text style={styles.proTipTitle}>💡 Pro Tip for iOS</Text>
                  <Text style={styles.proTipText}>
                    Have a trusted friend set your Screen Time passcode. This prevents you from disabling it during an urge. You can always ask them to unlock it for legitimate reasons.
                  </Text>
                </Card>
              )}

              {platform === 'android' && (
                <Card style={styles.iosProTip}>
                  <Text style={styles.proTipTitle}>💡 Pro Tip for Android</Text>
                  <Text style={styles.proTipText}>
                    Android 9+ supports "Private DNS". Go to Settings → Network & Internet → Advanced → Private DNS → enter: family-filter-dns.cleanbrowsing.org{'\n\n'}This works on ALL networks (Wi-Fi + mobile data) without any app.
                  </Text>
                </Card>
              )}
            </View>
          )}

          {/* Block List Tab */}
          {activeTab === 'domains' && (
            <View>
              <Text style={styles.sectionDesc}>
                These {BLOCKED_DOMAINS.length} domains are blocked by our DNS filter. Use this list for pi-hole, AdGuard Home, or any custom DNS solution.
              </Text>

              <TouchableOpacity
                style={styles.copyAllBtn}
                onPress={() => {
                  const hostsContent = BLOCKED_DOMAINS.map((d) => `0.0.0.0 ${d}`).join('\n');
                  Clipboard.setString(hostsContent);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert('Copied!', 'Hosts file format copied to clipboard. Paste it into your pi-hole or AdGuard Home block list.');
                }}
              >
                <Ionicons name="copy" size={16} color="#fff" />
                <Text style={styles.copyAllBtnText}>Copy as Hosts File</Text>
              </TouchableOpacity>

              <View style={styles.domainList}>
                {BLOCKED_DOMAINS.map((domain) => (
                  <View key={domain} style={styles.domainRow}>
                    <Ionicons name="ban" size={14} color={COLORS.danger} />
                    <Text style={styles.domainText}>{domain}</Text>
                  </View>
                ))}
              </View>

              <Card style={styles.piHoleCard}>
                <Text style={styles.piHoleTitle}>🖥️ Running Pi-hole or AdGuard Home?</Text>
                <Text style={styles.piHoleText}>
                  Copy the hosts file above and add it as a custom blocklist. This will block all listed domains on every device in your home network.
                </Text>
              </Card>
            </View>
          )}

          <View style={{ height: 32 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { padding: SPACING.md },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.success + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.textMuted, lineHeight: 17, marginTop: 2 },

  toggleCard: {
    marginBottom: SPACING.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  toggleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  toggleTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  toggleSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    padding: 3,
    marginBottom: SPACING.lg,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: '#fff',
  },

  sectionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: SPACING.lg,
  },

  // DNS Cards
  dnsCard: {
    marginBottom: SPACING.sm,
  },
  dnsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dnsName: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  freeBadge: {
    backgroundColor: COLORS.success + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  freeBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.success },
  dnsDesc: { fontSize: 12, color: COLORS.textMuted, marginBottom: SPACING.sm },
  dnsIps: { gap: SPACING.xs },
  dnsIpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  dnsIpLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  dnsIpVal: { fontSize: 14, color: COLORS.text, fontWeight: '700', fontVariant: ['tabular-nums'] },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  copyText: { fontSize: 12, color: COLORS.accent, fontWeight: '700' },
  dohRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
  },
  dohUrl: { flex: 1, fontSize: 11, color: COLORS.textMuted },

  nextdnsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#0060FF',
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    marginBottom: SPACING.sm,
  },
  nextdnsBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  adguardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    marginBottom: SPACING.lg,
  },
  adguardBtnText: { color: COLORS.accent, fontWeight: '800', fontSize: 14 },

  // Setup Steps
  platformTabs: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  platformTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  platformTabActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '22',
  },
  platformTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  stepDetail: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },

  openSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  openSettingsBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  iosProTip: {
    backgroundColor: '#1A1000',
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
  },
  proTipTitle: { fontSize: 14, fontWeight: '800', color: COLORS.gold, marginBottom: SPACING.xs },
  proTipText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },

  // Domain list
  copyAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.full,
    paddingVertical: 12,
    marginBottom: SPACING.md,
  },
  copyAllBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  domainList: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 2,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  domainText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
  },

  piHoleCard: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  piHoleTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  piHoleText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
});
