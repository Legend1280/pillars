#!/bin/bash
MANUS_API_KEY="sk-PV7BD5wIlAonz30SQfd85rGCqt2pjtL5GZAY3J-DaGPec8qKy2HjJlmfb36NZJtOUcy3USAIGNxC2YQ"

echo "Testing Manus API..."
echo "1. Creating a simple task..."

TASK_RESPONSE=$(curl -s -X POST https://api.manus.ai/v1/tasks \
  -H "API_KEY: $MANUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analyze this: 1+1=2. Is this correct? Respond with just yes or no.",
    "taskMode": "agent"
  }')

echo "Create response: $TASK_RESPONSE"

TASK_ID=$(echo "$TASK_RESPONSE" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)
echo "Task ID: $TASK_ID"

if [ -z "$TASK_ID" ]; then
  echo "ERROR: No task_id received"
  exit 1
fi

echo ""
echo "2. Checking task status..."
STATUS_RESPONSE=$(curl -s -X GET "https://api.manus.ai/v1/tasks/$TASK_ID" \
  -H "API_KEY: $MANUS_API_KEY")

echo "Status response: $STATUS_RESPONSE"
