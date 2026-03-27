#!/usr/bin/env node

/**
 * Cache Performance Testing Script
 * Run this to test cache performance from command line
 * 
 * Usage: node scripts/test-cache.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cache-Test-Script/1.0'
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: result,
            duration: Date.now() - start
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            duration: Date.now() - start
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    const start = Date.now();
    req.end();
  });
}

async function testCachePerformance() {
  console.log('🧪 Starting Cache Performance Tests\n');
  
  try {
    // Test 1: Cache Status
    console.log('📊 Testing cache status...');
    const statsResult = await makeRequest('/api/dev/cache?action=stats');
    console.log(`   Status: ${statsResult.statusCode}`);
    console.log(`   Duration: ${statsResult.duration}ms`);
    if (statsResult.data?.data) {
      const { totalKeys, keysByPattern, rateLimitKeys, memorySample } = statsResult.data.data;
      console.log(`   Total cache keys: ${totalKeys}`);
      console.log(`   Keys by pattern:`, keysByPattern);
      console.log(`   Rate limit keys: ${rateLimitKeys.length}`);
      if (memorySample?.length) {
        console.log(`   Memory sample (first ${memorySample.length} keys):`);
        memorySample.forEach((item, idx) => {
          console.log(`     ${idx + 1}. ${item.key} [type: ${item.type}, ttl: ${item.ttl}]`);
        });
      }
      console.log('');
    } else {
      console.log('   Failed to fetch cache stats ❌\n');
    }

    // Test 2: Basic Cache Operations
    console.log('🔧 Testing basic cache operations...');
    const basicResult = await makeRequest('/api/dev/cache?action=test-basic');
    console.log(`   Status: ${basicResult.statusCode}`);
    console.log(`   Duration: ${basicResult.duration}ms`);
    console.log(`   Test Success: ${basicResult.data?.success ? '✅' : '❌'}\n`);

    // Test 3: Rate Limiting
    console.log('🚦 Testing rate limiting...');
    const rateLimitResult = await makeRequest('/api/dev/cache?action=test-rate-limit');
    console.log(`   Status: ${rateLimitResult.statusCode}`);
    console.log(`   Duration: ${rateLimitResult.duration}ms`);
    console.log(`   Rate Limit Working: ${rateLimitResult.data?.success ? '✅' : '❌'}\n`);

    // Test 4: Properties API Performance (with and without cache)
    console.log('🏠 Testing properties API performance...');
    
    // First request (cache miss)
    const propsResult1 = await makeRequest('/api/properties?page=1&limit=5');
    console.log(`   First request: ${propsResult1.duration}ms (cache miss)`);
    
    // Second request (cache hit)
    const propsResult2 = await makeRequest('/api/properties?page=1&limit=5');
    console.log(`   Second request: ${propsResult2.duration}ms (cache hit)`);
    
    const improvement = ((propsResult1.duration - propsResult2.duration) / propsResult1.duration * 100).toFixed(1);
    console.log(`   Performance improvement: ${improvement}% ⚡\n`);

    // Test 5: Load Testing
    console.log('⚡ Running load test (10 concurrent requests)...');
    const loadTestPromises = Array(10).fill().map(() => 
      makeRequest('/api/properties?page=1&limit=5')
    );
    
    const loadTestStart = Date.now();
    const loadTestResults = await Promise.all(loadTestPromises);
    const loadTestDuration = Date.now() - loadTestStart;
    
    const avgResponseTime = loadTestResults.reduce((sum, r) => sum + r.duration, 0) / 10;
    const successCount = loadTestResults.filter(r => r.statusCode === 200).length;
    
    console.log(`   Total duration: ${loadTestDuration}ms`);
    console.log(`   Average response time: ${avgResponseTime.toFixed(1)}ms`);
    console.log(`   Success rate: ${successCount}/10 (${(successCount/10*100)}%)\n`);

    console.log('✅ All cache performance tests completed!');
    
  } catch (error) {
    console.error('❌ Cache performance test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  testCachePerformance();
}

module.exports = { testCachePerformance, makeRequest };
