import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import 'leaflet/dist/leaflet.css';

const VillageProfile = () => {
  const { villageId } = useParams();
  const [villageData, setVillageData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enhancedData, setEnhancedData] = useState(null);
  const [enhancedError, setEnhancedError] = useState(null);

  useEffect(() => {
    fetchVillageData();
    fetchVillageAssets();
    fetchEnhancedVillageData();
  }, [villageId]);

  const fetchEnhancedVillageData = async () => {
    setEnhancedError(null);
    try {
      const response = await fetch(`http://localhost:4000/api/fra/village-enhanced/${villageId}`);
      const data = await response.json();
      if (data.success) {
        setEnhancedData(data.data);
      } else {
        setEnhancedData(null);
        setEnhancedError('No enhanced data found.');
      }
    } catch (error) {
      setEnhancedData(null);
      setEnhancedError('Error fetching enhanced data.');
    }
  };

  const fetchVillageData = async () => {
    try {
      // For prototype, we'll use mock data since we don't have village-specific endpoints yet
      const mockVillageData = {
        id: villageId,
        village_name: villageId,
        district: 'Seoni',
        state: 'Madhya Pradesh',
        latitude: 22.0850,
        longitude: 79.9740,
        tribal_group: 'Gond',
        total_households: 45,
        tribal_households: 38,
        total_population: 210,
        tribal_population: 180,
        fra_claims: [
          {
            claim_id: 'FRA_MP_001',
            applicant_name: 'Ramesh Kumar',
            claim_type: 'IFR',
            area_claimed: 2.5,
            status: 'granted'
          }
        ]
      };
      setVillageData(mockVillageData);
    } catch (error) {
      console.error('Error fetching village data:', error);
    }
  };

  const fetchVillageAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/fra/assets/${villageId}`);
      const data = await response.json();
      
      if (data.success) {
        setAssets(data.data);
      } else {
        // Mock asset data for prototype
        setAssets([
          {
            id: 1,
            asset_type: 'water_body',
            asset_subtype: 'pond',
            latitude: 22.0860,
            longitude: 79.9750,
            area_sqm: 5000,
            confidence_score: 0.92
          },
          {
            id: 2,
            asset_type: 'agricultural_land',
            asset_subtype: 'crop_field',
            latitude: 22.0840,
            longitude: 79.9730,
            area_sqm: 25000,
            confidence_score: 0.88
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching village assets:', error);
      // Use mock data on error
      setAssets([]);
    }
    setLoading(false);
  };

  if (loading || !villageData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const getAssetColor = (assetType) => {
    switch (assetType) {
      case 'water_body': return '#3B82F6'; // Blue
      case 'agricultural_land': return '#10B981'; // Green
      case 'forest': return '#059669'; // Dark Green
      case 'homestead': return '#F59E0B'; // Orange
      default: return '#6B7280'; // Gray
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
  {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Village Profile</h1>
              <p className="text-gray-600 mt-1">
                {villageData.village_name}, {villageData.district}, {villageData.state}
              </p>
            </div>
            <div className="flex space-x-2">
              <Link 
                to="/"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Back to Atlas
              </Link>
              <Link 
                to={`/schemes/${villageId}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Schemes
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Village Information */}
          <div className="space-y-6">
            {/* Enhanced Data Card */}
            {enhancedData && (
              <Card>
                <CardHeader>
                  <CardTitle>Enhanced Village Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(enhancedData).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="font-medium text-xs break-all">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {enhancedError && (
              <div className="p-3 bg-red-50 text-red-700 rounded text-xs mb-2">{enhancedError}</div>
            )}
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Village Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Village Name</p>
                    <p className="font-medium">{villageData.village_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">District</p>
                    <p className="font-medium">{villageData.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">State</p>
                    <p className="font-medium">{villageData.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tribal Group</p>
                    <p className="font-medium">{villageData.tribal_group}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Coordinates</p>
                    <p className="font-medium text-xs">
                      {villageData.latitude?.toFixed(4)}, {villageData.longitude?.toFixed(4)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Population</p>
                    <p className="text-2xl font-bold text-gray-900">{villageData.total_population}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tribal Population</p>
                    <p className="text-2xl font-bold text-green-600">{villageData.tribal_population}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Households</p>
                    <p className="text-2xl font-bold text-gray-900">{villageData.total_households}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tribal Households</p>
                    <p className="text-2xl font-bold text-green-600">{villageData.tribal_households}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Tribal Population:</strong> {((villageData.tribal_population / villageData.total_population) * 100).toFixed(1)}% of total population
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* FRA Claims */}
            <Card>
              <CardHeader>
                <CardTitle>FRA Claims Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {villageData.fra_claims?.map((claim, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{claim.applicant_name}</h4>
                        <Badge className="bg-green-100 text-green-800">
                          {claim.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p><span className="font-medium">Claim ID:</span> {claim.claim_id}</p>
                        <p><span className="font-medium">Type:</span> {claim.claim_type}</p>
                        <p><span className="font-medium">Area:</span> {claim.area_claimed} hectares</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI-Mapped Assets */}
            <Card>
              <CardHeader>
                <CardTitle>AI-Mapped Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assets.length > 0 ? assets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: getAssetColor(asset.asset_type) }}
                        ></div>
                        <div>
                          <p className="font-medium capitalize">
                            {asset.asset_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {asset.asset_subtype} • {(asset.area_sqm / 10000).toFixed(2)} hectares
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {(asset.confidence_score * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">No AI-mapped assets available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Village Location & Assets</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div style={{ height: '600px' }}>
                  <MapContainer 
                    center={[villageData.latitude, villageData.longitude]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Village center marker */}
                    <Marker position={[villageData.latitude, villageData.longitude]}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold">{villageData.village_name}</h3>
                          <p className="text-sm text-gray-600">Village Center</p>
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* Asset markers */}
                    {assets.map((asset, index) => (
                      <Circle
                        key={index}
                        center={[asset.latitude, asset.longitude]}
                        radius={Math.sqrt(asset.area_sqm) * 0.5}
                        pathOptions={{ 
                          color: getAssetColor(asset.asset_type), 
                          fillColor: getAssetColor(asset.asset_type),
                          fillOpacity: 0.3 
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h4 className="font-bold capitalize">
                              {asset.asset_type.replace('_', ' ')}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Type: {asset.asset_subtype}
                            </p>
                            <p className="text-sm text-gray-600">
                              Area: {(asset.area_sqm / 10000).toFixed(2)} hectares
                            </p>
                            <p className="text-sm text-gray-600">
                              Confidence: {(asset.confidence_score * 100).toFixed(0)}%
                            </p>
                          </div>
                        </Popup>
                      </Circle>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>

            {/* Asset Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm">Water Bodies</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Agricultural Land</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-600 rounded-full mr-2"></div>
                    <span className="text-sm">Forest Areas</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-sm">Homesteads</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    Assets are mapped using AI analysis of high-resolution satellite imagery.
                    Confidence scores indicate the reliability of AI detection.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillageProfile;
