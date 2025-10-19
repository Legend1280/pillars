# Manus Webhook Documentation

## Create Webhook Endpoint

**URL**: `POST https://api.manus.ai/v1/webhooks`

**Headers**:
- `API_KEY`: `<api-key>` (required)
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "webhook": {
    "url": "<string>" // Required: Your webhook endpoint URL
  }
}
```

**Response** (200):
```json
{
  "webhook_id": "<string>"
}
```

## Webhook Callback Format

When a task completes, Manus will POST to your webhook URL with the task result.

**Expected Callback Payload** (need to test):
- Likely includes: `task_id`, `status`, `result`, `error` (if failed)

## Implementation Plan

1. **Create webhook endpoint**: `/api/manus-webhook`
   - Receives callback from Manus when task completes
   - Stores result in temporary storage (Vercel KV or similar)

2. **Create task creation endpoint**: `/api/analyze-ontology-manus-async`
   - Creates Manus task with webhook URL
   - Returns task_id immediately
   - No polling needed!

3. **Create status check endpoint**: `/api/manus-result?taskId=xxx`
   - Frontend polls this to check if result is ready
   - Returns result when available

4. **Frontend updates**:
   - Call task creation endpoint
   - Poll status endpoint every 3 seconds
   - Display result when ready

## Challenge: Vercel Serverless Limitations

- No persistent storage by default
- Need Vercel KV (Redis) or similar for temporary result storage
- Alternative: Use a database or external storage service

