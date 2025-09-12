import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import 'leaflet/dist/leaflet.css';

const VillageProfile = () => {
  const { villageId } = useParams();
  const navigate = useNavigate();
  const [villageData, setVillageData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enhancedData, setEnhancedData] = useState(null);
  const [enhancedError, setEnhancedError] = useState(null);
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(villageId || '');
  const [villagesLoading, setVillagesLoading] = useState(true);

  useEffect(() => {
    fetchVillagesList();
  }, []);

  useEffect(() => {
    if (villageId) {
      setSelectedVillage(villageId);
      fetchVillageData();
      fetchVillageAssets();
      fetchEnhancedVillageData();
    }
  }, [villageId]);

  const fetchVillagesList = async () => {
    setVillagesLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/villages`);
      const data = await response.json();
      if (data.success && data.data) {
        setVillages(data.data);
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
    }
    setVillagesLoading(false);
  };

  const handleVillageSelect = (villageName) => {
    if (villageName) {
      setSelectedVillage(villageName);
      navigate(`/village/${encodeURIComponent(villageName)}`);
    }
  };

  const fetchEnhancedVillageData = async () => {
    setEnhancedError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/villages/${villageId}/enhanced`);
      const data = await response.json();
      if (data.success) {
        setEnhancedData(data);
      } else {
        setEnhancedData(null);
        setEnhancedError('No enhanced data found for this village.');
      }
    } catch (error) {
      setEnhancedData(null);
      setEnhancedError('Error fetching enhanced data.');
    }
  };

  const fetchVillageData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/villages/${villageId}/enhanced`);
      const data = await response.json();

      if (data.success) {
        setVillageData(data.village);
        setEnhancedData(data);
      } else {
        setVillageData(null);
        setEnhancedError('Village data not found.');
      }
    } catch (error) {
      console.error('Error fetching village data:', error);
      setVillageData(null);
      setEnhancedError('Error fetching village data.');
    }
  };

  const fetchVillageAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/villages/${villageId}/assets`);
      const data = await response.json();
      
      if (data.success) {
        setAssets(data.data);
      } else {
        setAssets([]);
      }
    } catch (error) {
      console.error('Error fetching village assets:', error);
      setAssets([]);
    }
    setLoading(false);
  };

  // Show village selector if no village is selected
  if (!villageId) {
    return (
      <div className="p-4 sm:p-6 bg-background min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Village Profile</h1>
            <p className="text-muted-foreground">Select a village to view its detailed profile and information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Village</CardTitle>
            </CardHeader>
            <CardContent>
              {villagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading villages...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Choose a village to view its profile:
                    </label>
                    <select
                      value={selectedVillage}
                      onChange={(e) => handleVillageSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      <option value="" disabled>-- Select a Village --</option>
                      {villages.map((village) => (
                        <option key={village.village_id} value={village.village_name}>
                          {village.village_name}, {village.district}, {village.state}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {villages.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No villages found in the database.
                    </div>
                  )}
                  
                  <div className="bg-secondary p-4 rounded-lg">
                    <h4 className="font-medium text-secondary-foreground mb-2">Available Villages</h4>
                    <div className="text-sm text-secondary-foreground">
                      Total villages in database: <strong>{villages.length}</strong>
                    </div>
                    {villages.length > 0 && (
                      <div className="mt-2 text-xs text-secondary-foreground">
                        Villages from: {[...new Set(villages.map(v => v.state))].join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || !villageData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Village Profile</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                {villageData.village_name}, {villageData.district}, {villageData.state}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link 
                to="/"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-center text-sm"
              >
                Back to Atlas
              </Link>
            </div>
          </div>
        </div>

        {/* Village Selector */}
        <div className="mb-4 sm:mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Switch Village:
                  </label>
                  <select
                    value={selectedVillage}
                    onChange={(e) => handleVillageSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    <option value="" disabled>-- Select a Village --</option>
                    {villages.map((village) => (
                      <option key={village.village_name} value={village.village_name}>
                        {village.village_name}, {village.district}, {village.state}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-muted-foreground">
                  {villages.length} villages available
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Village Information */}
          <div className="space-y-4 sm:space-y-6">
            {/* Enhanced Data Card */}
            {enhancedData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enhanced Village Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Object.entries(enhancedData).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs sm:text-sm text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="font-medium text-xs break-all">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {enhancedError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded text-xs mb-2">{enhancedError}</div>
            )}
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Village Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Village Name</p>
                    <p className="font-medium text-foreground">{villageData.village_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">District</p>
                    <p className="font-medium text-foreground">{villageData.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium text-foreground">{villageData.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tribal Group</p>
                    <p className="font-medium text-foreground">{villageData.tribal_group}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coordinates</p>
                    <p className="font-medium text-foreground text-xs">
                      {villageData.latitude ? parseFloat(villageData.latitude).toFixed(4) : 'N/A'}, {villageData.longitude ? parseFloat(villageData.longitude).toFixed(4) : 'N/A'}
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
                    <p className="text-sm text-muted-foreground">Total Population</p>
                    <p className="text-2xl font-bold text-foreground">{villageData.total_population}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tribal Population</p>
                    <p className="text-2xl font-bold text-primary">{villageData.tribal_population}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Households</p>
                    <p className="text-2xl font-bold text-foreground">{villageData.total_households}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tribal Households</p>
                    <p className="text-2xl font-bold text-primary">{villageData.tribal_households}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-secondary-foreground">
                    <strong>Tribal Population:</strong> {villageData.total_population && villageData.tribal_population ? ((parseFloat(villageData.tribal_population) / parseFloat(villageData.total_population)) * 100).toFixed(1) : 'N/A'}% of total population
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
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
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
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: getAssetColor(asset.asset_type) }}
                        ></div>
                        <div>
                          <p className="font-medium capitalize">
                            {asset.asset_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {asset.asset_subtype} • {asset.area_sqm ? (parseFloat(asset.area_sqm) / 10000).toFixed(2) : 'N/A'} hectares
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary">
                        {(parseFloat(asset.confidence_score) * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-center py-4">No AI-mapped assets available</p>
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
                    center={[
                      villageData.latitude ? parseFloat(villageData.latitude) : 0,
                      villageData.longitude ? parseFloat(villageData.longitude) : 0
                    ]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Village center marker */}
                    <Marker position={[
                      villageData.latitude ? parseFloat(villageData.latitude) : 0,
                      villageData.longitude ? parseFloat(villageData.longitude) : 0
                    ]}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold">{villageData.village_name}</h3>
                          <p className="text-sm text-muted-foreground">Village Center</p>
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* Asset markers */}
                    {assets.map((asset, index) => (
                      <Circle
                        key={index}
                        center={[
                          asset.latitude ? parseFloat(asset.latitude) : 0,
                          asset.longitude ? parseFloat(asset.longitude) : 0
                        ]}
                        radius={Math.sqrt(parseFloat(asset.area_sqm) || 0) * 0.5}
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
                            <p className="text-sm text-muted-foreground">
                              Type: {asset.asset_subtype}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Area: {asset.area_sqm ? (parseFloat(asset.area_sqm) / 10000).toFixed(2) : 'N/A'} hectares
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {(parseFloat(asset.confidence_score) * 100).toFixed(0)}%
                            </p>
                          </div>
                        </Popup>
                      </Circle>
                    ))}
                  </MapContainer>
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
