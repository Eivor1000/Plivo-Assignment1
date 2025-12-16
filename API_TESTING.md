# API Testing Examples

Complete collection of API requests for testing the Plivo IVR system.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Using cURL](#using-curl)
- [Using PowerShell](#using-powershell)
- [Using Postman](#using-postman)
- [Using JavaScript/Node.js](#using-javascriptnodejs)
- [Using Python](#using-python)

## Prerequisites

- Server running on `http://localhost:3000`
- ngrok running with public URL
- `.env` configured correctly

## Using cURL

### 1. Health Check

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Plivo IVR System"
}
```

### 2. Trigger Outbound Call

```bash
curl -X POST http://localhost:3000/trigger-call \
  -H "Content-Type: application/json" \
  -d '{"to_number": "+1234567890"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "call_uuid": "abc123-def456-ghi789",
  "api_id": "xyz789"
}
```

### 3. Invalid Phone Number (Error Test)

```bash
curl -X POST http://localhost:3000/trigger-call \
  -H "Content-Type: application/json" \
  -d '{"to_number": "1234567890"}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid phone number format. Use E.164 format (e.g., +1234567890)"
}
```

### 4. Missing Phone Number (Error Test)

```bash
curl -X POST http://localhost:3000/trigger-call \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Missing required field: to_number"
}
```

### 5. View IVR Welcome XML

```bash
curl https://your-ngrok-url.ngrok.io/ivr/welcome
```

**Expected Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak voice="WOMAN">Welcome to our service. Press 1 for English. Press 2 for Spanish.</Speak>
    <GetDigits action="https://your-ngrok-url.ngrok.io/ivr/language-handler" method="POST" timeout="10" numDigits="1" validDigits="12" redirect="true">
        <Speak voice="WOMAN">Please make a selection.</Speak>
    </GetDigits>
    ...
</Response>
```

## Using PowerShell

### 1. Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

### 2. Trigger Outbound Call

```powershell
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    to_number = "+1234567890"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/trigger-call" -Method POST -Headers $headers -Body $body
```

### 3. Trigger Multiple Calls (Batch Test)

```powershell
$numbers = @("+1234567890", "+1987654321", "+1555555555")

foreach ($number in $numbers) {
    $body = @{ to_number = $number } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3000/trigger-call" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Called $number - UUID: $($response.call_uuid)"
    Start-Sleep -Seconds 2
}
```

### 4. Error Test - Invalid Number

```powershell
$body = @{
    to_number = "invalid_number"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/trigger-call" -Method POST -Body $body -ContentType "application/json"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
```

### 5. View XML Response

```powershell
$response = Invoke-WebRequest -Uri "https://your-ngrok-url.ngrok.io/ivr/welcome"
Write-Host "Content-Type: $($response.Headers['Content-Type'])"
Write-Host "XML Content:`n$($response.Content)"
```

## Using Postman

### Setup Collection

1. Open Postman
2. Create a new Collection: "Plivo IVR Tests"
3. Add environment variables:
   - `base_url`: `http://localhost:3000`
   - `ngrok_url`: `https://your-ngrok-url.ngrok.io`
   - `test_number`: `+1234567890`

### Request 1: Health Check

- **Method**: GET
- **URL**: `{{base_url}}/health`
- **Headers**: None required
- **Body**: None

**Tests Tab:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has status field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('status');
    pm.expect(jsonData.status).to.equal('healthy');
});
```

### Request 2: Trigger Call - Success

- **Method**: POST
- **URL**: `{{base_url}}/trigger-call`
- **Headers**: 
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "to_number": "{{test_number}}"
}
```

**Tests Tab:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Call initiated successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
    pm.expect(jsonData).to.have.property('call_uuid');
    
    // Save call_uuid for later use
    pm.environment.set("last_call_uuid", jsonData.call_uuid);
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(3000);
});
```

### Request 3: Trigger Call - Invalid Number

- **Method**: POST
- **URL**: `{{base_url}}/trigger-call`
- **Headers**: 
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "to_number": "1234567890"
}
```

**Tests Tab:**
```javascript
pm.test("Status is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Error message is present", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(false);
    pm.expect(jsonData).to.have.property('error');
    pm.expect(jsonData.error).to.include('Invalid phone number');
});
```

### Request 4: View Welcome XML

- **Method**: GET
- **URL**: `{{ngrok_url}}/ivr/welcome`
- **Headers**: None required
- **Body**: None

**Tests Tab:**
```javascript
pm.test("Content-Type is XML", function () {
    pm.response.to.have.header("Content-Type");
    pm.expect(pm.response.headers.get("Content-Type")).to.include("xml");
});

pm.test("XML contains Response element", function () {
    pm.expect(pm.response.text()).to.include("<Response>");
    pm.expect(pm.response.text()).to.include("</Response>");
});

pm.test("XML contains Speak element", function () {
    pm.expect(pm.response.text()).to.include("<Speak");
});
```

## Using JavaScript/Node.js

### Setup

```bash
npm install axios
```

### Test Script

Create a file `test-api.js`:

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_NUMBER = '+1234567890';

// Test 1: Health Check
async function testHealthCheck() {
  console.log('\n🧪 Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Test 2: Trigger Call - Success
async function testTriggerCall() {
  console.log('\n🧪 Testing Trigger Call...');
  try {
    const response = await axios.post(`${BASE_URL}/trigger-call`, {
      to_number: TEST_NUMBER
    });
    console.log('✅ Call triggered successfully:', response.data);
    return response.data.call_uuid;
  } catch (error) {
    console.error('❌ Call trigger failed:', error.message);
    return null;
  }
}

// Test 3: Invalid Phone Number
async function testInvalidNumber() {
  console.log('\n🧪 Testing Invalid Phone Number...');
  try {
    await axios.post(`${BASE_URL}/trigger-call`, {
      to_number: '1234567890' // Missing + prefix
    });
    console.error('❌ Should have failed but succeeded');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Correctly rejected invalid number:', error.response.data);
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Test 4: Missing Phone Number
async function testMissingNumber() {
  console.log('\n🧪 Testing Missing Phone Number...');
  try {
    await axios.post(`${BASE_URL}/trigger-call`, {});
    console.error('❌ Should have failed but succeeded');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Correctly rejected missing number:', error.response.data);
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Test 5: View XML
async function testViewXML() {
  console.log('\n🧪 Testing XML Response...');
  const NGROK_URL = process.env.SERVER_URL || 'http://localhost:3000';
  try {
    const response = await axios.get(`${NGROK_URL}/ivr/welcome`);
    const isXML = response.headers['content-type'].includes('xml');
    const hasResponse = response.data.includes('<Response>');
    
    if (isXML && hasResponse) {
      console.log('✅ XML response is valid');
      console.log('📄 XML Preview:', response.data.substring(0, 200) + '...');
      return true;
    } else {
      console.error('❌ Invalid XML response');
      return false;
    }
  } catch (error) {
    console.error('❌ XML test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Tests...');
  
  const results = {
    healthCheck: await testHealthCheck(),
    triggerCall: await testTriggerCall(),
    invalidNumber: await testInvalidNumber(),
    missingNumber: await testMissingNumber(),
    viewXML: await testViewXML()
  };
  
  console.log('\n📊 Test Results:');
  console.log('─────────────────────────────');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  const passedCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  console.log('─────────────────────────────');
  console.log(`Passed: ${passedCount}/${totalCount}`);
}

// Run tests
runAllTests();
```

Run the tests:
```bash
node test-api.js
```

## Using Python

### Setup

```bash
pip install requests
```

### Test Script

Create a file `test_api.py`:

```python
import requests
import json
import os

BASE_URL = 'http://localhost:3000'
TEST_NUMBER = '+1234567890'
NGROK_URL = os.getenv('SERVER_URL', BASE_URL)

def test_health_check():
    """Test 1: Health Check"""
    print('\n🧪 Testing Health Check...')
    try:
        response = requests.get(f'{BASE_URL}/health')
        response.raise_for_status()
        data = response.json()
        print(f'✅ Health check passed: {data}')
        return True
    except Exception as e:
        print(f'❌ Health check failed: {e}')
        return False

def test_trigger_call():
    """Test 2: Trigger Call - Success"""
    print('\n🧪 Testing Trigger Call...')
    try:
        response = requests.post(
            f'{BASE_URL}/trigger-call',
            json={'to_number': TEST_NUMBER},
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()
        data = response.json()
        print(f'✅ Call triggered successfully: {data}')
        return data.get('call_uuid')
    except Exception as e:
        print(f'❌ Call trigger failed: {e}')
        return None

def test_invalid_number():
    """Test 3: Invalid Phone Number"""
    print('\n🧪 Testing Invalid Phone Number...')
    try:
        response = requests.post(
            f'{BASE_URL}/trigger-call',
            json={'to_number': '1234567890'},  # Missing + prefix
            headers={'Content-Type': 'application/json'}
        )
        if response.status_code == 400:
            print(f'✅ Correctly rejected invalid number: {response.json()}')
            return True
        else:
            print('❌ Should have failed but succeeded')
            return False
    except Exception as e:
        print(f'❌ Unexpected error: {e}')
        return False

def test_missing_number():
    """Test 4: Missing Phone Number"""
    print('\n🧪 Testing Missing Phone Number...')
    try:
        response = requests.post(
            f'{BASE_URL}/trigger-call',
            json={},
            headers={'Content-Type': 'application/json'}
        )
        if response.status_code == 400:
            print(f'✅ Correctly rejected missing number: {response.json()}')
            return True
        else:
            print('❌ Should have failed but succeeded')
            return False
    except Exception as e:
        print(f'❌ Unexpected error: {e}')
        return False

def test_view_xml():
    """Test 5: View XML Response"""
    print('\n🧪 Testing XML Response...')
    try:
        response = requests.get(f'{NGROK_URL}/ivr/welcome')
        response.raise_for_status()
        
        is_xml = 'xml' in response.headers.get('content-type', '')
        has_response = '<Response>' in response.text
        
        if is_xml and has_response:
            print('✅ XML response is valid')
            print(f'📄 XML Preview: {response.text[:200]}...')
            return True
        else:
            print('❌ Invalid XML response')
            return False
    except Exception as e:
        print(f'❌ XML test failed: {e}')
        return False

def run_all_tests():
    """Run all tests and display results"""
    print('🚀 Starting API Tests...')
    
    results = {
        'healthCheck': test_health_check(),
        'triggerCall': test_trigger_call() is not None,
        'invalidNumber': test_invalid_number(),
        'missingNumber': test_missing_number(),
        'viewXML': test_view_xml()
    }
    
    print('\n📊 Test Results:')
    print('─' * 30)
    for test, passed in results.items():
        status = '✅' if passed else '❌'
        print(f'{status} {test}')
    
    passed_count = sum(results.values())
    total_count = len(results)
    print('─' * 30)
    print(f'Passed: {passed_count}/{total_count}')

if __name__ == '__main__':
    run_all_tests()
```

Run the tests:
```bash
python test_api.py
```

## Automated Testing with CI/CD

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm install
    
    - name: Start server
      run: npm start &
      
    - name: Wait for server
      run: npx wait-on http://localhost:3000/health
    
    - name: Run tests
      run: node test-api.js
```

## Load Testing

### Using Apache Bench

```bash
# Test health endpoint
ab -n 1000 -c 10 http://localhost:3000/health

# Test trigger-call endpoint (with POST data)
ab -n 100 -c 5 -p post-data.json -T application/json http://localhost:3000/trigger-call
```

**post-data.json:**
```json
{"to_number": "+1234567890"}
```

### Using Artillery

Install Artillery:
```bash
npm install -g artillery
```

Create `load-test.yml`:
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      
scenarios:
  - name: "Health Check"
    flow:
      - get:
          url: "/health"
          
  - name: "Trigger Call"
    flow:
      - post:
          url: "/trigger-call"
          json:
            to_number: "+1234567890"
```

Run load test:
```bash
artillery run load-test.yml
```

## Summary

This guide provides comprehensive testing examples for:
- ✅ Manual testing with cURL and PowerShell
- ✅ API testing with Postman
- ✅ Automated testing with JavaScript and Python
- ✅ CI/CD integration
- ✅ Load testing

Choose the method that fits your workflow and test thoroughly before deploying to production!
