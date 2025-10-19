# Manus API Attachments

## How to Send Files to Manus

The Manus API supports attachments in the task creation request. You can attach files in three ways:

### 1. **URL** (Publicly accessible file)
```json
{
  "prompt": "Analyze this code",
  "attachments": [
    {
      "filename": "calculations.ts",
      "url": "https://example.com/calculations.ts",
      "mimeType": "text/plain"
    }
  ]
}
```

### 2. **Base64 Encoded Data** (For OpenAI compatibility)
```json
{
  "prompt": "Analyze this code",
  "attachments": [
    {
      "filename": "calculations.ts",
      "fileData": "<base64-encoded-content>",
      "mimeType": "text/plain"
    }
  ]
}
```

### 3. **File Upload** (Not documented - might need separate upload endpoint)

## Attachment Object Schema

```typescript
interface Attachment {
  filename: string;      // Name of the file
  url?: string;          // Publicly accessible URL (Option 1)
  mimeType?: string;     // MIME type (e.g., "text/plain", "application/json")
  fileData?: string;     // Base64 encoded file data (Option 2)
}
```

## Implementation Strategy for Pillars Dashboard

### Option A: Use manus-upload-file utility
```bash
$ manus-upload-file /path/to/calculations.ts
# Returns: https://s3.amazonaws.com/...
```

Then send the URL in attachments:
```typescript
const uploadedUrl = await uploadFile(calculationCode);
const response = await fetch('https://api.manus.ai/v1/tasks', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "Analyze this financial model...",
    attachments: [
      {
        filename: "calculations.ts",
        url: uploadedUrl,
        mimeType: "text/typescript"
      },
      {
        filename: "ontology.json",
        url: uploadedOntologyUrl,
        mimeType: "application/json"
      }
    ]
  })
});
```

### Option B: Base64 encode and send directly
```typescript
const base64Code = Buffer.from(calculationCode).toString('base64');
const base64Ontology = Buffer.from(JSON.stringify(ontologyGraph)).toString('base64');

const response = await fetch('https://api.manus.ai/v1/tasks', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "Analyze this financial model...",
    attachments: [
      {
        filename: "calculations.ts",
        fileData: base64Code,
        mimeType: "text/typescript"
      },
      {
        filename: "ontology.json",
        fileData: base64Ontology,
        mimeType: "application/json"
      }
    ]
  })
});
```

## Recommended Approach

**Use Option A (manus-upload-file)** because:
1. Cleaner - no base64 encoding overhead
2. Smaller request payload
3. Files are hosted and accessible to Manus agent
4. The utility is already available in the sandbox

## Updated Prompt Strategy

With attachments, the prompt can be much shorter:

```
You are Dr. Sarah Chen, an expert business analyst. Analyze the attached files:

1. calculations.ts - The actual TypeScript calculation code
2. ontology.json - The ontology graph structure

Perform a comprehensive analysis and return results in JSON format as specified.
```

This keeps the prompt under 3000 characters while still providing all necessary context via attachments.

