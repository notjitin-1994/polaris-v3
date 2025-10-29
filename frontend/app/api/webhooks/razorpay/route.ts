/**
 * Razorpay Webhook Handler API Route
 *
 * @description Main webhook endpoint for processing Razorpay events
 * @version 1.0.0
 * @date 2025-10-29
 *
 * @endpoint POST /api/webhooks/razorpay
 * @access webhook requests from Razorpay only
 * @rateLimit 100 requests per minute per IP
 *
 * This is the main integration point for all webhook functionality:
 * - Signature verification and security validation
 * - Idempotency checking and duplicate prevention
 * - Event routing to appropriate handlers
 * - Comprehensive logging and error handling
 * - State management and database coordination
 *
 * @see docs/RAZORPAY_INTEGRATION_GUIDE.md
 * @see https://razorpay.com/docs/webhooks/
 */

import { NextResponse } from 'next/server';
import {
  validateWebhookSecurity,
  extractRazorpaySignature,
  parseWebhookEvent,
  type ParsedWebhookEvent
} from '../../../../lib/razorpay/webhookSecurity';
import {
  createWebhookIdempotencyService,
  type WebhookEventRecord
} from '../../../../lib/razorpay/idempotency';
import {
  createWebhookEventRouter,
  type EventHandlerResult,
  type RoutingResult
} from '../../../../lib/razorpay/eventRouter';
import { subscriptionHandlers } from '../../../../lib/razorpay/handlers/subscriptionHandlers';
import { paymentHandlers } from '../../../../lib/razorpay/handlers/paymentHandlers';
import {
  createWebhookStateManager,
  type WebhookProcessingState
} from '../../../../lib/razorpay/webhookStateManagement';
import {
  createWebhookLogger,
  type WebhookLoggingService
} from '../../../../lib/logging/webhookLogging';
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS, createRateLimitHeaders } from '../../../../lib/middleware/rateLimiting';

// Set runtime configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// Service Initialization
// ============================================================================

// Initialize services
const idempotencyService = createWebhookIdempotencyService();
const eventRouter = createWebhookEventRouter();
const stateManager = createWebhookStateManager();
const logger = createWebhookLogger();

// ============================================================================
// Event Handler Registration
// ============================================================================

// Register subscription event handlers
Object.entries(subscriptionHandlers).forEach(([eventType, handler]) => {
  eventRouter.register({
    eventType,
    handler,
    description: `Handle ${eventType}`,
    enabled: true,
    required: ['id', 'status']
  });
});

// Register payment event handlers
Object.entries(paymentHandlers).forEach(([eventType, handler]) => {
  eventRouter.register({
    eventType,
    handler,
    description: `Handle ${eventType}`,
    enabled: true,
    required: ['id', 'status', 'amount', 'currency']
  });
});

// ============================================================================
// Environment Validation
// ============================================================================

/**
 * Validate required environment variables
 */
function validateEnvironment(): { valid: boolean; error?: string } {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return {
      valid: false,
      error: 'RAZORPAY_WEBHOOK_SECRET environment variable is not configured'
    };
  }

  if (webhookSecret.length < 20) {
    return {
      valid: false,
      error: 'Invalid RAZORPAY_WEBHOOK_SECRET format: must be at least 20 characters'
    };
  }

  return { valid: true };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `webhook_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create webhook response
 */
function createWebhookResponse(
  success: boolean,
  message: string,
  statusCode: number = 200,
  additionalData?: Record<string, any>
): Response {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Processed-At': new Date().toISOString()
    }
  });
}

/**
 * Handle processing errors with appropriate logging
 */
async function handleProcessingError(
  error: any,
  context: {
    eventId: string;
    eventType: string;
    requestId: string;
    startTime: number;
  }
): Promise<Response> {
  const duration = Date.now() - context.startTime;
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  logger.logProcessingFailed({
    eventId: context.eventId,
    eventType: context.eventType,
    requestId: context.requestId,
    error: errorMessage,
    retryable: true,
    totalProcessingTime: duration,
    originalError: error instanceof Error ? error : undefined
  });

  return createWebhookResponse(
    false,
    'Webhook processing failed',
    500,
    {
      requestId: context.requestId,
      processingTime: duration,
      error: errorMessage
    }
  );
}

// ============================================================================
// Main Webhook Handler
// ============================================================================

/**
 * POST /api/webhooks/razorpay
 *
 * Main webhook endpoint for processing Razorpay events
 */
export async function POST(request: Request): Promise<Response> {
  const startTime = Date.now();
  const requestId = generateRequestId();

  try {
    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.valid) {
      logger.logProcessingFailed({
        requestId,
        eventId: 'unknown',
        eventType: 'unknown',
        error: envValidation.error!,
        retryable: false,
        totalProcessingTime: Date.now() - startTime
      });

      return createWebhookResponse(
        false,
        'Service configuration error',
        500,
        { requestId }
      );
    }

    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(RATE_LIMIT_CONFIGS.GENERAL_API)(request);

    if (!rateLimitResult.allowed) {
      return createWebhookResponse(
        false,
        'Rate limit exceeded',
        429,
        {
          requestId,
          retryAfter: rateLimitResult.error?.retryAfter || 60
        }
      );
    }

    // Get request body
    const body = await request.text();
    const signature = extractRazorpaySignature(request.headers);

    // Log webhook receipt
    const securityValidation = validateWebhookSecurity(request.headers, body);

    logger.logWebhookReceived({
      eventId: securityValidation.details?.eventId || 'unknown',
      eventType: securityValidation.details?.eventType || 'unknown',
      accountId: securityValidation.details?.eventId || 'unknown',
      requestId,
      signatureValid: securityValidation.valid,
      processingTime: Date.now() - startTime,
      request
    });

    if (!securityValidation.valid) {
      logger.logProcessingFailed({
        eventId: securityValidation.details?.eventId || 'unknown',
        eventType: securityValidation.details?.eventType || 'unknown',
        requestId,
        error: securityValidation.error || 'Security validation failed',
        errorCode: 'SECURITY_VALIDATION_FAILED',
        retryable: false,
        totalProcessingTime: Date.now() - startTime
      });

      return createWebhookResponse(
        false,
        securityValidation.error || 'Webhook security validation failed',
        401,
        { requestId }
      );
    }

    // Parse webhook event
    const parseResult = parseWebhookEvent(body);
    if (!parseResult.valid || !parseResult.event) {
      logger.logProcessingFailed({
        eventId: 'unknown',
        eventType: 'unknown',
        requestId,
        error: parseResult.error || 'Failed to parse webhook event',
        errorCode: 'PARSE_ERROR',
        retryable: false,
        totalProcessingTime: Date.now() - startTime
      });

      return createWebhookResponse(
        false,
        parseResult.error || 'Invalid webhook payload',
        400,
        { requestId }
      );
    }

    const event = parseResult.event;

    // Check idempotency
    const idempotencyCheck = await idempotencyService.checkEventProcessed(event.eventId);
    logger.logIdempotencyCheck({
      eventId: event.eventId,
      eventType: event.eventType,
      requestId,
      isDuplicate: idempotencyCheck.exists,
      existingRecord: idempotencyCheck.details?.existingRecord,
      processingTime: Date.now() - startTime
    });

    if (idempotencyCheck.exists) {
      logger.logBusinessEvent({
        eventId: event.eventId,
        eventType: event.eventType,
        requestId,
        action: 'duplicate_event_skipped',
        details: {
          existingStatus: idempotencyCheck.details?.existingRecord?.processingStatus
        }
      });

      return createWebhookResponse(
        true,
        'Duplicate event acknowledged',
        200,
        {
          requestId,
          eventId: event.eventId,
          status: 'duplicate'
        }
      );
    }

    // Record webhook event
    const recordResult = await idempotencyService.recordEvent(
      event.eventId,
      event.eventType,
      event.accountId,
      JSON.parse(body),
      signature || undefined
    );

    if (!recordResult.success) {
      logger.logProcessingFailed({
        eventId: event.eventId,
        eventType: event.eventType,
        requestId,
        error: recordResult.error || 'Failed to record webhook event',
        errorCode: 'RECORD_ERROR',
        retryable: false,
        totalProcessingTime: Date.now() - startTime
      });

      return createWebhookResponse(
        false,
        'Failed to record webhook event',
        500,
        { requestId }
      );
    }

    // Initialize processing state
    const stateInit = await stateManager.initializeProcessingState(event);
    if (!stateInit.success || !stateInit.state) {
      logger.logProcessingFailed({
        eventId: event.eventId,
        eventType: event.eventType,
        requestId,
        error: stateInit.error || 'Failed to initialize processing state',
        errorCode: 'STATE_INIT_ERROR',
        retryable: true,
        totalProcessingTime: Date.now() - startTime
      });

      return createWebhookResponse(
        false,
        'Failed to initialize processing',
        500,
        { requestId }
      );
    }

    let processingState = stateInit.state;

    // Log processing start
    logger.logProcessingStarted({
      eventId: event.eventId,
      eventType: event.eventType,
      requestId,
      userId: undefined, // Will be determined by handlers
      subscriptionId: event.payload.entity.id?.startsWith('sub_') ? event.payload.entity.id : undefined,
      paymentId: event.payload.entity.id?.startsWith('pay_') ? event.payload.entity.id : undefined
    });

    // Route event to handler
    const routingResult: RoutingResult = await eventRouter.routeEvent(event);

    if (!routingResult.success) {
      // Mark event as failed
      await idempotencyService.markEventFailed(event.eventId, routingResult.error || 'Routing failed');

      logger.logProcessingFailed({
        eventId: event.eventId,
        eventType: event.eventType,
        requestId,
        error: routingResult.error || 'Event routing failed',
        errorCode: 'ROUTING_ERROR',
        retryable: true,
        totalProcessingTime: Date.now() - startTime,
        state: processingState
      });

      return createWebhookResponse(
        false,
        routingResult.error || 'Failed to route event',
        500,
        { requestId }
      );
    }

    // Execute handler with state tracking
    const handlerResult = routingResult.result;
    if (handlerResult) {
      const stateUpdate = await stateManager.executeHandlerWithState(
        event,
        handlerResult,
        processingState
      );

      if (stateUpdate.success && stateUpdate.state) {
        processingState = stateUpdate.state;
      }
    }

    const totalProcessingTime = Date.now() - startTime;

    // Mark event as processed or failed based on handler result
    if (handlerResult?.success && handlerResult?.processed) {
      await idempotencyService.markEventProcessed(
        event.eventId,
        handlerResult.details?.subscriptionId,
        handlerResult.details?.paymentId
      );

      logger.logProcessingCompleted({
        eventId: event.eventId,
        eventType: event.eventType,
        requestId,
        handlerResult: handlerResult!,
        totalProcessingTime,
        state: processingState
      });

      // Log business event
      logger.logBusinessEvent({
        eventId: event.eventId,
        eventType: event.eventType,
        requestId,
        userId: handlerResult.details?.metadata?.userId,
        subscriptionId: handlerResult.details?.subscriptionId,
        paymentId: handlerResult.details?.paymentId,
        action: handlerResult.details?.action || 'webhook_processed',
        details: handlerResult.details?.metadata
      });

      return createWebhookResponse(
        true,
        'Webhook processed successfully',
        200,
        {
          requestId,
          eventId: event.eventId,
          eventType: event.eventType,
          processingTime: totalProcessingTime,
          details: handlerResult.details
        }
      );

    } else {
      const errorMessage = handlerResult?.error || 'Handler execution failed';
      await idempotencyService.markEventFailed(event.eventId, errorMessage);

      logger.logProcessingFailed({
        eventId: event.eventId,
        eventType: event.eventType,
        requestId,
        error: errorMessage,
        errorCode: handlerResult?.details ? 'HANDLER_ERROR' : 'UNKNOWN_ERROR',
        retryable: handlerResult?.retryable ?? true,
        totalProcessingTime,
        state: processingState
      });

      return createWebhookResponse(
        false,
        errorMessage,
        500,
        {
          requestId,
          eventId: event.eventId,
          processingTime: totalProcessingTime,
          retryable: handlerResult?.retryable
        }
      );
    }

  } catch (error) {
    return await handleProcessingError(error, {
      eventId: 'unknown',
      eventType: 'unknown',
      requestId,
      startTime
    });
  }
}

// ============================================================================
// Additional Route Methods
// ============================================================================

/**
 * GET /api/webhooks/razorpay
 *
 * Health check and status endpoint
 */
export async function GET(): Promise<Response> {
  try {
    const routerStats = eventRouter.getStatistics();
    const logStats = logger.getStatistics();

    return createWebhookResponse(
      true,
      'Webhook service is healthy',
      200,
      {
        service: 'razorpay-webhook-handler',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        statistics: {
          router: routerStats,
          logging: {
            totalLogs: logStats.totalLogs,
            errorRate: logStats.errorRate,
            averageProcessingTime: logStats.averageProcessingTime
          }
        }
      }
    );
  } catch (error) {
    return createWebhookResponse(
      false,
      'Health check failed',
      500,
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Handle uncaught errors
 */
export async function handleError(error: unknown): Promise<Response> {
  logger.logProcessingFailed({
    eventId: 'uncaught_error',
    eventType: 'system',
    requestId: generateRequestId(),
    error: error instanceof Error ? error.message : 'Uncaught error',
    errorCode: 'UNCAUGHT_ERROR',
    retryable: false,
    totalProcessingTime: 0
  });

  return createWebhookResponse(
    false,
    'Internal server error',
    500,
    {
      error: 'An unexpected error occurred'
    }
  );
}