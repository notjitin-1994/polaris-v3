/**
 * Dynamic Question Generation Service V2
 * Uses the new PRD-aligned 3-section static questionnaire and enhanced prompts
 */

import { createServiceLogger } from '@/lib/logging';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ClaudeClient } from '@/lib/claude/client';

const logger = createServiceLogger('dynamic-questions');

// LLM Configuration - Claude primary, Perplexity fallback
const LLM_CONFIG = {
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-sonnet-4-5',
    maxTokens: 16000,
    temperature: 0.7,
  },
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY || '',
    model: 'sonar-pro',
    baseUrl: 'https://api.perplexity.ai',
    maxTokens: 16000,
    temperature: 0.7,
  },
  timeout: 840000, // 14 minutes - avg generation time is ~13 minutes (779.7s)
  retries: 2,
} as const;

// Load system prompt from file
function loadSystemPrompt(): string {
  try {
    const systemPromptPath = join(
      process.cwd(),
      'lib',
      'prompts',
      'dynamic-questions-system-v2.txt'
    );
    return readFileSync(systemPromptPath, 'utf-8');
  } catch (error) {
    logger.error('system_prompt.load.failure', 'Failed to load dynamic-questions-system-v2.txt', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to load system prompt file');
  }
}

// Load user prompt template from file
function loadUserPromptTemplate(): string {
  try {
    const userPromptPath = join(process.cwd(), 'lib', 'prompts', 'dynamic-questions-user-v2.txt');
    return readFileSync(userPromptPath, 'utf-8');
  } catch (error) {
    logger.error('user_prompt.load.failure', 'Failed to load dynamic-questions-user-v2.txt', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to load user prompt template file');
  }
}

/**
 * Build user prompt using the new V2 template with 3-section static data
 */
export function buildUserPromptV2(staticAnswers: Record<string, unknown>): string {
  const template = loadUserPromptTemplate();

  // Extract 3-section data
  const section1 = (staticAnswers.section_1_role_experience as Record<string, unknown>) || {};
  const section2 = (staticAnswers.section_2_organization as Record<string, unknown>) || {};
  const section3 = (staticAnswers.section_3_learning_gap as Record<string, unknown>) || {};

  // Helper to format arrays
  const formatArray = (arr: unknown) => {
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.join(', ');
    }
    return 'Not specified';
  };

  // Replace all template variables
  let prompt = template;

  // Section 1: Role & Experience
  prompt = prompt.replace(
    /\{current_role\}/g,
    String(section1.current_role || section1.custom_role || 'Not specified')
  );
  prompt = prompt.replace(/\{years_in_role\}/g, String(section1.years_in_role || 0));
  prompt = prompt.replace(
    /\{previous_roles\}/g,
    String(section1.previous_roles || 'Not specified')
  );
  prompt = prompt.replace(/\{industry_experience\}/g, formatArray(section1.industry_experience));
  prompt = prompt.replace(/\{team_size\}/g, String(section1.team_size || 'Not specified'));
  prompt = prompt.replace(/\{technical_skills\}/g, formatArray(section1.technical_skills));

  // Section 2: Organization
  prompt = prompt.replace(
    /\{organization_name\}/g,
    String(section2.organization_name || 'Not specified')
  );
  prompt = prompt.replace(
    /\{industry_sector\}/g,
    String(section2.industry_sector || 'Not specified')
  );
  prompt = prompt.replace(
    /\{organization_size\}/g,
    String(section2.organization_size || 'Not specified')
  );
  prompt = prompt.replace(/\{geographic_regions\}/g, formatArray(section2.geographic_regions));
  prompt = prompt.replace(
    /\{compliance_requirements\}/g,
    formatArray(section2.compliance_requirements)
  );
  prompt = prompt.replace(
    /\{data_sharing_policies\}/g,
    String(section2.data_sharing_policies || 'Not specified')
  );
  prompt = prompt.replace(/\{security_clearance\}/g, String(section2.security_clearance || 'None'));
  prompt = prompt.replace(
    /\{legal_restrictions\}/g,
    String(section2.legal_restrictions || 'None specified')
  );

  // Section 3: Learning Gap & Audience
  prompt = prompt.replace(
    /\{learning_gap_description\}/g,
    String(section3.learning_gap_description || 'Not specified')
  );
  prompt = prompt.replace(
    /\{total_learners_range\}/g,
    String(section3.total_learners_range || 'Not specified')
  );
  prompt = prompt.replace(
    /\{current_knowledge_level\}/g,
    String(section3.current_knowledge_level || 3)
  );
  prompt = prompt.replace(/\{motivation_factors\}/g, formatArray(section3.motivation_factors));
  prompt = prompt.replace(/\{learning_location\}/g, formatArray(section3.learning_location));
  prompt = prompt.replace(/\{devices_used\}/g, formatArray(section3.devices_used));
  prompt = prompt.replace(
    /\{hours_per_week\}/g,
    String(section3.hours_per_week || 'Not specified')
  );
  prompt = prompt.replace(
    /\{learning_deadline\}/g,
    String(section3.learning_deadline || 'Not specified')
  );

  // Budget available with currency and amount
  const budgetAvailable = (section3.budget_available as Record<string, unknown>) || {};
  const budgetAmount = Number(budgetAvailable.amount) || 0;
  const budgetCurrency = String(budgetAvailable.currency || 'USD');
  prompt = prompt.replace(
    /\{budget_available\}/g,
    budgetAmount > 0 ? `${budgetCurrency} ${budgetAmount.toLocaleString()}` : 'Not specified'
  );

  return prompt;
}

/**
 * Call LLM provider (Claude)
 */
async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const config = LLM_CONFIG.claude;

  if (!config.apiKey) {
    throw new Error('Claude API key not configured');
  }

  const claudeClient = new ClaudeClient();

  try {
    const response = await claudeClient.generate({
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    });

    return ClaudeClient.extractText(response);
  } catch (error) {
    throw error;
  }
}

/**
 * Call LLM provider (Perplexity)
 */
async function callPerplexity(systemPrompt: string, userPrompt: string): Promise<string> {
  const config = LLM_CONFIG.perplexity;

  if (!config.apiKey) {
    throw new Error('Perplexity API key not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LLM_CONFIG.timeout);

  try {
    // Perplexity doesn't support system prompts, so combine them
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: [
          {
            role: 'user',
            content: combinedPrompt,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Perplexity API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Detect if JSON appears truncated and try to close it properly
 */
function repairTruncatedJSON(jsonString: string): string {
  let repaired = jsonString;

  // Count opening and closing brackets
  const openBraces = (repaired.match(/{/g) || []).length;
  const closeBraces = (repaired.match(/}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/]/g) || []).length;

  // If we have unclosed brackets, try to close them
  if (openBraces > closeBraces || openBrackets > closeBrackets) {
    logger.warn(
      'dynamic_questions.json.truncation_detected',
      'JSON appears truncated, attempting to close',
      {
        openBraces,
        closeBraces,
        openBrackets,
        closeBrackets,
        position: repaired.length,
      }
    );

    // Find the last complete structural element
    let lastValidIdx = repaired.length;
    let inString = false;
    let escapeNext = false;

    // Scan backwards to find the last complete element
    for (let i = repaired.length - 1; i >= 0; i--) {
      const char = repaired[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
      }

      if (!inString) {
        // Found a complete object or array element
        if (char === '}' || char === ']') {
          lastValidIdx = i + 1;
          break;
        }
        // Found a complete string value
        if (char === '"') {
          // Check if this is a complete property value (has colon before it)
          let j = i - 1;
          while (j >= 0 && /\s/.test(repaired[j])) j--;
          if (j >= 0 && repaired[j] === ':') {
            lastValidIdx = i + 1;
            break;
          }
        }
      }
    }

    // Truncate to last valid position
    repaired = repaired.substring(0, lastValidIdx);

    // Remove trailing comma if present (but not within strings)
    repaired = repaired.replace(/,\s*$/, '');

    // Recalculate bracket counts after truncation
    const newOpenBrackets = (repaired.match(/\[/g) || []).length;
    const newCloseBrackets = (repaired.match(/]/g) || []).length;
    const newOpenBraces = (repaired.match(/{/g) || []).length;
    const newCloseBraces = (repaired.match(/}/g) || []).length;

    // Close unclosed brackets in the correct order (arrays before objects)
    const bracketDiff = newOpenBrackets - newCloseBrackets;
    const braceDiff = newOpenBraces - newCloseBraces;

    for (let i = 0; i < bracketDiff; i++) {
      repaired += ']';
    }
    for (let i = 0; i < braceDiff; i++) {
      repaired += '}';
    }

    logger.info('dynamic_questions.json.truncation_repaired', 'Truncation repair applied', {
      originalLength: jsonString.length,
      repairedLength: repaired.length,
      removedChars: jsonString.length - lastValidIdx,
      bracketsAdded: bracketDiff + braceDiff,
    });
  }

  return repaired;
}

/**
 * Repair common JSON formatting issues from LLM responses
 */
function repairJSON(jsonString: string): string {
  let repaired = jsonString;

  // First, try to fix truncation issues
  repaired = repairTruncatedJSON(repaired);

  // Fix unescaped quotes in strings (but not in property names)
  // This is a simplified approach - replace unescaped quotes in value positions
  repaired = repaired.replace(/: "([^"]*)"([^,\}\]\s])/g, (match, content, after) => {
    // If there's content after the closing quote without proper delimiter, it's likely malformed
    return `: "${content.replace(/"/g, '\\"')}"${after}`;
  });

  // Fix missing commas between array elements or object properties
  repaired = repaired.replace(/"\s*\n\s*"/g, '",\n"');
  repaired = repaired.replace(/}\s*\n\s*{/g, '},\n{');
  repaired = repaired.replace(/]\s*\n\s*{/g, '],\n{');
  repaired = repaired.replace(/}\s*\n\s*\[/g, '},\n[');

  // Fix trailing commas before closing brackets
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

  // Fix unescaped newlines in strings
  repaired = repaired.replace(/: "([^"]*)\n([^"]*?)"/g, (match, before, after) => {
    return `: "${before}\\n${after}"`;
  });

  // Fix unescaped backslashes
  repaired = repaired.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');

  // Remove any control characters
  repaired = repaired.replace(/[\x00-\x1F\x7F]/g, '');

  return repaired;
}

/**
 * Extract and validate JSON from LLM response with repair attempts
 */
function extractAndValidateJSON(
  content: string,
  attemptRepair: boolean = true
): { sections: unknown[]; metadata: unknown } {
  // Remove markdown code fences if present
  let jsonString = content.trim();
  const fenceMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    jsonString = fenceMatch[1].trim();
  }

  // Remove any leading/trailing text outside JSON
  const startIdx = jsonString.indexOf('{');
  const endIdx = jsonString.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error('No valid JSON object found in response');
  }

  jsonString = jsonString.substring(startIdx, endIdx + 1);

  // Try parsing original first
  let parsed: { sections: unknown[]; metadata: unknown } | null = null;
  let parseError: Error | null = null;

  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    parseError = error as Error;

    if (attemptRepair) {
      logger.warn(
        'dynamic_questions.json.repair_attempt',
        'Initial parse failed, attempting repair',
        {
          error: parseError.message,
          position: parseError.message.match(/position (\d+)/)?.[1],
        }
      );

      // Try repairing the JSON
      try {
        const repairedString = repairJSON(jsonString);
        parsed = JSON.parse(repairedString);

        logger.info(
          'dynamic_questions.json.repair_success',
          'Successfully repaired and parsed JSON',
          {
            originalLength: jsonString.length,
            repairedLength: repairedString.length,
          }
        );
      } catch (repairError) {
        // If repair fails, throw original error with context
        logger.error('dynamic_questions.json.repair_failure', 'JSON repair attempt failed', {
          originalError: parseError.message,
          repairError: repairError instanceof Error ? repairError.message : String(repairError),
          jsonPreview: jsonString.substring(0, 1000),
          errorPosition: parseError.message.match(/position (\d+)/)?.[1],
        });

        throw new Error(`Invalid JSON from LLM (repair failed): ${parseError.message}`);
      }
    } else {
      throw error;
    }
  }

  if (!parsed) {
    throw new Error('Failed to parse JSON response');
  }

  // Validate structure
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error('Response missing sections array');
  }

  if (parsed.sections.length !== 10) {
    logger.warn('dynamic_questions.validation.warning', 'Expected 10 sections in response', {
      receivedCount: parsed.sections.length,
    });
  }

  // Validate and sanitize each section
  for (const section of parsed.sections) {
    if (!section.id || !section.title || !section.questions || !Array.isArray(section.questions)) {
      throw new Error(`Invalid section structure: ${JSON.stringify(section).substring(0, 200)}`);
    }

    // Ensure description is a string
    if (section.description && typeof section.description !== 'string') {
      section.description = String(section.description);
    }

    if (section.questions.length < 5 || section.questions.length > 7) {
      logger.warn('dynamic_questions.validation.warning', 'Section has unexpected question count', {
        sectionId: section.id,
        questionCount: section.questions.length,
      });
    }

    // Validate and sanitize each question
    for (const question of section.questions) {
      if (!question.id || !question.label || !question.type) {
        throw new Error(
          `Invalid question structure in section ${section.id}: ${JSON.stringify(question).substring(0, 200)}`
        );
      }

      // Sanitize string fields to remove control characters
      if (typeof question.label === 'string') {
        question.label = question.label.replace(/[\x00-\x1F\x7F]/g, '').trim();
      }
      if (question.helpText && typeof question.helpText === 'string') {
        question.helpText = question.helpText.replace(/[\x00-\x1F\x7F]/g, '').trim();
      }
      if (question.placeholder && typeof question.placeholder === 'string') {
        question.placeholder = question.placeholder.replace(/[\x00-\x1F\x7F]/g, '').trim();
      }
    }
  }

  return parsed;
}

/**
 * Generate dynamic questions using the new V2 system with Perplexity → OpenAI fallback
 */
export async function generateDynamicQuestionsV2(
  blueprintId: string,
  staticAnswers: Record<string, unknown>
): Promise<{ sections: unknown[]; metadata: unknown }> {
  const startTime = Date.now();

  console.log('\n========================================');
  console.log('⚙️  GENERATION SERVICE: dynamicQuestionGenerationV2');
  console.log('========================================');
  console.log('Blueprint ID:', blueprintId);
  console.log('Timestamp:', new Date().toISOString());

  logger.info(
    'dynamic_questions.generation.start',
    'Starting V2 question generation with Claude → Perplexity fallback',
    {
      blueprintId,
    }
  );

  try {
    // Load prompts
    const systemPrompt = loadSystemPrompt();
    const userPrompt = buildUserPromptV2(staticAnswers);

    console.log('\n📄 Prompts loaded:');
    console.log('- System prompt:', systemPrompt.length, 'characters');
    console.log(
      '- User prompt:',
      userPrompt.length,
      'characters (personalized with static answers)'
    );

    logger.debug('dynamic_questions.prompts.loaded', 'Loaded prompts successfully', {
      blueprintId,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
    });

    let responseContent: string | null = null;
    let usedProvider: 'claude' | 'perplexity' | null = null;

    // Try Claude first (primary provider)
    if (LLM_CONFIG.claude.apiKey) {
      console.log('\n🤖 PRIMARY PROVIDER: Claude');
      console.log('→ Model:', LLM_CONFIG.claude.model);
      console.log('→ Max Tokens:', LLM_CONFIG.claude.maxTokens);
      console.log('→ Temperature:', LLM_CONFIG.claude.temperature);

      for (let attempt = 1; attempt <= LLM_CONFIG.retries + 1; attempt++) {
        try {
          console.log(`\n⏳ Attempt ${attempt}/${LLM_CONFIG.retries + 1}: Calling Claude...`);

          logger.info('dynamic_questions.claude.request', `Calling Claude (attempt ${attempt})`, {
            blueprintId,
            attemptNumber: attempt,
            model: LLM_CONFIG.claude.model,
          });

          responseContent = await callClaude(systemPrompt, userPrompt);
          usedProvider = 'claude';

          console.log('✅ Claude succeeded on attempt', attempt);

          logger.info('dynamic_questions.claude.success', 'Claude generation successful', {
            blueprintId,
            attemptNumber: attempt,
          });

          break; // Success, exit retry loop
        } catch (error) {
          console.error(
            `❌ Attempt ${attempt} failed:`,
            error instanceof Error ? error.message : String(error)
          );

          logger.warn('dynamic_questions.claude.error', `Claude attempt ${attempt} failed`, {
            blueprintId,
            error: error instanceof Error ? error.message : String(error),
            attemptNumber: attempt,
          });

          if (attempt < LLM_CONFIG.retries + 1) {
            const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
            console.log(`⏳ Retrying in ${delay}ms...`);
            logger.debug('dynamic_questions.claude.retry', `Retrying Claude after delay`, {
              blueprintId,
              delay,
            });
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    } else {
      console.log('\n⚠️  Claude API key not configured, skipping to fallback');
      logger.warn(
        'dynamic_questions.claude.skipped',
        'Claude API key not configured, skipping to Perplexity',
        {
          blueprintId,
        }
      );
    }

    // Fallback to Perplexity if Claude failed or unavailable
    if (!responseContent && LLM_CONFIG.perplexity.apiKey) {
      console.log('\n🔄 FALLBACK PROVIDER: Perplexity');
      console.log('→ Model:', LLM_CONFIG.perplexity.model);
      console.log('→ Max Tokens:', LLM_CONFIG.perplexity.maxTokens);
      console.log('→ Temperature:', LLM_CONFIG.perplexity.temperature);

      logger.info('dynamic_questions.perplexity.fallback', 'Falling back to Perplexity', {
        blueprintId,
      });

      for (let attempt = 1; attempt <= LLM_CONFIG.retries + 1; attempt++) {
        try {
          console.log(`\n⏳ Attempt ${attempt}/${LLM_CONFIG.retries + 1}: Calling Perplexity...`);

          logger.info(
            'dynamic_questions.perplexity.request',
            `Calling Perplexity (attempt ${attempt})`,
            {
              blueprintId,
              attemptNumber: attempt,
              model: LLM_CONFIG.perplexity.model,
            }
          );

          responseContent = await callPerplexity(systemPrompt, userPrompt);
          usedProvider = 'perplexity';

          console.log('✅ Perplexity succeeded on attempt', attempt);

          logger.info('dynamic_questions.perplexity.success', 'Perplexity generation successful', {
            blueprintId,
            attemptNumber: attempt,
          });

          break; // Success, exit retry loop
        } catch (error) {
          logger.error(
            'dynamic_questions.perplexity.error',
            `Perplexity attempt ${attempt} failed`,
            {
              blueprintId,
              error: error instanceof Error ? error.message : String(error),
              attemptNumber: attempt,
            }
          );

          if (attempt < LLM_CONFIG.retries + 1) {
            const delay = Math.pow(2, attempt - 1) * 1000;
            logger.debug('dynamic_questions.perplexity.retry', `Retrying Perplexity after delay`, {
              blueprintId,
              delay,
            });
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    } else if (!responseContent) {
      logger.error('dynamic_questions.perplexity.skipped', 'Perplexity API key not configured', {
        blueprintId,
      });
    }

    if (!responseContent) {
      console.error('\n❌ ALL PROVIDERS FAILED');
      console.error('- Claude: Failed or not configured');
      console.error('- Perplexity: Failed or not configured');
      console.log('========================================\n');
      throw new Error('All generation providers failed. Please check API keys and try again.');
    }

    // Extract and validate JSON
    console.log('\n🔍 Parsing and validating response...');
    const result = extractAndValidateJSON(responseContent);
    console.log('✓ Response validated successfully');

    const duration = Date.now() - startTime;
    const resultTyped = result as { sections: unknown[]; metadata: unknown };
    const questionCount = resultTyped.sections.reduce((sum: number, s: unknown) => {
      const sTyped = s as { questions: unknown[] };
      return sum + sTyped.questions.length;
    }, 0);

    console.log('\n✨ GENERATION COMPLETE');
    console.log('→ Provider Used:', usedProvider?.toUpperCase() || 'UNKNOWN');
    console.log('→ Sections Generated:', resultTyped.sections.length);
    console.log('→ Total Questions:', questionCount);
    console.log('→ Duration:', duration + 'ms (' + (duration / 1000).toFixed(2) + 's)');
    console.log('========================================\n');

    logger.info('dynamic_questions.generation.complete', 'Successfully generated questions', {
      blueprintId,
      provider: usedProvider,
      sectionCount: resultTyped.sections.length,
      questionCount,
      duration,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('\n❌ GENERATION SERVICE ERROR');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    console.error('Duration before failure:', duration + 'ms');
    console.log('========================================\n');

    logger.error('dynamic_questions.generation.error', 'Failed to generate questions', {
      blueprintId,
      error: error instanceof Error ? error.message : String(error),
      duration,
    });

    throw error;
  }
}
