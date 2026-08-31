#!/usr/bin/env node
/**
 * HeroSplit YouTube Agent — Main Entry Point
 *
 * Orchestrates the youtube-automation-agent pipeline using HeroSplit
 * workout data as the content source.  Can be run standalone (CLI) or
 * imported as a module by the HeroSplit Express server.
 *
 * Usage (CLI):
 *   node herosplit-agent.js                          # status check
 *   node herosplit-agent.js --action=generate        # generate content briefs
 *   node herosplit-agent.js --action=script --slug=one-punch-man
 *   node herosplit-agent.js --action=publish --slug=one-punch-man
 *
 * Usage (module):
 *   const { HeroSplitAgent } = require('./youtube-agent/herosplit-agent');
 *   const agent = new HeroSplitAgent();
 *   const script = await agent.generateScript('one-punch-man');
 */

'use strict';

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const channelConfig = require('./config/herosplit-channel.config');
const { getAllContentBriefs, getContentBriefForWorkout } = require('./bridge/workout-to-content');

// ─── Resolve agent path ────────────────────────────────────────────────────────

const AGENT_PATH = channelConfig.agentPath;

function resolveAgentModule(relativePath) {
  const fullPath = path.join(AGENT_PATH, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `youtube-automation-agent module not found at ${fullPath}.\n` +
      `Clone the agent to ${AGENT_PATH} or set AGENT_PATH in your .env file.`
    );
  }
  return require(fullPath);
}

// ─── HeroSplitAgent class ──────────────────────────────────────────────────────

class HeroSplitAgent {
  constructor() {
    this.config = channelConfig;
    this._agentPath = AGENT_PATH;
    this._initialized = false;
    this._db = null;
    this._credentials = null;
    this._scriptWriter = null;
    this._seoOptimizer = null;
    this._contentStrategy = null;
  }

  // ── Initialization ──────────────────────────────────────────────────────────

  /**
   * Initialize the underlying agent modules.
   * Lazily loads from the AGENT_PATH so the HeroSplit server can start
   * even if the agent repo isn't cloned yet.
   */
  async initialize() {
    if (this._initialized) return this;

    this._assertAgentPath();

    // Load agent utilities
    const { DatabaseManager } = resolveAgentModule('database/db-manager.js');
    const { CredentialManager } = resolveAgentModule('utils/credential-manager.js');

    // Load agent classes
    const { ScriptWriterAgent } = resolveAgentModule('agents/script-writer-agent.js');
    const { SEOOptimizerAgent } = resolveAgentModule('agents/seo-optimizer-agent.js');
    const { ContentStrategyAgent } = resolveAgentModule('agents/content-strategy-agent.js');

    // Bootstrap with HeroSplit credentials
    const credPath = path.join(AGENT_PATH, 'config', 'credentials.json');
    this._credentials = new CredentialManager(credPath);

    const dbPath = path.join(AGENT_PATH, 'database', 'herosplit-agent.db');
    this._db = new DatabaseManager(dbPath);
    await this._db.initialize();

    // Merge HeroSplit channel config into the credential manager
    this._credentials.setChannelConfig(this.config.channel);
    this._credentials.setContentConfig(this.config.content);

    this._scriptWriter    = new ScriptWriterAgent(this._db, this._credentials);
    this._seoOptimizer    = new SEOOptimizerAgent(this._db, this._credentials);
    this._contentStrategy = new ContentStrategyAgent(this._db, this._credentials);

    await Promise.all([
      this._scriptWriter.initialize(),
      this._seoOptimizer.initialize(),
      this._contentStrategy.initialize(),
    ]);

    this._initialized = true;
    return this;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Return agent status — works without full initialization.
   * @returns {Object} status object
   */
  getStatus() {
    const agentExists = fs.existsSync(this._agentPath);
    const credExists  = fs.existsSync(path.join(this._agentPath, 'config', 'credentials.json'));

    return {
      agentPath: this._agentPath,
      agentRepoFound: agentExists,
      credentialsConfigured: credExists,
      initialized: this._initialized,
      channelName: this.config.channel.channelName,
      contentPillars: this.config.content.pillars.map((p) => p.id),
      postingFrequency: this.config.content.postingFrequency,
    };
  }

  /**
   * Fetch content briefs for all HeroSplit workouts.
   * @param {'hero'|'villain'|'anime'|undefined} [type]
   * @returns {Promise<import('./bridge/workout-to-content').ContentBrief[]>}
   */
  async getContentBriefs(type) {
    return getAllContentBriefs(type);
  }

  /**
   * Generate a YouTube video script for a given workout slug.
   * @param {string} workoutSlug  e.g. 'one-punch-man'
   * @returns {Promise<Object>} script object from the agent
   */
  async generateScript(workoutSlug) {
    await this.initialize();
    const brief = await getContentBriefForWorkout(workoutSlug);

    const topic = {
      title: brief.titleSeed,
      description: brief.descriptionSeed,
      keyPoints: brief.keyPoints,
      cta: brief.cta,
      tags: brief.hashtags,
      style: brief.pillar === 'villain' ? 'intense' : 'motivational',
      targetLength: 8, // minutes
    };

    const script = await this._scriptWriter.generateScript(topic);
    return { brief, script };
  }

  /**
   * Generate SEO metadata (title variants, description, tags) for a workout.
   * @param {string} workoutSlug
   * @returns {Promise<Object>} metadata object
   */
  async generateSEO(workoutSlug) {
    await this.initialize();
    const brief = await getContentBriefForWorkout(workoutSlug);

    const metadata = await this._seoOptimizer.optimizeMetadata({
      title: brief.titleSeed,
      description: brief.descriptionSeed,
      tags: brief.hashtags,
      pillar: brief.pillar,
    });

    return { brief, metadata };
  }

  /**
   * Get AI-generated content suggestions for what to film next.
   * @param {'hero'|'villain'|'anime'|undefined} [type]
   * @returns {Promise<Object[]>} array of suggestions
   */
  async getSuggestions(type) {
    await this.initialize();
    const briefs = await getAllContentBriefs(type);

    // Let the content strategy agent rank and pick the best opportunities
    const suggestions = await this._contentStrategy.rankContentOpportunities(briefs);
    return suggestions;
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  _assertAgentPath() {
    if (!fs.existsSync(this._agentPath)) {
      throw new Error(
        `youtube-automation-agent not found at: ${this._agentPath}\n\n` +
        `Clone it with:\n` +
        `  git clone https://github.com/darkzOGx/youtube-automation-agent.git ${this._agentPath}\n\n` +
        `Or set AGENT_PATH in your .env file to its location.`
      );
    }
  }
}

// ─── CLI entry point ────────────────────────────────────────────────────────

async function main() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k, v ?? true];
    })
  );

  const action = args.action ?? 'status';
  const agent  = new HeroSplitAgent();

  switch (action) {
    case 'status': {
      console.log('\n📊 HeroSplit YouTube Agent — Status\n');
      console.log(JSON.stringify(agent.getStatus(), null, 2));
      break;
    }

    case 'generate': {
      const type = args.type;
      console.log(`\n📋 Generating content briefs${type ? ` (${type})` : ' (all)'}…\n`);
      const briefs = await agent.getContentBriefs(type);
      console.log(`Generated ${briefs.length} content briefs:\n`);
      briefs.forEach((b, i) => {
        console.log(`  ${i + 1}. [${b.pillar}] ${b.titleSeed} (${b.workoutId})`);
      });
      break;
    }

    case 'script': {
      const slug = args.slug;
      if (!slug) { console.error('Error: --slug is required for script action'); process.exit(1); }
      console.log(`\n✍️  Generating script for "${slug}"…\n`);
      const result = await agent.generateScript(slug);
      console.log('Brief:\n', result.brief);
      console.log('\nScript:\n', result.script);
      break;
    }

    case 'seo': {
      const slug = args.slug;
      if (!slug) { console.error('Error: --slug is required for seo action'); process.exit(1); }
      console.log(`\n🔍 Generating SEO for "${slug}"…\n`);
      const result = await agent.generateSEO(slug);
      console.log(JSON.stringify(result.metadata, null, 2));
      break;
    }

    default:
      console.error(`Unknown action: ${action}. Valid actions: status, generate, script, seo`);
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\n❌ HeroSplit Agent error:\n', err.message);
    process.exit(1);
  });
}

module.exports = { HeroSplitAgent };
