# API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the SmartSlate Dynamic Questionnaire System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via Supabase. The authentication token is automatically handled by the Supabase client via cookies.

### Authentication Error Responses

All protected endpoints may return:

- `401 Unauthorized` - No valid authentication token
- `403 Forbidden` - Valid token but insufficient permissions

---

## Dynamic Questions API

### Generate Dynamic Questions

**POST** `/api/generate-dynamic-questions`

Generates a dynamic questionnaire based on static answers using Perplexity AI (with Ollama fallback).

#### Request Body

```typescript
{
  "blueprintId": "uuid",           // Required
  "staticAnswers": {               // Required
    "learningObjective": "string",
    "targetAudience": "string",
    "deliveryMethod": "string",
    "duration": "string",
    "assessmentType": "string"
  },
  "userPrompts": ["string"]        // Optional
}
```

#### Response (200 OK)

```typescript
{
  "success": true,
  "sections": [
    {
      "id": "s1",
      "title": "string",
      "description": "string",
      "order": 1,
      "questions": [
        {
          "id": "q1_s1",
          "label": "string",
          "type": "text|textarea|select|radio_pills|...",
          "required": boolean,
          "helpText": "string",
          "placeholder": "string",
          "options": [{"value": "string", "label": "string"}],
          "metadata": {}
        }
      ]
    }
  ],
  "metadata": {
    "generatedAt": "ISO timestamp",
    "model": "sonar-pro|ollama",
    "fallbackUsed": boolean
  }
}
```

#### Error Responses

- `400 Bad Request` - Invalid request body or missing required fields
- `404 Not Found` - Blueprint not found
- `500 Internal Server Error` - Generation failed

---

### Get Dynamic Questions

**GET** `/api/dynamic-questions/:blueprintId`

Retrieves generated dynamic questions and existing answers for a blueprint.

#### URL Parameters

- `blueprintId` (uuid, required) - The blueprint ID

#### Response (200 OK)

```typescript
{
  "questions": {
    "sections": [...],  // Dynamic questions schema
    "metadata": {}
  },
  "answers": {
    "s1_q1": "answer value",
    ...
  },
  "status": "generating|answering|completed"
}
```

#### Error Responses

- `400 Bad Request` - Invalid blueprint ID format
- `404 Not Found` - Blueprint not found or no questions generated
- `401 Unauthorized` - Not authenticated

---

## Dynamic Answers API

### Save Answers (Auto-save)

**POST** `/api/dynamic-answers/save`

Auto-saves partial answers without validation. Used for debounced auto-save functionality.

#### Request Body

```typescript
{
  "blueprintId": "uuid",           // Required
  "answers": {                     // Required
    "s1_q1": "any value",
    "s2_q3": "any value"
  },
  "sectionId": "string"            // Optional - tracks current section
}
```

#### Response (200 OK)

```typescript
{
  "success": true,
  "saved": {
    "answersCount": number,
    "timestamp": "ISO timestamp"
  }
}
```

#### Error Responses

- `400 Bad Request` - Invalid request body
- `404 Not Found` - Blueprint not found
- `401 Unauthorized` - Not authenticated

---

### Submit Answers (Final)

**POST** `/api/dynamic-answers/submit`

Submits complete answers with validation and triggers blueprint generation.

#### Request Body

```typescript
{
  "blueprintId": "uuid",           // Required
  "answers": {                     // Required, must pass validation
    "s1_q1": "value",
    "s1_q2": "value"
    // ... all required answers
  }
}
```

#### Response (200 OK)

```typescript
{
  "success": true,
  "blueprintId": "uuid",
  "status": "generating",
  "submitted": {
    "timestamp": "ISO timestamp",
    "answerCount": number
  }
}
```

#### Error Responses

- `400 Bad Request` - Validation failed or incomplete answers
- `404 Not Found` - Blueprint not found or no dynamic questions
- `401 Unauthorized` - Not authenticated

---

## Blueprint API

### Generate Blueprint

**POST** `/api/blueprints/generate`

Generates a learning blueprint using Claude AI based on static and dynamic answers.

#### Request Body

```typescript
{
  "blueprintId": "uuid"            // Required
}
```

#### Response (200 OK)

```typescript
{
  "success": true,
  "blueprintId": "uuid",
  "metadata": {
    "model": "claude-sonnet-4|claude-opus-4|ollama",
    "duration": number,              // milliseconds
    "timestamp": "ISO timestamp",
    "fallbackUsed": boolean
  }
}
```

#### Error Responses

- `400 Bad Request` - Missing blueprintId or incomplete answers
- `404 Not Found` - Blueprint not found
- `500 Internal Server Error` - Generation failed

---

### Get Blueprint Status

**GET** `/api/blueprints/:id/status`

Checks the status of blueprint generation.

#### URL Parameters

- `id` (uuid, required) - Blueprint ID

#### Response (200 OK)

```typescript
{
  "status": "generating|completed|error",
  "progress": number,                // 0-100
  "message": "string",               // Status message
  "completedAt": "ISO timestamp"     // If completed
}
```

---

### Get Blueprint

**GET** `/api/blueprint/:id`

Retrieves the generated blueprint content.

#### URL Parameters

- `id` (uuid, required) - Blueprint ID

#### Response (200 OK)

```typescript
{
  "blueprint": {
    "metadata": {
      "title": "string",
      "organization": "string",
      "generated_at": "ISO timestamp"
    },
    "executive_summary": {...},
    "learning_objectives": {...},
    "target_audience": {...},
    "instructional_strategy": {...},
    "content_outline": {...},
    "resources": {...},
    "assessment_strategy": {...},
    "implementation_timeline": {...},
    // ... other sections
  },
  "markdown": "string"               // Markdown version
}
```

---

## Logging API

### Get Logs (Admin)

**GET** `/api/logs`

Retrieves system logs with filtering and export options. Requires admin authentication.

#### Query Parameters

- `level` (string) - Filter by log level (debug, info, warn, error), comma-separated
- `service` (string) - Filter by service (api, database, perplexity, etc.), comma-separated
- `event` (string) - Filter by event type, comma-separated
- `userId` (string) - Filter by user ID
- `blueprintId` (string) - Filter by blueprint ID
- `from` (ISO timestamp) - Start date
- `to` (ISO timestamp) - End date
- `search` (string) - Search in messages and metadata
- `limit` (number) - Results per page (default: 100, max: 1000)
- `offset` (number) - Pagination offset
- `format` (string) - Export format: `json`, `csv`, `txt`

#### Response (200 OK) - JSON format

```typescript
{
  "logs": [
    {
      "id": "string",
      "timestamp": "ISO timestamp",
      "level": "debug|info|warn|error",
      "service": "string",
      "event": "string",
      "message": "string",
      "metadata": {}
    }
  ],
  "stats": {
    "total": number,
    "byLevel": {
      "debug": number,
      "info": number,
      "warn": number,
      "error": number
    },
    "byService": {},
    "errorRate": number,
    "avgDuration": number
  },
  "filters": {},
  "pagination": {
    "limit": number,
    "offset": number
  }
}
```

#### Response - CSV format

Returns CSV file with headers: ID, Timestamp, Level, Service, Event, Message, Duration, User ID, Blueprint ID, Error

#### Response - TXT format

Returns plain text with format:

```
[timestamp] [LEVEL] [service] event: message (duration)
```

---

### Clear Logs (Admin)

**DELETE** `/api/logs`

Clears all logs. Requires admin authentication.

#### Response (200 OK)

```typescript
{
  "success": true,
  "message": "All logs cleared successfully"
}
```

---

### Log Client Errors

**POST** `/api/logs/client`

Logs client-side errors to the server. Open to both authenticated and unauthenticated users.

#### Request Body

```typescript
{
  "level": "debug|info|warn|error",  // Required
  "event": "string",                  // Required
  "message": "string",                // Required
  "metadata": {                       // Optional
    "error": "string",
    "errorStack": "string",
    "errorCode": "string",
    "url": "string",
    "userAgent": "string",
    "componentStack": "string"
  }
}
```

#### Response (200 OK)

```typescript
{
  "success": true,
  "message": "Log entry recorded"
}
```

#### Error Responses

- `400 Bad Request` - Missing required fields (event or message)

---

## Health Check

### Check API Health

**GET** `/api/health`

Simple health check endpoint for monitoring and offline detection.

#### Response (200 OK)

```typescript
{
  "status": "ok",
  "timestamp": "ISO timestamp"
}
```

**HEAD** `/api/health` - Also supported for lightweight checks

---

## Error Handling

### Standard Error Response Format

All error responses follow this format:

```typescript
{
  "error": "string",              // Error message
  "details": {}                   // Optional error details
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Currently, there are no rate limits enforced. For production deployment, consider implementing rate limiting using middleware.

---

## CORS Policy

CORS is configured to allow requests from the same origin. For external API access, update the Next.js configuration.

---

## Data Validation

All endpoints use Zod schemas for request validation. Validation errors return detailed error messages with field-specific issues:

```typescript
{
  "error": "Invalid request",
  "details": {
    "fieldErrors": {
      "fieldName": ["error message 1", "error message 2"]
    },
    "formErrors": ["general error"]
  }
}
```

---

## PII Handling

The logging system automatically redacts PII from all logs:

- API keys
- Tokens
- Passwords
- Authorization headers
- Session data

Never include sensitive user data in API requests where possible.

---

## Webhooks

Not currently implemented. Future consideration for blueprint generation completion notifications.

---

## SDK / Client Library

Use the built-in fetch API or axios. Example client usage:

```typescript
// Authenticated request
async function submitAnswers(blueprintId: string, answers: Record<string, any>) {
  const response = await fetch('/api/dynamic-answers/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ blueprintId, answers }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
}
```

---

## Support

For API issues or questions, refer to:

- This documentation
- `/frontend/tests/api/` for integration test examples
- `/frontend/app/api/` for endpoint source code

---

_Last Updated: 2025-01-06_  
_API Version: 1.0_
