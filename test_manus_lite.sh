#!/bin/bash
MANUS_API_KEY="sk-PV7BD5wIlAonz30SQfd85rGCqt2pjtL5GZAY3J-DaGPec8qKy2HjJlmfb36NZJtOUcy3USAIGNxC2YQ"

echo "========================================="
echo "Testing Manus Lite (chat mode + quality)"
echo "========================================="
echo ""
echo "1. Creating task with chat mode..."

TASK_RESPONSE=$(curl -s -X POST https://api.manus.ai/v1/tasks \
  -H "API_KEY: $MANUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analyze this simple calculation: revenue = members * price. If members=100 and price=50, what is revenue? Respond in JSON format: {\"result\": number, \"explanation\": \"string\"}",
    "taskMode": "chat",
    "agentProfile": "quality"
  }')

echo "$TASK_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TASK_RESPONSE"

TASK_ID=$(echo "$TASK_RESPONSE" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)
echo ""
echo "Task ID: $TASK_ID"
echo "Task URL: https://manus.im/app/$TASK_ID"

if [ -z "$TASK_ID" ]; then
  echo "ERROR: No task_id received"
  exit 1
fi

echo ""
echo "2. Waiting 3 seconds before checking status..."
sleep 3

echo ""
echo "3. Checking task status..."
STATUS_RESPONSE=$(curl -s -X GET "https://api.manus.ai/v1/tasks/$TASK_ID" \
  -H "API_KEY: $MANUS_API_KEY")

echo "$STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATUS_RESPONSE"

STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
echo ""
echo "Current status: $STATUS"

if [ "$STATUS" = "completed" ]; then
  echo ""
  echo "✓ Task completed immediately!"
  echo ""
  echo "4. Extracting output..."
  echo "$STATUS_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'output' in data and len(data['output']) > 0:
    last_msg = data['output'][-1]
    if 'content' in last_msg:
        for content in last_msg['content']:
            if content.get('type') == 'output_text' and 'text' in content:
                print('Result text:')
                print(content['text'][:500])
" 2>/dev/null || echo "Could not extract output"
else
  echo ""
  echo "Task is still $STATUS - would need to poll until completed"
fi
