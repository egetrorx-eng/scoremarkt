/**
 * Stack Configuration - ScoreMarkt
 * ═══════════════════════════════════════════════════════════════
 * Football prediction market platform using Polymarket integration.
 */

export default {
  // Project tier - fullstack for Supabase integration
  tier: 'fullstack',

  // Module toggles
  modules: {
    sanity: true,      // CMS for match previews and content
    supabase: true,    // Backend for user profiles and tracking
    resend: true,      // Email notifications
    netlify: true,     // Hosting
  },

  // Project metadata
  project: {
    name: 'scoremarkt',
    client: 'ScoreMarkt',
    domain: 'scoremarkt.com',
    description: 'Football prediction markets - Trade on match outcomes with real money',
  },

  // GitHub configuration
  github: {
    username: 'egetrorx-eng',
    repoName: 'scoremarkt',
    isPrivate: true,
  },

  // Regional settings (Global, English default)
  locale: {
    defaultLanguage: 'en',
    supportedLanguages: ['en'],
    formalAddress: false,
  },
};
