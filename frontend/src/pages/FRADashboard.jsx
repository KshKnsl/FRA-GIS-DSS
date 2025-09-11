import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const FRADashboard = () => {
  const { state } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [state]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/fra/dashboard/${state}`);
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">No data available</h2>
          <p className="text-gray-600">Unable to load dashboard data for {state}</p>
        </div>
      </div>
    );
  }

  const { statistics, districts } = dashboardData;

  const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FRA Dashboard</h1>
              <p className="text-gray-600 mt-1">{state} - Forest Rights Act Implementation Status</p>
            </div>
            <div className="flex space-x-2">
              <Link 
                to="/"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Back to Atlas
              </Link>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{statistics.total_claims}</div>
              <p className="text-xs text-gray-500 mt-1">All FRA applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Granted Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.granted_claims}</div>
              <p className="text-xs text-gray-500 mt-1">
                {calculatePercentage(statistics.granted_claims, statistics.total_claims)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statistics.pending_claims}</div>
              <p className="text-xs text-gray-500 mt-1">
                {calculatePercentage(statistics.pending_claims, statistics.total_claims)}% pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Area Granted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {parseFloat(statistics.total_granted_area || 0).toFixed(1)} ha
              </div>
              <p className="text-xs text-gray-500 mt-1">Hectares under FRA</p>
            </CardContent>
          </Card>
        </div>

        {/* Claim Type Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Claim Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Individual Forest Rights (IFR)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">{statistics.ifr_claims}</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {calculatePercentage(statistics.ifr_claims, statistics.total_claims)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Community Rights (CR)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">{statistics.cr_claims}</span>
                    <Badge className="bg-green-100 text-green-800">
                      {calculatePercentage(statistics.cr_claims, statistics.total_claims)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Community Forest Resource Rights (CFR)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">{statistics.cfr_claims}</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {calculatePercentage(statistics.cfr_claims, statistics.total_claims)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Granted Claims</span>
                    <span>{calculatePercentage(statistics.granted_claims, statistics.total_claims)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${calculatePercentage(statistics.granted_claims, statistics.total_claims)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pending Claims</span>
                    <span>{calculatePercentage(statistics.pending_claims, statistics.total_claims)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${calculatePercentage(statistics.pending_claims, statistics.total_claims)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Implementation Rate:</strong> {calculatePercentage(statistics.granted_claims, statistics.total_claims)}% of claims have been successfully granted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* District-wise Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>District-wise Implementation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Claims
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Granted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {districts.map((district, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {district.district}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {district.claims_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {district.granted_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={
                          calculatePercentage(district.granted_count, district.claims_count) > 70 
                            ? 'bg-green-100 text-green-800' 
                            : calculatePercentage(district.granted_count, district.claims_count) > 40
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }>
                          {calculatePercentage(district.granted_count, district.claims_count)}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900 font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FRADashboard;
