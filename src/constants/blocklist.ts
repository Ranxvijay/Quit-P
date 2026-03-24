/**
 * Content Blocker - Domain Block List
 *
 * These domains are used for:
 * 1. Custom DNS filtering (e.g., AdGuard Home, Pi-hole, NextDNS)
 * 2. VPN-based filtering (react-native VPN service)
 * 3. Exported as hosts file entries
 *
 * The list covers major adult content networks, CDNs, and trackers.
 */

export const BLOCKED_DOMAINS: string[] = [
  // Major adult platforms
  'pornhub.com',
  'xvideos.com',
  'xnxx.com',
  'xhamster.com',
  'redtube.com',
  'youporn.com',
  'tube8.com',
  'spankbang.com',
  'motherless.com',
  'xfantazy.com',
  'rule34.xxx',
  'rule34.paheal.net',
  'gelbooru.com',
  'danbooru.donmai.us',
  'nhentai.net',
  'hentaihaven.xxx',
  'hanime.tv',
  'hentai.tv',
  'tnaflix.com',
  'drtuber.com',
  'beeg.com',
  'porntrex.com',
  'txxx.com',
  'sexvid.xxx',
  'thothub.to',
  'fapello.com',
  'eporner.com',
  'empflix.com',
  'ok.xxx',
  'porndoe.com',
  'sex.com',
  'xxxbunker.com',
  'javhd.com',
  'javmost.com',
  'javbus.com',

  // CDNs and ad networks used by adult sites
  'phncdn.com',
  'xvcdn.com',
  'xhcdn.com',
  'vjav.com',
  'hcdn1.com',

  // Escort / hookup sites
  'onlyfans.com',
  'fansly.com',
  'chaturbate.com',
  'cam4.com',
  'bongacams.com',
  'stripchat.com',
  'livejasmin.com',
  'myfreecams.com',
  'streamate.com',
  'jasmin.com',
  'camsoda.com',

  // Reddit NSFW (can be blocked per-subdomain via DNS)
  'www.reddit.com',       // full block option — user can allow if needed
];

// Family-safe DNS servers the user can configure on their device
export const SAFE_DNS_SERVERS = [
  {
    name: 'CleanBrowsing (Family)',
    ipv4Primary: '185.228.168.168',
    ipv4Secondary: '185.228.169.168',
    ipv6Primary: '2a0d:2a00:1::',
    ipv6Secondary: '2a0d:2a00:2::',
    description: 'Blocks adult content, phishing, and malware',
    dohUrl: 'https://doh.cleanbrowsing.org/doh/family-filter/',
    free: true,
  },
  {
    name: 'OpenDNS FamilyShield',
    ipv4Primary: '208.67.222.123',
    ipv4Secondary: '208.67.220.123',
    ipv6Primary: '2620:119:35::123',
    ipv6Secondary: '2620:119:53::123',
    description: 'Cisco-backed DNS that blocks adult content',
    dohUrl: 'https://doh.familyshield.opendns.com/dns-query',
    free: true,
  },
  {
    name: 'NextDNS (Custom)',
    ipv4Primary: '45.90.28.0',
    ipv4Secondary: '45.90.30.0',
    description: 'Fully customizable — add your own blocklists',
    dohUrl: 'https://dns.nextdns.io',
    free: false,
    freeLimit: '300,000 queries/month',
  },
  {
    name: 'AdGuard DNS (Family)',
    ipv4Primary: '94.140.14.15',
    ipv4Secondary: '94.140.15.16',
    ipv6Primary: '2a10:50c0::bad1:ff',
    ipv6Secondary: '2a10:50c0::bad2:ff',
    description: 'Blocks ads, trackers, and adult content',
    dohUrl: 'https://family.adguard-dns.com/dns-query',
    free: true,
  },
];

// Setup instructions per platform
export const SETUP_INSTRUCTIONS = {
  android: [
    {
      step: 1,
      title: 'Open Wi-Fi Settings',
      detail: 'Go to Settings → Network & Internet → Wi-Fi → (long press your network) → Modify network',
    },
    {
      step: 2,
      title: 'Switch to Static IP',
      detail: 'Change IP settings from DHCP to Static',
    },
    {
      step: 3,
      title: 'Enter DNS Servers',
      detail: 'Set DNS 1 to 185.228.168.168 and DNS 2 to 185.228.169.168 (CleanBrowsing Family)',
    },
    {
      step: 4,
      title: 'Enable Private DNS (Android 9+)',
      detail: 'Go to Settings → Network & Internet → Advanced → Private DNS → Enter: family-filter-dns.cleanbrowsing.org',
    },
    {
      step: 5,
      title: 'Install FreedomPath VPN (Recommended)',
      detail: 'For full blocking including mobile data, use the built-in VPN blocker in this app',
    },
  ],
  ios: [
    {
      step: 1,
      title: 'Open Screen Time',
      detail: 'Go to Settings → Screen Time → Turn On Screen Time',
    },
    {
      step: 2,
      title: 'Set a Passcode',
      detail: 'Tap "Use Screen Time Passcode" — use a code you won\'t remember easily, or have someone else set it',
    },
    {
      step: 3,
      title: 'Content & Privacy Restrictions',
      detail: 'Tap "Content & Privacy Restrictions" → Enable → Web Content → Limit Adult Websites',
    },
    {
      step: 4,
      title: 'Configure DNS (Wi-Fi)',
      detail: 'Go to Settings → Wi-Fi → (your network) → Configure DNS → Manual → Add 185.228.168.168',
    },
    {
      step: 5,
      title: 'Install DNS Profile (Best Option)',
      detail: 'Download and install the CleanBrowsing configuration profile for system-wide DNS filtering on all connections',
    },
  ],
};
