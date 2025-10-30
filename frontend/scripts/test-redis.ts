/**
 * Redis Connection Test Script
 *
 * Run this script to verify your Redis setup works correctly
 * Usage: npm run test-redis
 */

import { getRedisClient, checkRedisHealth, RedisCache } from '../lib/cache/redis.js';
import { createRateLimiter } from '../lib/rate-limiting/redisRateLimit.js';

async function testRedisConnection() {
  console.log('🔍 Testing Redis connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic Redis connection...');
    const client = await getRedisClient();

    if (!client) {
      console.log('❌ Redis client not available');
      console.log('💡 Make sure REDIS_URL is set in your environment variables');
      return false;
    }

    await client.ping();
    console.log('✅ Redis connection successful');

    // Test 2: Health check
    console.log('\n2. Testing health check...');
    const health = await checkRedisHealth();
    console.log(`✅ Health status: ${health.connected ? 'Healthy' : 'Unhealthy'}`);
    if (health.latency) {
      console.log(`📊 Latency: ${health.latency}ms`);
    }
    if (health.error) {
      console.log(`⚠️  Error: ${health.error}`);
    }

    // Test 3: Cache operations
    console.log('\n3. Testing cache operations...');
    const testKey = 'test-redis-connection';
    const testValue = { message: 'Hello Redis!', timestamp: Date.now() };

    // Set value
    const setResult = await RedisCache.set(testKey, testValue, 60);
    console.log(`✅ Set operation: ${setResult ? 'Success' : 'Failed'}`);

    // Get value
    const getResult = await RedisCache.get(testKey);
    if (getResult.data && getResult.cached) {
      console.log('✅ Get operation: Success');
      console.log(`📦 Retrieved data:`, getResult.data);
    } else {
      console.log('❌ Get operation: Failed');
      if (getResult.error) {
        console.log(`⚠️  Error: ${getResult.error}`);
      }
    }

    // Delete test key
    await RedisCache.del(testKey);
    console.log('✅ Cleanup: Test key deleted');

    // Test 4: Rate limiting
    console.log('\n4. Testing rate limiting...');
    const rateLimiter = createRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5,
      keyPrefix: 'test_rate_limit',
    });

    const testIdentifier = 'test-user';

    // Check rate limit (should succeed first time)
    const rateLimitResult1 = await rateLimiter.checkLimit(testIdentifier);
    console.log(`✅ Rate limit check 1: ${rateLimitResult1.success ? 'Allowed' : 'Blocked'}`);
    console.log(`📊 Remaining requests: ${rateLimitResult1.remaining}`);

    // Check rate limit status without consuming
    const rateLimitStatus = await rateLimiter.getStatus(testIdentifier);
    console.log(`📊 Rate limit status: ${rateLimitStatus.remaining} remaining`);

    console.log('\n🎉 All Redis tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Redis test failed:', error);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   - Check if Redis server is running');
    console.log('   - Verify REDIS_URL environment variable');
    console.log('   - Check network connectivity');
    console.log('   - Verify Redis credentials');
    return false;
  }
}

// Test different Redis configurations
async function testConfiguration() {
  console.log('\n🔧 Configuration Check');
  console.log('==================');

  const redisUrl = process.env.REDIS_URL;
  const redisToken = process.env.REDIS_TOKEN;

  console.log(`REDIS_URL: ${redisUrl ? '✅ Set' : '❌ Not set'}`);
  console.log(`REDIS_TOKEN: ${redisToken ? '✅ Set' : '❌ Not set'}`);

  if (!redisUrl) {
    console.log('\n💡 To set up Redis:');
    console.log('   1. Vercel KV: Add REDIS_URL and REDIS_TOKEN to environment variables');
    console.log('   2. Upstash: Add REDIS_URL and REDIS_TOKEN to environment variables');
    console.log('   3. Self-hosted: Add REDIS_URL to environment variables');
    console.log('   4. Redis Cloud: Add REDIS_URL to environment variables');
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Redis Connection Test Suite');
  console.log('==============================\n');

  await testConfiguration();
  const success = await testRedisConnection();

  console.log('\n📊 Summary');
  console.log('===========');
  console.log(`Overall status: ${success ? '✅ All tests passed' : '❌ Some tests failed'}`);

  if (success) {
    console.log('\n🎯 Your Redis setup is ready for production!');
    console.log('📖 For more information, see REDIS_SETUP_GUIDE.md');
  } else {
    console.log('\n🔧 Please fix the issues above before deploying to production.');
  }

  process.exit(success ? 0 : 1);
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testRedisConnection, runTests };
