import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const SchemeRecommendations = () => {
  const { villageId } = useParams();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [villageId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/recommendations/${villageId}`);
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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

  if (!recommendations) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">No recommendations available</h2>
          <p className="text-gray-600">Unable to generate scheme recommendations for this village</p>
        </div>
      </div>
    );
  }

  const { village, recommendations: schemes } = recommendations;

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMinistryColor = (ministry) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800'
    ];
    return colors[Math.abs(ministry.charCodeAt(0)) % colors.length];
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Scheme Recommendations</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Central Sector Schemes for {village.village_name}, {village.district}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link 
                to="/"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center text-sm"
              >
                Back to Atlas
              </Link>
            </div>
          </div>
        </div>

        {/* Village Information */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Village Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Village:</span> {village.village_name}</p>
                  <p><span className="font-medium">District:</span> {village.district}</p>
                  <p><span className="font-medium">State:</span> {village.state}</p>
                  <p><span className="font-medium">Tribal Group:</span> {village.tribal_group || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">FRA Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Claim Type:</span> {village.claim_type}</p>
                  <p><span className="font-medium">Area Claimed:</span> {village.area_claimed} hectares</p>
                  <p><span className="font-medium">Status:</span> 
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      {village.status}
                    </Badge>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Asset Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Water Bodies:</span> {village.water_bodies_count || 0}</p>
                  <p><span className="font-medium">Agricultural Land:</span> {village.agricultural_land_area || 0} sq.m</p>
                  <p><span className="font-medium">Forest Cover:</span> {village.forest_cover_percentage || 0}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheme Recommendations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Recommended Central Sector Schemes</h2>
          
          <div className="grid gap-6">
            {schemes.map((scheme, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{scheme.scheme}</h3>
                        <Badge className={getPriorityColor(scheme.priority)}>
                          {scheme.priority} Priority
                        </Badge>
                        <Badge className={getMinistryColor(scheme.ministry)}>
                          {scheme.ministry}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{scheme.reason}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Expected Benefits</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {scheme.scheme === 'Jal Jeevan Mission' && (
                              <>
                                <li>• Piped water supply to households</li>
                                <li>• Improved water quality and accessibility</li>
                                <li>• Reduced water-borne diseases</li>
                              </>
                            )}
                            {scheme.scheme === 'PM-KISAN' && (
                              <>
                                <li>• Direct income support of ₹6,000/year</li>
                                <li>• Financial assistance for agricultural inputs</li>
                                <li>• Enhanced agricultural productivity</li>
                              </>
                            )}
                            {scheme.scheme === 'MGNREGA' && (
                              <>
                                <li>• Guaranteed 100 days of employment</li>
                                <li>• Infrastructure development</li>
                                <li>• Rural livelihood enhancement</li>
                              </>
                            )}
                            {scheme.scheme === 'Forest Conservation Schemes' && (
                              <>
                                <li>• Forest conservation incentives</li>
                                <li>• Sustainable forest management</li>
                                <li>• Ecosystem services payments</li>
                              </>
                            )}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Implementation Steps</h4>
                          <ol className="text-sm text-gray-600 space-y-1">
                            <li>1. Verify beneficiary eligibility</li>
                            <li>2. Submit required documentation</li>
                            <li>3. Register with implementing agency</li>
                            <li>4. Begin benefit distribution</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Apply for Scheme
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Implementation Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">For Village Officials</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Coordinate with district-level line departments
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Organize beneficiary identification camps
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Ensure proper documentation and verification
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Monitor implementation progress regularly
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">For Beneficiaries</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Maintain valid FRA patta documents
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Register with scheme implementing agencies
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Participate in training and awareness programs
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Provide feedback on scheme implementation
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchemeRecommendations;
