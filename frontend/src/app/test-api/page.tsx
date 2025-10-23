'use client';

import { useState } from 'react';
import { commerceService } from '../../services/commerceService';

export default function TestApiPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const testResults: any[] = [];

    try {
      // Test 0: Check Auth Status
      console.log('Testing auth status...');
      try {
        const authResponse = await fetch('https://aezcrib.xyz/app/api/auth/me', {
          credentials: 'include',
        });
        testResults.push({
          endpoint: 'GET /api/auth/me',
          success: authResponse.ok,
          data: authResponse.ok ? await authResponse.json() : null,
          error: authResponse.ok ? null : `HTTP ${authResponse.status}`
        });
      } catch (error) {
        testResults.push({
          endpoint: 'GET /api/auth/me',
          success: false,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 1: Get Credits
      console.log('Testing getCredits...');
      const creditsResponse = await commerceService.getCredits();
      testResults.push({
        endpoint: 'GET /api/aezcrib/credits',
        success: creditsResponse.success,
        data: creditsResponse,
        error: creditsResponse.success ? null : 'Failed to get credits'
      });

      // Test 2: Get User Worksheets
      console.log('Testing getUserWorksheets...');
      const worksheetsResponse = await commerceService.getUserWorksheets();
      testResults.push({
        endpoint: 'GET /api/aezcrib/user/worksheets',
        success: worksheetsResponse.success,
        data: worksheetsResponse,
        error: worksheetsResponse.success ? null : worksheetsResponse.error
      });

      // Test 3: Get Transactions
      console.log('Testing getTransactions...');
      const transactionsResponse = await commerceService.getTransactions();
      testResults.push({
        endpoint: 'GET /api/aezcrib/user/transactions',
        success: transactionsResponse.success,
        data: transactionsResponse,
        error: transactionsResponse.success ? null : transactionsResponse.error
      });

      // Test 4: Get Recommendations
      console.log('Testing getRecommendations...');
      const recommendationsResponse = await commerceService.getRecommendations();
      testResults.push({
        endpoint: 'GET /api/aezcrib/recommendations',
        success: recommendationsResponse.success,
        data: recommendationsResponse,
        error: recommendationsResponse.success ? null : recommendationsResponse.error
      });

    } catch (error) {
      testResults.push({
        endpoint: 'General Error',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Commerce API Test</h1>
      
      <button
        onClick={testEndpoints}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 mb-6"
      >
        {loading ? 'Testing APIs...' : 'Test All Endpoints'}
      </button>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Test Results</h2>
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{result.endpoint}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.success ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>
              
              {result.error && (
                <div className="mb-2">
                  <p className="text-red-600 font-medium">Error:</p>
                  <p className="text-red-700">{result.error}</p>
                </div>
              )}
              
              <div>
                <p className="font-medium mb-1">Response Data:</p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}