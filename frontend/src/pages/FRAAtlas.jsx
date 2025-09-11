import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, FeatureGroup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different claim types
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const FRAAtlas = () => {
  const [selectedState, setSelectedState] = useState('Madhya Pradesh');
  const [fraVillages, setFraVillages] = useState([]);
  const [fraClaims, setFraClaims] = useState([]);
  const [pattaHolders, setPattaHolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([22.5, 78.5]); 
  const [selectedClaimType, setSelectedClaimType] = useState('all');
  const [showCoverageAreas, setShowCoverageAreas] = useState(true);
  const [showPattaHolders, setShowPattaHolders] = useState(true);

  const targetStates = [
    'Madhya Pradesh',
    'Tripura', 
    'Odisha',
    'Telangana'
  ];

  const stateCoordinates = {
    'Madhya Pradesh': [23.2599, 77.4126],
    'Tripura': [23.9408, 91.9882],
    'Odisha': [20.9517, 85.0985],
    'Telangana': [18.1124, 79.0193]
  };

  useEffect(() => {
    fetchFRAVillages();
    fetchFRAClaims();
    fetchPattaHolders();
  }, [selectedState]);

  useEffect(() => {
    if (stateCoordinates[selectedState]) {
      setMapCenter(stateCoordinates[selectedState]);
    }
  }, [selectedState]);

  const fetchFRAVillages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/fra/villages?state=${selectedState}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('FRA Villages data:', data.data);
        setFraVillages(data.data);
      } else {
        console.error('Failed to fetch FRA villages:', data.message);
      }
    } catch (error) {
      console.error('Error fetching FRA villages:', error);
    }
    setLoading(false);
  };

  const fetchFRAClaims = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/fra/claims/${selectedState}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('FRA Claims data:', data.data);
        setFraClaims(data.data);
      } else {
        console.error('Failed to fetch FRA claims:', data.message);
      }
    } catch (error) {
      console.error('Error fetching FRA claims:', error);
    }
  };

  const fetchPattaHolders = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/fra/patta-holders/state/${selectedState}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Patta Holders data:', data.data);
        setPattaHolders(data.data);
      } else {
        console.error('Failed to fetch patta holders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching patta holders:', error);
    }
  };

  const getClaimTypeColor = (claimType) => {
    switch (claimType) {
      case 'IFR': return '#3B82F6'; // Blue
      case 'CR': return '#10B981'; // Green
      case 'CFR': return '#F59E0B'; // Orange
      default: return '#6B7280'; // Gray
    }
  };

  const getClaimTypeIcon = (claimType) => {
    const color = getClaimTypeColor(claimType);
    return createCustomIcon(color);
  };

  const getClaimRadius = (areaClaimed, claimType) => {
    // Calculate radius based on area and claim type
    let baseRadius = Math.sqrt(areaClaimed) * 100; // Base calculation
    
    // Adjust radius based on claim type
    switch (claimType) {
      case 'CFR': return Math.max(baseRadius * 1.5, 500); // Larger for community forest resources
      case 'CR': return Math.max(baseRadius * 1.2, 300); // Medium for community rights
      case 'IFR': return Math.max(baseRadius * 1.0, 150); // Smaller for individual rights
      default: return baseRadius;
    }
  };

  const getStatusOpacity = (status) => {
    switch (status) {
      case 'granted': return 0.6;
      case 'pending': return 0.4;
      case 'under_review': return 0.3;
      case 'rejected': return 0.2;
      default: return 0.3;
    }
  };

  // Helper function to validate coordinates
  const isValidCoordinate = (lat, lng) => {
    return lat !== undefined && lng !== undefined && 
           !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  };

  const filteredClaims = fraClaims.filter(claim => {
    if (selectedClaimType === 'all') return true;
    return claim.claim_type === selectedClaimType;
  });

  const filteredVillages = fraVillages.filter(village => {
    // Show villages that match the selected state
    return village.state === selectedState;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">FRA Atlas Control Panel</h2>
          
          {/* State Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select State
            </label>
            <select 
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {targetStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Claim Type Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Claim Type
            </label>
            <select 
              value={selectedClaimType}
              onChange={(e) => setSelectedClaimType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="IFR">Individual Forest Rights (IFR)</option>
              <option value="CR">Community Rights (CR)</option>
              <option value="CFR">Community Forest Resource Rights (CFR)</option>
            </select>
          </div>

          {/* Layer Controls */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Map Layers</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showCoverageAreas}
                  onChange={(e) => setShowCoverageAreas(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Coverage Areas</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showPattaHolders}
                  onChange={(e) => setShowPattaHolders(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Patta Holders</span>
              </label>
            </div>
          </div>

          {/* Legend */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
            <div className="space-y-2">
              <div className="text-xs text-gray-600 font-medium mb-1">Claim Types:</div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Individual Forest Rights (IFR)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Community Rights (CR)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Community Forest Resource Rights (CFR)</span>
              </div>
              <div className="text-xs text-gray-600 font-medium mt-2 mb-1">Status:</div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 border-2 border-green-600 rounded-full mr-2 opacity-50"></div>
                <span className="text-xs text-gray-600">Approved</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 border-2 border-yellow-600 rounded-full mr-2 opacity-50"></div>
                <span className="text-xs text-gray-600">Pending</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 border-2 border-red-600 rounded-full mr-2 opacity-50"></div>
                <span className="text-xs text-gray-600">Rejected</span>
              </div>
              <div className="text-xs text-gray-600 font-medium mt-2 mb-1">Markers:</div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-600 text-white text-xs flex items-center justify-center font-bold mr-2" style={{borderRadius: '3px'}}>P</div>
                <span className="text-xs text-gray-600">Patta Holders</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link 
                to={`/fra-dashboard/${selectedState}`}
                className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors"
              >
                View Dashboard
              </Link>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Generate Report
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Export Data
              </button>
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Total Villages:</span>
                <span className="font-medium">{fraVillages.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Total Claims:</span>
                <span className="font-medium">{fraClaims.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Filtered Results:</span>
                <span className="font-medium">{filteredClaims.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Patta Holders:</span>
                <span className="font-medium">{pattaHolders.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>State:</span>
                <span className="font-medium">{selectedState}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded-md shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              Loading FRA data...
            </div>
          </div>
        )}

        <MapContainer 
          center={mapCenter} 
          zoom={7} 
          style={{ height: '100%', width: '100%' }}
          key={selectedState} // Force re-render when state changes
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked name="FRA Villages">
              <FeatureGroup>
                {filteredVillages
                  .filter(village => isValidCoordinate(village.latitude, village.longitude))
                  .map((village, index) => (
                  <Marker
                    key={index}
                    position={[village.latitude, village.longitude]}
                    icon={getClaimTypeIcon(village.claim_type)}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-gray-800">{village.village_name}</h3>
                        <p className="text-sm text-gray-600">{village.district}, {village.state}</p>
                        <p className="text-sm text-gray-600">Population: {village.population}</p>
                        <p className="text-sm text-gray-600">Forest Area: {village.forest_area_hectares} ha</p>
                        <p className="text-sm text-gray-600">Total Pattas: {village.total_pattas}</p>
                        <div className="mt-2 space-y-1">
                          <Link 
                            to={`/village/${village.village_name}`}
                            className="block px-3 py-1 bg-green-600 text-white text-xs text-center rounded hover:bg-green-700"
                          >
                            View Profile
                          </Link>
                          <Link 
                            to={`/schemes/${village.village_name}`}
                            className="block px-3 py-1 bg-blue-600 text-white text-xs text-center rounded hover:bg-blue-700"
                          >
                            Scheme Recommendations
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>

            {/* FRA Claims Coverage Areas */}
            {showCoverageAreas && (
              <LayersControl.Overlay checked name="FRA Coverage Areas">
                <FeatureGroup>
                  {filteredClaims
                    .filter(claim => isValidCoordinate(claim.latitude, claim.longitude) && claim.area_hectares)
                    .map((claim) => {
                    // Calculate radius based on claim area (roughly 100m per hectare)
                    const radius = Math.sqrt(claim.area_hectares * 10000 / Math.PI) * 0.8;
                    
                    // Color coding based on claim status
                    const getColor = (status) => {
                      switch(status?.toLowerCase()) {
                        case 'approved': return '#10b981';
                        case 'pending': return '#f59e0b';
                        case 'rejected': return '#ef4444';
                        default: return '#6b7280';
                      }
                    };

                    // Color coding based on claim type
                    const getTypeColor = (type) => {
                      switch(type?.toUpperCase()) {
                        case 'IFR': return '#3b82f6';
                        case 'CR': return '#10b981';
                        case 'CFR': return '#f97316';
                        default: return '#6b7280';
                      }
                    };

                    const color = getTypeColor(claim.claim_type);

                    return (
                      <Circle
                        key={`claim-${claim.id}`}
                        center={[claim.latitude, claim.longitude]}
                        radius={radius}
                        pathOptions={{
                          fillColor: color,
                          fillOpacity: 0.3,
                          color: color,
                          weight: 2,
                          opacity: 0.7
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[250px]">
                            <h3 className="font-semibold text-gray-900 mb-2">FRA Claim Details</h3>
                            <div className="space-y-1 text-sm">
                              <div><span className="font-medium">Community:</span> {claim.community_name}</div>
                              <div><span className="font-medium">Type:</span> {claim.claim_type}</div>
                              <div><span className="font-medium">Area:</span> {claim.area_hectares} hectares</div>
                              <div><span className="font-medium">Status:</span> 
                                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                  claim.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                  claim.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {claim.status}
                                </span>
                              </div>
                              <div><span className="font-medium">Village:</span> {claim.village_name}</div>
                              <div><span className="font-medium">District:</span> {claim.district}</div>
                              <div><span className="font-medium">Date Applied:</span> {new Date(claim.date_applied).toLocaleDateString()}</div>
                              {claim.date_approved && (
                                <div><span className="font-medium">Date Approved:</span> {new Date(claim.date_approved).toLocaleDateString()}</div>
                              )}
                              {claim.remarks && (
                                <div><span className="font-medium">Remarks:</span> {claim.remarks}</div>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Circle>
                    );
                  })}
                </FeatureGroup>
              </LayersControl.Overlay>
            )}

            {/* Patta Holder Markers */}
            {showPattaHolders && (
              <LayersControl.Overlay checked name="Patta Holders">
                <FeatureGroup>
                  {pattaHolders
                    .filter(holder => isValidCoordinate(holder.latitude, holder.longitude))
                    .map((holder) => (
                    <Marker
                      key={`patta-${holder.id}`}
                      position={[holder.latitude, holder.longitude]}
                      icon={L.divIcon({
                        className: 'custom-patta-marker',
                        html: '<div style="background-color: #8b5cf6; width: 18px; height: 18px; border-radius: 3px; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 10px; font-weight: bold;">P</span></div>',
                        iconSize: [22, 22],
                        iconAnchor: [11, 11]
                      })}
                    >
                      <Popup>
                        <div className="p-2 min-w-[250px]">
                          <h3 className="font-semibold text-gray-900 mb-2">Patta Holder Details</h3>
                          <div className="space-y-1 text-sm">
                            <div><span className="font-medium">Name:</span> {holder.holder_name}</div>
                            <div><span className="font-medium">Father's Name:</span> {holder.father_name}</div>
                            <div><span className="font-medium">Contact:</span> {holder.contact_number}</div>
                            <div><span className="font-medium">Village:</span> {holder.village_name}</div>
                            <div><span className="font-medium">District:</span> {holder.district}</div>
                            <div><span className="font-medium">State:</span> {holder.state}</div>
                            <div><span className="font-medium">Land Area:</span> {holder.land_area_hectares} hectares</div>
                            <div><span className="font-medium">Patta Number:</span> {holder.patta_number}</div>
                            <div><span className="font-medium">Issue Date:</span> {new Date(holder.patta_issue_date).toLocaleDateString()}</div>
                            <div><span className="font-medium">Status:</span> 
                              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                holder.patta_status === 'Active' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {holder.patta_status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </FeatureGroup>
              </LayersControl.Overlay>
            )}
          </LayersControl>
        </MapContainer>

        {/* Map Info Panel */}
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-bold text-gray-800 mb-2">FRA Atlas Information</h3>
          <p className="text-sm text-gray-600 mb-2">
            Displaying Forest Rights Act data for <strong>{selectedState}</strong>
          </p>
          <div className="text-xs text-gray-500">
            <p>• <strong>Village markers:</strong> FRA villages with claim data</p>
            <p>• <strong>Coverage circles:</strong> FRA claim areas (color = type, opacity = status)</p>
            <p>• <strong>Purple squares:</strong> Individual patta holders</p>
            <p>• <strong>Use layer controls</strong> to toggle different data layers</p>
            <p>• <strong>Filter sidebar</strong> to refine displayed data</p>
          </div>
          <div className="mt-2 text-xs text-green-600 font-medium">
            Showing {filteredClaims.length} claims, {pattaHolders.length} patta holders
          </div>
        </div>
      </div>
    </div>
  );
};

export default FRAAtlas;
