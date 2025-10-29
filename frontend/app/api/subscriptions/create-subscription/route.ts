/**
 * Create Subscription API Route
 *
 * @description API endpoint for creating Razorpay subscriptions with comprehensive validation,
 * authentication, duplicate prevention, and error handling
 *
 * @version 1.0.0
 * @date 2025-10-29
 *
 * @endpoint POST /api/subscriptions/create-subscription
 * @access authenticated users
 */

import { NextResponse } from 'next/server';
import {
  CreateSubscriptionRequestSchema,
  CreateSubscriptionResponseSchema,
  ErrorResponseSchema,
  validateCreateSubscriptionRequest,
  type CreateSubscriptionRequest,
} from '@/lib/schemas/razorpaySubscription';
import { getSupabaseServerClient, getServerSession } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import { getPlanId, getPlanPrice } from '@/lib/config/razorpayPlans';
import { razorpayClient, isTestMode } from '@/lib/razorpay/client';
import { createRateLimiter } from '@/lib/rate-limiting/redisRateLimit';
import { addApiSecurityHeaders } from '@/lib/security/securityHeaders';

// Set runtime configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Production-ready rate limiting using Redis or fallback to in-memory
 */
const rateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute in milliseconds
  maxRequests: 10, // 10 requests per minute per IP
  keyPrefix: 'subscription_api',
});

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Structured error response utility
 */
function createErrorResponse(
  code: string,
  message: string,
  status: number,
  requestId: string,
  details?: any
): NextResponse {
  const errorResponse = {
    success: false,
    error: { code, message, details },
    requestId,
    timestamp: new Date().toISOString(),
  };

  const response = NextResponse.json(errorResponse, { status });
  return addApiSecurityHeaders(response);
}

/**
 * Structured success response utility
 */
function createSuccessResponse(data: any, requestId: string): NextResponse {
  const response = NextResponse.json({
    success: true,
    data,
    requestId,
    timestamp: new Date().toISOString(),
  });

  return addApiSecurityHeaders(response);
}

/**
 * Main POST handler for subscription creation
 */
export async function POST(request: Request): Promise<Response> {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    // Extract client IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting check using Redis-based rate limiter
    const rateLimitResult = await rateLimiter.checkLimit(ip);
    if (!rateLimitResult.success) {
      console.warn(`[Razorpay] Rate limit exceeded for IP: ${ip}`, {
        requestId,
        ip,
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
        retryAfter: rateLimitResult.retryAfter,
      });

      const response = createErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please try again later.',
        429,
        requestId,
        {
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime.getTime(),
          windowMs: 60 * 1000,
          retryAfter: rateLimitResult.retryAfter,
        }
      );

      // Add rate limit headers to response
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil(rateLimitResult.resetTime.getTime() / 1000).toString()
      );
      if (rateLimitResult.retryAfter) {
        response.headers.set(
          'Retry-After',
          Math.ceil(rateLimitResult.retryAfter / 1000).toString()
        );
      }

      return response;
    }

    // Parse request body
    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error('[Razorpay] Invalid JSON body', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return createErrorResponse('INVALID_JSON', 'Invalid JSON in request body', 400, requestId);
    }

    // Validate request body using Zod schema
    const validationResult = validateCreateSubscriptionRequest(requestBody);
    if (!validationResult.success) {
      console.error('[Razorpay] Validation failed', {
        requestId,
        errors: validationResult.error.flatten(),
        body: requestBody,
      });

      return createErrorResponse('VALIDATION_ERROR', 'Invalid request parameters', 400, requestId, {
        validationErrors: validationResult.error.flatten(),
      });
    }

    const { tier, billingCycle, seats, customerInfo, metadata } = validationResult.data;

    // Additional validation for seats based on tier
    const isTeamTier = ['crew', 'fleet', 'armada'].includes(tier);
    if (isTeamTier && !seats) {
      console.error('[Razorpay] Validation failed - seats required for team tier', {
        requestId,
        tier,
        isTeamTier,
      });

      return createErrorResponse(
        'VALIDATION_ERROR',
        `Seats are required for ${tier} tier. Please specify the number of seats.`,
        400,
        requestId,
        {
          tier,
          isTeamTier,
          validationRule: 'team_tiers_require_seats',
        }
      );
    }

    if (!isTeamTier && seats) {
      console.error('[Razorpay] Validation failed - seats not allowed for individual tier', {
        requestId,
        tier,
        seats,
        isTeamTier,
      });

      return createErrorResponse(
        'VALIDATION_ERROR',
        `Seats are not allowed for ${tier} tier. Individual tiers do not require seat configuration.`,
        400,
        requestId,
        {
          tier,
          seats,
          isTeamTier,
          validationRule: 'individual_tiers_no_seats',
        }
      );
    }

    // Authentication check
    const sessionResult = await getServerSession();
    if (!sessionResult.session || !sessionResult.session.user) {
      console.error('[Razorpay] Authentication failed', {
        requestId,
        hasSession: !!sessionResult.session,
        hasUser: !!sessionResult.session?.user,
      });

      return createErrorResponse(
        'UNAUTHORIZED',
        'Authentication required. Please sign in to create a subscription.',
        401,
        requestId
      );
    }

    const user = sessionResult.session.user;
    const userId = user.id;

    // Initialize Supabase client
    const supabase = await getSupabaseServerClient();

    // Get user profile for additional context
    let { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('subscription_tier, full_name')
      .eq('user_id', userId)
      .single();

    // Create user profile if it doesn't exist
    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create one
      console.log('[Razorpay] Creating user profile for new user', {
        requestId,
        userId,
      });

      const { data: newUserProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          subscription_tier: 'explorer', // Default free tier
          user_role: 'explorer',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          blueprint_creation_count: 0,
          blueprint_saving_count: 0,
          blueprint_creation_limit: 2, // Free tier limits
          blueprint_saving_limit: 2,
        })
        .select('subscription_tier, full_name')
        .single();

      if (createError) {
        console.error('[Razorpay] Failed to create user profile', {
          requestId,
          userId,
          error: createError,
        });

        return createErrorResponse(
          'PROFILE_CREATE_ERROR',
          'Failed to create user profile',
          500,
          requestId,
          { originalError: createError.message }
        );
      }

      console.log('[Razorpay] User profile created successfully', {
        requestId,
        userId,
        profile: newUserProfile,
      });

      userProfile = newUserProfile;
    } else if (profileError) {
      // Other profile error
      console.error('[Razorpay] Failed to fetch user profile', {
        requestId,
        userId,
        error: profileError,
      });

      return createErrorResponse(
        'PROFILE_ERROR',
        'Failed to retrieve user profile',
        500,
        requestId,
        { originalError: profileError.message }
      );
    }

    // Get plan configuration
    const planId = getPlanId(tier, billingCycle);
    if (!planId) {
      console.error('[Razorpay] Plan not configured', {
        requestId,
        tier,
        billingCycle,
      });

      return createErrorResponse(
        'PLAN_NOT_CONFIGURED',
        `Plan not configured for ${tier} tier with ${billingCycle} billing`,
        400,
        requestId,
        { tier, billingCycle }
      );
    }

    const planPrice = getPlanPrice(tier, billingCycle);
    const planAmount = seats ? planPrice * seats : planPrice; // Multiply for team tiers

    // Check for existing active subscriptions (duplicate prevention)
    console.log('[Razorpay] Checking for existing subscriptions', {
      requestId,
      userId,
    });

    const { data: existingSubscriptions, error: subscriptionCheckError } = await supabase
      .from('subscriptions')
      .select(
        `
        subscription_id,
        razorpay_subscription_id,
        status,
        subscription_tier,
        plan_name,
        next_billing_date,
        created_at,
        updated_at
      `
      )
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (subscriptionCheckError) {
      console.error('[Razorpay] Failed to check existing subscriptions', {
        requestId,
        userId,
        error: subscriptionCheckError,
      });

      return createErrorResponse(
        'SUBSCRIPTION_CHECK_ERROR',
        'Failed to verify existing subscriptions',
        500,
        requestId,
        { originalError: subscriptionCheckError.message }
      );
    }

    // Handle duplicate subscription prevention
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      const activeSubscription = existingSubscriptions[0];

      console.warn('[Razorpay] Duplicate subscription attempt detected', {
        requestId,
        userId,
        existingSubscription: {
          id: activeSubscription.subscription_id,
          status: activeSubscription.status,
          tier: activeSubscription.subscription_tier,
          nextBilling: activeSubscription.next_billing_date,
        },
        newRequest: {
          tier,
          billingCycle,
        },
      });

      // Allow upgrade to higher tier but prevent duplicate same tier
      const tierHierarchy = {
        free: 0,
        explorer: 1,
        navigator: 2,
        voyager: 3,
        crew: 4,
        fleet: 5,
        armada: 6,
      };

      const currentTierLevel =
        tierHierarchy[activeSubscription.subscription_tier as keyof typeof tierHierarchy] || 0;
      const requestedTierLevel = tierHierarchy[tier] || 0;

      if (requestedTierLevel <= currentTierLevel) {
        // Same tier or downgrade - prevent duplicate
        return createErrorResponse(
          'DUPLICATE_SUBSCRIPTION',
          `You already have an active ${activeSubscription.subscription_tier} subscription. ${requestedTierLevel === currentTierLevel ? 'Cannot create duplicate subscription.' : 'Please select a higher tier to upgrade.'}`,
          400,
          requestId,
          {
            currentSubscription: {
              tier: activeSubscription.subscription_tier,
              status: activeSubscription.status,
              planName: activeSubscription.plan_name,
              nextBillingDate: activeSubscription.next_billing_date,
            },
            requestedTier: tier,
            isUpgradeAttempt: requestedTierLevel <= currentTierLevel,
          }
        );
      } else {
        // Higher tier - allow upgrade but log it
        console.log('[Razorpay] Upgrade attempt detected', {
          requestId,
          userId,
          fromTier: activeSubscription.subscription_tier,
          toTier: tier,
          currentStatus: activeSubscription.status,
        });
      }
    }

    console.log('[Razorpay] Subscription creation request validated', {
      requestId,
      userId: user.id,
      email: user.email,
      tier,
      billingCycle,
      seats,
      planId,
      planAmount,
      existingSubscriptionsCount: existingSubscriptions?.length || 0,
      processingTime: Date.now() - startTime,
    });

    // Create or retrieve Razorpay customer
    console.log('[Razorpay] Creating/retrieving Razorpay customer', {
      requestId,
      userId,
      email: user.email,
      customerInfo,
    });

    let razorpayCustomer;
    try {
      // First try to find existing customer by email
      if (user.email) {
        const existingCustomers = await razorpayClient.customers.all({
          email: user.email,
          limit: 1,
        });

        if (existingCustomers.items.length > 0) {
          razorpayCustomer = existingCustomers.items[0];
          console.log('[Razorpay] Found existing customer', {
            requestId,
            customerId: razorpayCustomer.id,
            customerEmail: razorpayCustomer.email,
          });
        }
      }

      // Create new customer if not found
      if (!razorpayCustomer) {
        const customerData: any = {
          name: customerInfo?.name || userProfile?.full_name || user.email?.split('@')[0] || 'User',
          email: customerInfo?.email || user.email || `${userId}@polaris.app`,
          contact: customerInfo?.contact || undefined,
          notes: {
            user_id: userId,
            source: 'polaris_v3',
            created_at: new Date().toISOString(),
            ...(metadata && { user_metadata: JSON.stringify(metadata) }),
          },
        };

        razorpayCustomer = await razorpayClient.customers.create(customerData);
        console.log('[Razorpay] Created new customer', {
          requestId,
          customerId: razorpayCustomer.id,
          customerName: razorpayCustomer.name,
          customerEmail: razorpayCustomer.email,
        });
      }
    } catch (razorpayError: any) {
      console.error('[Razorpay] Customer creation/retrieval failed', {
        requestId,
        userId,
        email: user.email,
        error: razorpayError,
        errorCode: razorpayError.error?.code,
        errorMessage: razorpayError.error?.description,
      });

      return createErrorResponse(
        'RAZORPAY_CUSTOMER_ERROR',
        'Failed to create or retrieve customer in Razorpay',
        500,
        requestId,
        {
          originalError: razorpayError.error?.description || razorpayError.message,
          errorCode: razorpayError.error?.code,
        }
      );
    }

    // Create Razorpay subscription
    console.log('[Razorpay] Creating Razorpay subscription', {
      requestId,
      customerId: razorpayCustomer.id,
      planId,
      planAmount,
      tier,
      billingCycle,
      seats,
    });

    let razorpaySubscription;
    try {
      const subscriptionData: any = {
        plan_id: planId,
        customer_id: razorpayCustomer.id,
        total_count: billingCycle === 'monthly' ? 12 : 1, // 12 months or 1 year
        start_at: Math.floor(Date.now() / 1000) + 3600, // Start in 1 hour
        customer_notify: 1, // Send email notification to customer
        notes: {
          user_id: userId,
          subscription_tier: tier,
          billing_cycle: billingCycle,
          seats: seats?.toString() || '1',
          source: 'polaris_v3_subscription',
          created_at: new Date().toISOString(),
          ...(metadata && { subscription_metadata: JSON.stringify(metadata) }),
        },
      };

      // Add callback URL for production
      if (!isTestMode()) {
        // TODO: Configure webhook URL in production
        // subscriptionData.callback_url = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/razorpay`;
      }

      razorpaySubscription = await razorpayClient.subscriptions.create(subscriptionData);
      console.log('[Razorpay] Subscription created successfully', {
        requestId,
        subscriptionId: razorpaySubscription.id,
        customerId: razorpayCustomer.id,
        status: razorpaySubscription.status,
        shortUrl: razorpaySubscription.short_url,
        currentStart: razorpaySubscription.current_start,
        currentEnd: razorpaySubscription.current_end,
      });
    } catch (razorpayError: any) {
      console.error('[Razorpay] Subscription creation failed', {
        requestId,
        customerId: razorpayCustomer.id,
        planId,
        error: razorpayError,
        errorCode: razorpayError.error?.code,
        errorMessage: razorpayError.error?.description,
      });

      return createErrorResponse(
        'RAZORPAY_SUBSCRIPTION_ERROR',
        'Failed to create subscription in Razorpay',
        500,
        requestId,
        {
          originalError: razorpayError.error?.description || razorpayError.message,
          errorCode: razorpayError.error?.code,
          planId,
          customerId: razorpayCustomer.id,
        }
      );
    }

    // Store subscription in database
    console.log('[Razorpay] Storing subscription in database', {
      requestId,
      razorpaySubscriptionId: razorpaySubscription.id,
      userId,
      customerId: razorpayCustomer.id,
    });

    try {
      const subscriptionData = {
        user_id: userId,
        razorpay_subscription_id: razorpaySubscription.id,
        razorpay_plan_id: planId,
        razorpay_customer_id: razorpayCustomer.id,
        status: razorpaySubscription.status,
        plan_name: razorpaySubscription.plan?.name || `${tier} (${billingCycle})`,
        plan_amount: razorpaySubscription.plan?.amount || planAmount,
        plan_currency: razorpaySubscription.plan?.currency || 'INR',
        plan_period: billingCycle,
        plan_interval: billingCycle === 'monthly' ? 1 : 12, // 1 month or 12 months
        subscription_tier: tier,
        start_date: razorpaySubscription.current_start
          ? new Date(razorpaySubscription.current_start * 1000).toISOString()
          : null,
        end_date: razorpaySubscription.current_end
          ? new Date(razorpaySubscription.current_end * 1000).toISOString()
          : null,
        current_start: razorpaySubscription.current_start
          ? new Date(razorpaySubscription.current_start * 1000).toISOString()
          : null,
        current_end: razorpaySubscription.current_end
          ? new Date(razorpaySubscription.current_end * 1000).toISOString()
          : null,
        next_billing_date: razorpaySubscription.current_end
          ? new Date(razorpaySubscription.current_end * 1000).toISOString()
          : null,
        charge_at: razorpaySubscription.charge_at
          ? new Date(razorpaySubscription.charge_at * 1000).toISOString()
          : null,
        total_count: razorpaySubscription.total_count || (billingCycle === 'monthly' ? 12 : 1),
        paid_count: razorpaySubscription.paid_count || 0,
        remaining_count:
          razorpaySubscription.remaining_count || (billingCycle === 'monthly' ? 12 : 1),
        short_url: razorpaySubscription.short_url,
        metadata: {
          billing_cycle: billingCycle,
          seats: seats?.toString() || '1',
          plan_price_per_seat: planPrice.toString(),
          customer_info: customerInfo,
          user_metadata: metadata,
          created_via_api: 'create-subscription',
          api_request_id: requestId,
        },
      };

      const { data: insertedSubscription, error: insertError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (insertError) {
        console.error('[Razorpay] Failed to store subscription in database', {
          requestId,
          razorpaySubscriptionId: razorpaySubscription.id,
          userId,
          error: insertError,
          errorCode: insertError.code,
          errorMessage: insertError.message,
          details: insertError.details,
        });

        // If database insertion fails, we should attempt to cancel the Razorpay subscription
        try {
          await razorpayClient.subscriptions.cancel(razorpaySubscription.id);
          console.log('[Razorpay] Cancelled subscription due to database error', {
            requestId,
            subscriptionId: razorpaySubscription.id,
          });
        } catch (cancelError: any) {
          console.error('[Razorpay] Failed to cancel subscription after database error', {
            requestId,
            subscriptionId: razorpaySubscription.id,
            cancelError: cancelError.error?.description || cancelError.message,
          });
        }

        return createErrorResponse(
          'DATABASE_ERROR',
          'Failed to store subscription in database. Razorpay subscription has been cancelled.',
          500,
          requestId,
          {
            originalError: insertError.message,
            errorCode: insertError.code,
            details: insertError.details,
            razorpaySubscriptionId: razorpaySubscription.id,
            subscriptionCancelled: true,
          }
        );
      }

      console.log('[Razorpay] Subscription stored successfully in database', {
        requestId,
        databaseSubscriptionId: insertedSubscription.subscription_id,
        razorpaySubscriptionId: razorpaySubscription.id,
        userId,
        status: insertedSubscription.status,
      });
    } catch (databaseError: any) {
      console.error('[Razorpay] Unexpected database error', {
        requestId,
        razorpaySubscriptionId: razorpaySubscription.id,
        userId,
        error: databaseError,
      });

      // Attempt to cancel Razorpay subscription on unexpected database error
      try {
        await razorpayClient.subscriptions.cancel(razorpaySubscription.id);
        console.log('[Razorpay] Cancelled subscription due to unexpected database error', {
          requestId,
          subscriptionId: razorpaySubscription.id,
        });
      } catch (cancelError: any) {
        console.error('[Razorpay] Failed to cancel subscription after unexpected database error', {
          requestId,
          subscriptionId: razorpaySubscription.id,
          cancelError: cancelError.error?.description || cancelError.message,
        });
      }

      return createErrorResponse(
        'UNEXPECTED_DATABASE_ERROR',
        'Unexpected error occurred while storing subscription. Razorpay subscription has been cancelled.',
        500,
        requestId,
        {
          originalError: databaseError.message || 'Unknown error',
          razorpaySubscriptionId: razorpaySubscription.id,
          subscriptionCancelled: true,
        }
      );
    }

    return createSuccessResponse(
      {
        message: 'Subscription created successfully',
        subscription: {
          subscriptionId: razorpaySubscription.id,
          customerId: razorpayCustomer.id,
          shortUrl: razorpaySubscription.short_url,
          status: razorpaySubscription.status,
          planName: razorpaySubscription.plan?.name || `${tier} (${billingCycle})`,
          planAmount: razorpaySubscription.plan?.amount || planAmount,
          planCurrency: razorpaySubscription.plan?.currency || 'INR',
          billingCycle,
          nextBillingDate: razorpaySubscription.current_end
            ? new Date(razorpaySubscription.current_end * 1000).toISOString()
            : null,
          currentStart: razorpaySubscription.current_start
            ? new Date(razorpaySubscription.current_start * 1000).toISOString()
            : null,
          tier,
          seats,
          customerName: razorpayCustomer.name,
          customerEmail: razorpayCustomer.email,
        },
      },
      requestId
    );
  } catch (error: unknown) {
    console.error('[Razorpay] Unexpected error in subscription creation', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: Date.now() - startTime,
    });

    return createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred while processing your request',
      500,
      requestId,
      {
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }
    );
  }
}

/**
 * GET handler (not supported - only POST allowed)
 */
export async function GET(): Promise<Response> {
  const response = NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed for this endpoint',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 405 }
  );

  return addApiSecurityHeaders(response);
}
