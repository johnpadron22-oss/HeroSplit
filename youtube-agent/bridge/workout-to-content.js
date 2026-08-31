/**
 * Workout → YouTube Content Bridge
 *
 * Converts HeroSplit workout records into the content packages that the
 * youtube-automation-agent pipeline expects.  Each workout becomes a
 * structured content brief that the agent's script-writer, SEO-optimizer,
 * and thumbnail-designer agents can act on directly.
 */

'use strict';

const axios = require('axios');
const channelConfig = require('../config/herosplit-channel.config');

// ─── Types (JSDoc) ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Workout
 * @property {number}  id
 * @property {string}  slug
 * @property {string}  name
 * @property {string}  description
 * @property {string}  type           'hero' | 'villain' | 'anime'
 * @property {string}  difficulty     'Beginner' | 'Intermediate' | 'Advanced' | 'Elite Level'
 * @property {Object}  program        Full JSON workout plan
 * @property {string}  [series]       e.g. 'Dragon Ball Z'
 * @property {string}  [workoutStyle] e.g. 'Strength' | 'Calisthenics' | 'HIIT'
 * @property {string}  [equipment]    e.g. 'Bodyweight' | 'Full Gym'
 * @property {boolean} isPro
 */

/**
 * @typedef {Object} ContentBrief
 * @property {string}   workoutId      Source workout slug
 * @property {string}   pillar         Content pillar ('hero' | 'villain' | 'anime')
 * @property {string}   titleSeed      Suggested video title (agent may refine it)
 * @property {string}   descriptionSeed  Opening description / hook
 * @property {string[]} keyPoints      Bullet points the script must cover
 * @property {string}   cta            Call-to-action for end of video
 * @property {string[]} hashtags       Merged channel + workout-specific tags
 * @property {string}   thumbnailStyle Visual style hint for the thumbnail agent
 * @property {string}   difficulty
 * @property {string}   [series]
 * @property {string}   [equipment]
 * @property {string}   [workoutStyle]
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map HeroSplit workout type → channel content pillar */
function resolvePillar(type) {
  const map = { hero: 'hero', villain: 'villain', anime: 'anime', custom: 'hero' };
  return map[type] ?? 'hero';
}

/** Return the pillar config for a given pillar id */
function getPillarConfig(pillarId) {
  return (
    channelConfig.content.pillars.find((p) => p.id === pillarId) ??
    channelConfig.content.pillars[0]
  );
}

/** Derive workout-specific hashtags from the program metadata */
function deriveWorkoutHashtags(workout) {
  const tags = [...channelConfig.content.defaultHashtags];
  if (workout.series) tags.push(`#${workout.series.replace(/\s+/g, '')}`);
  if (workout.workoutStyle) tags.push(`#${workout.workoutStyle}Training`);
  if (workout.type === 'villain') tags.push('#VillainArc', '#DarkTraining');
  if (workout.difficulty === 'Elite Level') tags.push('#EliteTraining', '#HardcoreFitness');
  return [...new Set(tags)];
}

/** Build a human-readable key-points list from the program JSON */
function extractKeyPoints(workout) {
  const points = [];

  const program = workout.program ?? {};
  const phases = Array.isArray(program.phases) ? program.phases : [];
  const weeks = Array.isArray(program.weeks) ? program.weeks : [];
  const exercises = Array.isArray(program.exercises) ? program.exercises : [];

  if (phases.length) {
    points.push(`${phases.length}-phase training structure: ${phases.map((p) => p.name ?? p.label ?? 'Phase').join(', ')}`);
  }

  if (weeks.length) {
    points.push(`${weeks.length}-week program with progressive overload`);
  }

  if (exercises.length) {
    const names = exercises.slice(0, 4).map((e) => e.name ?? e.exercise ?? 'exercise');
    points.push(`Core exercises include: ${names.join(', ')}${exercises.length > 4 ? '…' : ''}`);
  }

  points.push(`Difficulty level: ${workout.difficulty}`);
  if (workout.equipment) points.push(`Equipment needed: ${workout.equipment}`);
  if (workout.series)    points.push(`Inspired by the training shown in ${workout.series}`);

  return points;
}

// ─── Main conversion ──────────────────────────────────────────────────────────

/**
 * Convert a single HeroSplit workout into a YouTube content brief.
 *
 * @param {Workout} workout
 * @returns {ContentBrief}
 */
function workoutToContentBrief(workout) {
  const pillar = resolvePillar(workout.type);
  const pillarCfg = getPillarConfig(pillar);

  const titleSeed = pillarCfg.youtubeAngle.replace('[character]', workout.name);

  const descriptionSeed =
    `${workout.name}: ${workout.description} ` +
    `In this video we break down the complete ${workout.workoutStyle ?? 'training'} program ` +
    `that gets you results — no fluff, just the work.`;

  const cta =
    `Follow the full ${workout.name} program on HeroSplit (link in bio). ` +
    `Like and subscribe for new character workouts every week.`;

  return {
    workoutId: workout.slug,
    pillar,
    titleSeed,
    descriptionSeed,
    keyPoints: extractKeyPoints(workout),
    cta,
    hashtags: deriveWorkoutHashtags(workout),
    thumbnailStyle: pillarCfg.thumbnailStyle,
    difficulty: workout.difficulty,
    series: workout.series ?? null,
    equipment: workout.equipment ?? null,
    workoutStyle: workout.workoutStyle ?? null,
  };
}

// ─── API fetch helpers ────────────────────────────────────────────────────────

/**
 * Fetch all workouts from the live HeroSplit API.
 *
 * @param {'hero'|'villain'|'anime'|undefined} [type]
 * @returns {Promise<Workout[]>}
 */
async function fetchWorkoutsFromApi(type) {
  const { baseUrl, internalSecret } = channelConfig.herosplitApi;
  const url = `${baseUrl}/api/workouts${type ? `?type=${type}` : ''}`;
  const headers = internalSecret ? { 'x-internal-secret': internalSecret } : {};

  const { data } = await axios.get(url, { headers, timeout: 10_000 });
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch all workouts and convert each to a content brief.
 *
 * @param {'hero'|'villain'|'anime'|undefined} [type]
 * @returns {Promise<ContentBrief[]>}
 */
async function getAllContentBriefs(type) {
  const workouts = await fetchWorkoutsFromApi(type);
  return workouts.map(workoutToContentBrief);
}

/**
 * Fetch a single workout by slug and convert it to a content brief.
 *
 * @param {string} slug
 * @returns {Promise<ContentBrief>}
 */
async function getContentBriefForWorkout(slug) {
  const { baseUrl, internalSecret } = channelConfig.herosplitApi;
  const url = `${baseUrl}/api/workouts/${slug}`;
  const headers = internalSecret ? { 'x-internal-secret': internalSecret } : {};

  const { data: workout } = await axios.get(url, { headers, timeout: 10_000 });
  return workoutToContentBrief(workout);
}

module.exports = {
  workoutToContentBrief,
  getAllContentBriefs,
  getContentBriefForWorkout,
};
