#!/bin/bash

echo "🧪 Testing AI Validation System..."
echo ""
echo "Sending test ontology to Dr. Sarah Chen..."
echo ""

curl -X POST http://localhost:3000/api/analyze-ontology \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": [
      {"id": "monthly_fee", "type": "input", "label": "Monthly Member Fee", "data": {"value": 200}},
      {"id": "total_members", "type": "input", "label": "Total Members", "data": {"value": 500}},
      {"id": "annual_revenue", "type": "calculation", "label": "Annual Revenue", "data": {"formula": "monthly_fee * 12 * total_members"}}
    ],
    "edges": [
      {"source": "monthly_fee", "target": "annual_revenue"},
      {"source": "total_members", "target": "annual_revenue"}
    ]
  }' | python3 -m json.tool

echo ""
echo "✅ Test complete!"
