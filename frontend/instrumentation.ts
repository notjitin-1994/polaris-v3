/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically called by Next.js when the server starts.
 * It's the perfect place to validate environment variables with fail-fast behavior.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import { validateEnvironmentOrExit } from './lib/utils/environmentValidation';

/**
 * Register function called once when Next.js initializes
 * Validates required environment variables and exits if validation fails
 */
export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('\n🔍 Validating environment variables...\n');

    // Validate environment or exit with detailed error message
    validateEnvironmentOrExit();

    console.log('\n✅ Application startup validation complete\n');
  }
}
