/**
 * Claude API Configuration
 * Secure server-side configuration for Claude Sonnet 4.5 and Sonnet 4
 */

export interface ClaudeConfig {
  primaryModel: string;
  fallbackModel: string;
  apiKey: string;
  baseUrl: string;
  version: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retries: number;
}

/**
 * Get Claude configuration from environment variables
 * CRITICAL: This function must ONLY be called server-side
 * Never expose API keys to the client
 */
export function getClaudeConfig(): ClaudeConfig {
  // Load API key from environment - try multiple sources for compatibility
  const apiKey = (
    process.env.ANTHROPIC_API_KEY ||
    process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ||
    ''
  ).trim();

  // During build time or when API key is not available, return a safe default config
  // The blueprint generation service will handle missing API keys gracefully
  if (!apiKey) {
    return {
      primaryModel: 'claude-sonnet-4-5',
      fallbackModel: 'claude-sonnet-4-20250514',
      apiKey: '',
      baseUrl: 'https://api.anthropic.com',
      version: '2023-06-01',
      maxTokens: 16000,
      temperature: 0.2,
      timeout: 840000,
      retries: 2,
    };
  }

  const baseUrl = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com')
    .trim()
    .replace(/\/$/, '');

  const version = (process.env.ANTHROPIC_VERSION || '2023-06-01').trim();

  return {
    primaryModel: 'claude-sonnet-4-5',
    fallbackModel: 'claude-sonnet-4-20250514',
    apiKey,
    baseUrl,
    version,
    maxTokens: 16000,
    temperature: 0.2,
    timeout: 840000, // 14 minutes - avg generation time is ~13 minutes (779.7s)
    retries: 2,
  };
}

/**
 * Validate that Claude configuration is available
 * Safe to call from client-side (doesn't expose keys)
 */
export function isClaudeConfigured(): boolean {
  try {
    // Only check for presence, don't expose actual value
    return !!(process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY);
  } catch {
    return false;
  }
}
