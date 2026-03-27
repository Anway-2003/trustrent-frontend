'use client'

import { useState, useEffect } from 'react'

interface CacheStats {
  totalKeys: number
  keysByPattern: Record<string, number>
  rateLimitKeys: Array<{
    key: string
    count: number
    ttl: number
    endpoint: string
    clientIP: string
    type: 'auth' | 'api' | 'other'
  }>
  memorySample: Array<{
    key: string
    type: string
    ttl: number
    size?: number
  }>
}

interface RateLimitInfo {
  endpoint: string
  clientIP: string
  currentCount: number
  ttl: number
  type: 'auth' | 'api' | 'other'
}

export default function CacheDashboard() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [rateLimits, setRateLimits] = useState<RateLimitInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCacheStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/dev/cache?action=stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cache stats')
    } finally {
      setLoading(false)
    }
  }

  const fetchRateLimits = async () => {
    try {
      const response = await fetch('/api/dev/cache?action=rate-limits')
      const data = await response.json()
      if (data.success) {
        setRateLimits(data.data.rateLimits)
      }
    } catch (err) {
      console.error('Failed to fetch rate limits:', err)
    }
  }

  const runCacheTest = async (action: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/dev/cache?action=${action}`)
      const data = await response.json()
      console.log(`Cache test ${action} result:`, data)
      
      // Refresh stats after test
      await fetchCacheStats()
    } catch (err) {
      console.error(`Cache test ${action} failed:`, err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCacheStats()
    fetchRateLimits()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchCacheStats()
      fetchRateLimits()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const formatTTL = (ttl: number) => {
    if (ttl < 0) return 'No expiration'
    if (ttl < 60) return `${ttl}s`
    if (ttl < 3600) return `${Math.floor(ttl / 60)}m ${ttl % 60}s`
    return `${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m`
  }

  const getIPDisplay = (ip: string) => {
    if (ip === '::1') return 'localhost (IPv6)'
    if (ip === '127.0.0.1') return 'localhost (IPv4)'
    return ip
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TrustRent Cache Dashboard</h1>
          <p className="text-gray-600">Monitor cache performance and rate limiting</p>
          <div className="mt-2 text-sm text-gray-500">
            Understanding rate limit keys: <code>rate_limit:api:::1:/api/landlords?</code> means:
            <br />• <code>api:</code> = API endpoint rate limit
            <br />• <code>::1</code> = IPv6 localhost (your local dev environment)
            <br />• <code>/api/landlords?</code> = The specific endpoint being rate limited
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchCacheStats()}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Stats'}
            </button>
            <button
              onClick={() => runCacheTest('test-basic')}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Test Basic Cache
            </button>
            <button
              onClick={() => runCacheTest('test-rate-limit')}
              disabled={loading}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              Test Rate Limit
            </button>
            <button
              onClick={() => runCacheTest('test-properties')}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Test Properties Cache
            </button>
            <button
              onClick={() => runCacheTest('clear-test-caches')}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Clear Test Caches
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cache Statistics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Cache Statistics</h2>
            {stats ? (
              <div>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-blue-600">{stats.totalKeys}</span>
                  <span className="text-gray-600 ml-2">Total Cache Keys</span>
                </div>
                
                <h3 className="font-semibold mb-2">Keys by Pattern</h3>
                <div className="space-y-2 mb-4">
                  {Object.entries(stats.keysByPattern).map(([pattern, count]) => (
                    <div key={pattern} className="flex justify-between items-center">
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{pattern}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>

                <h3 className="font-semibold mb-2">Memory Sample</h3>
                <div className="max-h-64 overflow-y-auto">
                  {stats.memorySample.map((item, idx) => (
                    <div key={idx} className="border-b border-gray-100 py-2 text-sm">
                      <div className="font-mono text-xs text-gray-600 truncate">{item.key}</div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{item.type}</span>
                        <span>TTL: {formatTTL(item.ttl)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading cache statistics...</div>
            )}
          </div>

          {/* Rate Limiting */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Rate Limiting</h2>
            {stats?.rateLimitKeys && stats.rateLimitKeys.length > 0 ? (
              <div className="space-y-3">
                {stats.rateLimitKeys.map((rateLimit, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm">{rateLimit.endpoint}</div>
                        <div className="text-xs text-gray-500">{getIPDisplay(rateLimit.clientIP)}</div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-2 py-1 rounded text-xs ${
                          rateLimit.type === 'auth' ? 'bg-red-100 text-red-800' :
                          rateLimit.type === 'api' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rateLimit.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Count: {rateLimit.count}</span>
                      <span>TTL: {formatTTL(rateLimit.ttl)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No active rate limits</div>
            )}
          </div>
        </div>

        {/* Additional Rate Limit Details */}
        {rateLimits.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Detailed Rate Limit Status</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TTL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rateLimits.map((limit, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {limit.endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getIPDisplay(limit.clientIP)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          limit.type === 'auth' ? 'bg-red-100 text-red-800' :
                          limit.type === 'api' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {limit.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {limit.currentCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTTL(limit.ttl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          Dashboard auto-refreshes every 10 seconds • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
