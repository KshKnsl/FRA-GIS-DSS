import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, FeatureGroup } from "react-leaflet";
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
  L
}) => {
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
                .filter((claim) => isValidCoordinate(claim.latitude, claim.longitude) && claim.area_hectares)
                .map((claim) => {
                  const radius = Math.sqrt((claim.area_hectares * 10000) / Math.PI) * 0.8;
                  const color = getClaimTypeColor ? getClaimTypeColor(claim.claim_type) : "#6b7280";
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
                        opacity: 0.7,
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
        {showPattaHolders && (
          <LayersControl.Overlay checked name="Patta Holders">
            <FeatureGroup>
              {pattaHolders
                .filter((holder) => isValidCoordinate(holder.latitude, holder.longitude))
                .map((holder) => (
                  <Marker
                    key={`patta-${holder.id}`}
                    position={[holder.latitude, holder.longitude]}
                    icon={L.divIcon({
                      className: "custom-patta-marker",
                      html: '<div style="background-color: #8b5cf6; width: 18px; height: 18px; border-radius: 3px; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 10px; font-weight: bold;">P</span></div>',
                      iconSize: [22, 22],
                      iconAnchor: [11, 11],
                    })}
                  >
                    <Popup>
                      <div className="p-2 min-w-[250px]">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Patta Holder Details
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {holder.holder_name}
                          </div>
                          <div>
                            <span className="font-medium">Father's Name:</span> {holder.father_name || holder.father_husband_name}
                          </div>
                          <div>
                            <span className="font-medium">Contact:</span> {holder.contact_number || holder.mobile_number}
                          </div>
                          <div>
                            <span className="font-medium">Village:</span> {holder.village_name}
                          </div>
                          <div>
                            <span className="font-medium">District:</span> {holder.district}
                          </div>
                          <div>
                            <span className="font-medium">State:</span> {holder.state}
                          </div>
                          <div>
                            <span className="font-medium">Land Area:</span> {holder.land_area_hectares} hectares
                          </div>
                          <div>
                            <span className="font-medium">Patta Number:</span> {holder.patta_number}
                          </div>
                          <div>
                            <span className="font-medium">Issue Date:</span> {holder.patta_issue_date ? new Date(holder.patta_issue_date).toLocaleDateString() : ''}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <span className={`ml-1 px-2 py-1 rounded text-xs ${holder.patta_status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
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
  );
};

export default FRAMap;
