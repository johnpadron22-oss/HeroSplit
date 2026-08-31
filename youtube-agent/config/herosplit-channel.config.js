/**
 * HeroSplit YouTube Channel Configuration
 *
 * This config wires the youtube-automation-agent to the HeroSplit brand:
 * hero/villain-themed fitness content, anime references, and character workouts.
 *
 * Copy .env.example to .env and fill in real credentials before running.
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/** Resolve the path to the cloned youtube-automation-agent repo */
const AGENT_PATH =
  process.env.AGENT_PATH ||
  path.resolve(require('os').homedir(), 'Desktop', 'youtube-automation-agent');

const channelConfig = {
  /** Absolute path to the youtube-automation-agent clone */
  agentPath: AGENT_PATH,

  /** YouTube channel identity */
  channel: {
    channelName: 'HeroSplit',
    channelDescription:
      'Train like your favorite heroes and villains. Character-based workout programs, ' +
      'anime fitness breakdowns, and science-backed split routines — no cap.',
    defaultCategory: '17', // Sports
    defaultPrivacy: 'public',
    websiteUrl: process.env.HEROSPLIT_URL || 'https://herosplit.app',
    businessEmail: process.env.HEROSPLIT_EMAIL || '',
  },

  /** Content strategy tuned for HeroSplit's audience */
  content: {
    contentTypes: ['workout-breakdown', 'character-analysis', 'training-program', 'tutorial'],
    targetAudience:
      'Fitness enthusiasts aged 16-30 who love anime, comics, and superhero culture. ' +
      'They want real, effective workouts inspired by fictional characters.',
    postingFrequency: 'daily',
    preferredPostTime: '16:00', // 4 PM — peak fitness content engagement

    /** Pillar content themes (maps to HeroSplit workout types) */
    pillars: [
      {
        id: 'hero',
        label: 'Hero Workouts',
        description: 'Training programs inspired by heroic characters — free tier content.',
        youtubeAngle: 'How to train like [character] — real exercises, real science',
        thumbnailStyle: 'bright-gold',
      },
      {
        id: 'villain',
        label: 'Villain Workouts',
        description: 'Darker, more intense programs — mirrors the Pro tier.',
        youtubeAngle: 'The villain training arc — brutal programs most won't survive',
        thumbnailStyle: 'dark-crimson',
      },
      {
        id: 'anime',
        label: 'Anime Series Breakdowns',
        description: 'Deep dives into training across a full anime series.',
        youtubeAngle: 'Every training arc in [series], ranked and recreated',
        thumbnailStyle: 'gradient-neon',
      },
    ],

    /** SEO/hashtag seeds */
    defaultHashtags: [
      '#HeroSplit',
      '#AnimeWorkout',
      '#FitnessMotivation',
      '#CharacterWorkout',
      '#TrainLikeAnime',
    ],

    /** Competitor channels to learn from (YouTube channel IDs or handles) */
    competitorChannels: [],
  },

  /** AI model preferences — override to use a cheaper model for drafts */
  ai: {
    preferredProvider: process.env.YOUTUBE_AGENT_AI_PROVIDER || 'openai',
    scriptModel: process.env.YOUTUBE_AGENT_SCRIPT_MODEL || 'gpt-4o',
    seoModel: process.env.YOUTUBE_AGENT_SEO_MODEL || 'gpt-4o-mini',
  },

  /** HeroSplit API base URL — used by the bridge to fetch live workout data */
  herosplitApi: {
    baseUrl: process.env.HEROSPLIT_API_URL || 'http://localhost:5000',
    internalSecret: process.env.INTERNAL_API_SECRET || '',
  },
};

module.exports = channelConfig;
