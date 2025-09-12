import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, FeatureGroup, GeoJSON } from "react-leaflet";
import FRAClaimPopup from "./FRAClaimPopup";

const FRAMap = ({
  mapCenter,
  filteredVillages,
  getClaimTypeIcon,
  getClaimTypeColor,
  isValidCoordinate,
  showCoverageAreas,
  filteredClaims,
  showPattaHolders,
  pattaHolders,
  selectedState,
  L
}) => {
  const [villageBoundaries, setVillageBoundaries] = useState(null);
  const [pattaHoldersData, setPattaHoldersData] = useState([]);

  // Fetch village boundaries
  useEffect(() => {
    const fetchBoundaries = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/village-boundaries?state=${selectedState}`);
        const data = await response.json();
        if (data.success) {
          setVillageBoundaries(data.data);
        }
      } catch (error) {
        console.error('Error fetching village boundaries:', error);
      }
    };
    fetchBoundaries();
  }, [selectedState]);

  // Fetch patta holders with coordinates
  useEffect(() => {
    const fetchPattaHolders = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/patta-holders/coordinates?state=${selectedState}`);
        const data = await response.json();
        if (data.success) {
          setPattaHoldersData(data.data);
        }
      } catch (error) {
        console.error('Error fetching patta holders coordinates:', error);
      }
    };
    if (showPattaHolders) {
      fetchPattaHolders();
    }
  }, [selectedState, showPattaHolders]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      key={mapCenter.join("-")}
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
              .filter((village) => isValidCoordinate(village.latitude, village.longitude))
              .map((village, index) => (
                <Marker
                  key={index}
                  position={[village.latitude, village.longitude]}
                  icon={getClaimTypeIcon(village.claim_type)}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-gray-800">
                        {village.village_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {village.district}, {village.state}
                      </p>
                      <p className="text-sm text-gray-600">
                        Population: {village.population}
                      </p>
                      <p className="text-sm text-gray-600">
                        Forest Area: {village.forest_area_hectares} ha
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Pattas: {village.total_pattas}
                      </p>
                      <div className="mt-2 space-y-1">
                        <a
                          href={`/village/${village.village_name}`}
                          className="block px-3 py-1 bg-green-600 text-white text-xs text-center rounded hover:bg-green-700"
                        >
                          View Profile
                        </a>
                        <a
                          href={`/schemes/${village.village_name}`}
                          className="block px-3 py-1 bg-blue-600 text-white text-xs text-center rounded hover:bg-blue-700"
                        >
                          Scheme Recommendations
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </FeatureGroup>
        </LayersControl.Overlay>
        
        {showCoverageAreas && (
          <LayersControl.Overlay checked name="FRA Coverage Areas">
            <FeatureGroup>
              {filteredClaims
                .filter((claim) => isValidCoordinate(claim.latitude, claim.longitude) && claim.area_claimed)
                .map((claim) => {
                  const radius = Math.sqrt((claim.area_claimed * 10000) / Math.PI) * 2.5;
                  const color = getClaimTypeColor ? getClaimTypeColor(claim.claim_type) : "#6b7280";
                  return (
                    <Circle
                      key={`claim-${claim.id}`}
                      center={[claim.latitude, claim.longitude]}
                      radius={radius}
                      pathOptions={{
                        fillColor: color,
                        fillOpacity: 0.5,
                        color: color,
                        weight: 3,
                        opacity: 0.9,
                      }}
                    >
                      <Popup>
                        <FRAClaimPopup claim={claim} />
                      </Popup>
                    </Circle>
                  );
                })}
            </FeatureGroup>
          </LayersControl.Overlay>
        )}
        
        {villageBoundaries && (
          <LayersControl.Overlay name="Village Boundaries">
            <GeoJSON
              data={villageBoundaries}
              style={{
                fillColor: 'transparent',
                weight: 2,
                opacity: 0.8,
                color: '#ff7800',
                dashArray: '5, 5'
              }}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(`
                  <div>
                    <h4><strong>${feature.properties.village_name}</strong></h4>
                    <p>District: ${feature.properties.district}</p>
                    <p>State: ${feature.properties.state}</p>
                    <p>Area: ${feature.properties.area_sqkm} sq km</p>
                  </div>
                `);
              }}
            />
          </LayersControl.Overlay>
        )}
        
        {showPattaHolders && (
          <LayersControl.Overlay checked name="Patta Holders">
            <FeatureGroup>
              {pattaHoldersData
                .filter((holder) => isValidCoordinate(holder.latitude, holder.longitude))
                .map((holder, index) => (
                  <Marker
                    key={`patta-${holder.patta_number}-${index}`}
                    position={[holder.latitude, holder.longitude]}
                    icon={L.divIcon({
                      className: "custom-patta-marker",
                      html: '<div style="background-color: #8b5cf6; width: 24px; height: 24px; border-radius: 4px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-size: 12px; font-weight: bold;">P</span></div>',
                      iconSize: [28, 28],
                      iconAnchor: [14, 14],
                    })}
                  >
                    <Popup>
                      <div className="p-3 min-w-[280px]">
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                          Patta Holder Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Name:</span> 
                            <span className="ml-1 text-gray-900">{holder.holder_name}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Patta Number:</span> 
                            <span className="ml-1 text-gray-900">{holder.patta_number}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Occupation:</span> 
                            <span className="ml-1 text-gray-900">{holder.occupation}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Land Type:</span> 
                            <span className="ml-1 text-gray-900">{holder.land_classification}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Village:</span> 
                            <span className="ml-1 text-gray-900">{holder.village_name}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">District:</span> 
                            <span className="ml-1 text-gray-900">{holder.district}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">State:</span> 
                            <span className="ml-1 text-gray-900">{holder.state}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Claim Type:</span> 
                            <span className="ml-1 text-gray-900">{holder.claim_type}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Area Claimed:</span> 
                            <span className="ml-1 text-gray-900">{holder.area_claimed} hectares</span>
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
  );
};

export default FRAMap;