
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FRASidebar from "../components/fra/FRASidebar";
import FRAMap from "../components/fra/FRAMap";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// FRAClaimPopup is used inside FRAMap popups

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different claim types
const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color:${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const FRAAtlas = () => {
  const [selectedState, setSelectedState] = useState("Madhya Pradesh");
  const [fraVillages, setFraVillages] = useState([]);
  const [fraClaims, setFraClaims] = useState([]);
  const [pattaHolders, setPattaHolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([22.5, 78.5]);
  const [selectedClaimType, setSelectedClaimType] = useState("all");
  const [showCoverageAreas, setShowCoverageAreas] = useState(true);
  const [showPattaHolders, setShowPattaHolders] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districtStats, setDistrictStats] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({
    applicant_name: "",
    community_name: "",
    claim_type: "IFR",
    area_hectares: "",
    village_name: "",
    district: "",
    state: selectedState,
    remarks: "",
  });
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(null);

  const targetStates = ["Madhya Pradesh", "Tripura", "Odisha", "Telangana"];

  const stateCoordinates = {
    "Madhya Pradesh": [23.2599, 77.4126],
    Tripura: [23.9408, 91.9882],
    Odisha: [20.9517, 85.0985],
    Telangana: [18.1124, 79.0193],
  };


  useEffect(() => {
    if (selectedState === "All States") {
      fetchAllFRAVillages();
      fetchAllFRAClaims();
      fetchAllPattaHolders();
    } else {
      fetchFRAVillages();
      fetchFRAClaims();
      fetchPattaHolders();
    }
    setSelectedDistrict("");
    setDistrictStats(null);
  }, [selectedState]);

  // Fetch all states data
  const fetchAllFRAVillages = async () => {
    setLoading(true);
    try {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/villages`);
      const data = await response.json();
      if (data.success) {
        setFraVillages(data.data);
      } else {
        setFraVillages([]);
      }
    } catch (error) {
      setFraVillages([]);
    }
    setLoading(false);
  };

  const fetchAllFRAClaims = async () => {
    try {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/claims`);
      const data = await response.json();
      if (data.success) {
        setFraClaims(data.data);
      } else {
        setFraClaims([]);
      }
    } catch (error) {
      setFraClaims([]);
    }
  };

  const fetchAllPattaHolders = async () => {
    try {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/patta-holders`);
      const data = await response.json();
      if (data.success) {
        setPattaHolders(data.data);
      } else {
        setPattaHolders([]);
      }
    } catch (error) {
      setPattaHolders([]);
    }
  };

  // Update state in claim form if state changes
  useEffect(() => {
    setClaimForm((f) => ({ ...f, state: selectedState }));
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchDistrictStats(selectedDistrict);
    } else {
      setDistrictStats(null);
    }
    // eslint-disable-next-line
  }, [selectedDistrict, selectedState]);
  const fetchDistrictStats = async (district) => {
    if (!district) return;
    try {
      const response = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/api/fra/stats/${selectedState}/${encodeURIComponent(
          district
        )}`
      );
      const data = await response.json();
      if (data.success) {
        setDistrictStats(data.data);
      } else {
        setDistrictStats(null);
      }
    } catch (error) {
      setDistrictStats(null);
    }
  };

  const handleClaimFormChange = (e) => {
    const { name, value } = e.target;
    setClaimForm((f) => ({ ...f, [name]: value }));
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimSubmitting(true);
    setClaimSuccess(null);
    try {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimForm),
      });
      const data = await response.json();
      if (data.success) {
        setClaimSuccess("Claim submitted successfully!");
        setClaimForm({
          community_name: "",
          claim_type: "IFR",
          area_hectares: "",
          village_name: "",
          district: "",
          state: selectedState,
          remarks: "",
        });
        fetchFRAClaims(); // Refresh claims
      } else {
        setClaimSuccess("Failed to submit claim.");
      }
    } catch (error) {
      setClaimSuccess("Error submitting claim.");
    }
    setClaimSubmitting(false);
  };

  useEffect(() => {
    if (stateCoordinates[selectedState]) {
      setMapCenter(stateCoordinates[selectedState]);
    }
  }, [selectedState]);

  const fetchFRAVillages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/api/fra/villages?state=${selectedState}`
      );
      const data = await response.json();

      if (data.success) {
        console.log("FRA Villages data:", data.data);
        setFraVillages(data.data);
      } else {
        console.error("Failed to fetch FRA villages:", data.message);
      }
    } catch (error) {
      console.error("Error fetching FRA villages:", error);
    }
    setLoading(false);
  };

  const fetchFRAClaims = async () => {
    try {
      const response = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/api/fra/claims/${selectedState}`
      );
      const data = await response.json();

      if (data.success) {
        console.log("FRA Claims data:", data.data);
        setFraClaims(data.data);
      } else {
        console.error("Failed to fetch FRA claims:", data.message);
      }
    } catch (error) {
      console.error("Error fetching FRA claims:", error);
    }
  };

  const fetchPattaHolders = async () => {
    try {
      const response = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/api/fra/patta-holders/state/${selectedState}`
      );
      const data = await response.json();

      if (data.success) {
        console.log("Patta Holders data:", data.data);
        setPattaHolders(data.data);
      } else {
        console.error("Failed to fetch patta holders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching patta holders:", error);
    }
  };

  const getClaimTypeColor = (claimType) => {
    switch (claimType) {
      case "IFR":
        return "#3B82F6"; // Blue
      case "CR":
        return "#10B981"; // Green
      case "CFR":
        return "#F59E0B"; // Orange
      default:
        return "#6B7280"; // Gray
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
      case "CFR":
        return Math.max(baseRadius * 1.5, 500); // Larger for community forest resources
      case "CR":
        return Math.max(baseRadius * 1.2, 300); // Medium for community rights
      case "IFR":
        return Math.max(baseRadius * 1.0, 150); // Smaller for individual rights
      default:
        return baseRadius;
    }
  };

  const getStatusOpacity = (status) => {
    switch (status) {
      case "granted":
        return 0.6;
      case "pending":
        return 0.4;
      case "under_review":
        return 0.3;
      case "rejected":
        return 0.2;
      default:
        return 0.3;
    }
  };

  // Helper function to validate coordinates
  const isValidCoordinate = (lat, lng) => {
    return (
      lat !== undefined &&
      lng !== undefined &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };


  const filteredClaims = fraClaims.filter((claim) => {
    if (selectedState !== "All States" && claim.state !== selectedState) return false;
    if (selectedClaimType === "all") return true;
    return claim.claim_type === selectedClaimType;
  });

  const filteredVillages = fraVillages.filter((village) => {
    if (selectedState !== "All States" && village.state !== selectedState) return false;
    return true;
  });

  // Get unique districts from filtered villages
  const uniqueDistricts = Array.from(
    new Set(filteredVillages.map((v) => v.district))
  ).sort();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* NavigationSidebar is now the only sidebar; content is always visible */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-white px-3 py-2 rounded-md shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              <span className="text-sm">Loading FRA data...</span>
            </div>
          </div>
        )}
        
        {/* Map Controls Panel - All screen sizes */}
        <div className="absolute top-2 right-2 z-[1000] space-y-2">
          {/* Main Controls Card */}
          <div className="bg-white p-3 rounded-lg shadow-lg min-w-[200px]">
            <h4 className="font-medium text-gray-800 mb-3 text-sm">Map Controls</h4>
            
            {/* State Selector */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="All States">All States</option>
                {targetStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Claim Type Filter */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Claim Type
              </label>
              <select
                value={selectedClaimType}
                onChange={(e) => setSelectedClaimType(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Types</option>
                <option value="IFR">Individual Forest Rights (IFR)</option>
                <option value="CR">Community Rights (CR)</option>
                <option value="CFR">Community Forest Resource Rights (CFR)</option>
              </select>
            </div>

            {/* District Selector */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select District --</option>
                {uniqueDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Layer Controls */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Map Layers
              </label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showCoverageAreas}
                    onChange={(e) => setShowCoverageAreas(e.target.checked)}
                    className="mr-2 w-3 h-3"
                  />
                  <span className="text-xs text-gray-600">Coverage Areas</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showPattaHolders}
                    onChange={(e) => setShowPattaHolders(e.target.checked)}
                    className="mr-2 w-3 h-3"
                  />
                  <span className="text-xs text-gray-600">Patta Holders</span>
                </label>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="border-t pt-2 mt-2">
              <div className="text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Villages:</span>
                  <span className="font-medium">{fraVillages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Claims:</span>
                  <span className="font-medium">{filteredClaims.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Patta Holders:</span>
                  <span className="font-medium">{pattaHolders.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* District Stats Card */}
          {selectedDistrict && districtStats && (
            <div className="bg-blue-50 p-3 rounded-lg shadow-lg min-w-[200px]">
              <h4 className="font-medium text-blue-800 mb-2 text-sm">
                {selectedDistrict} District
              </h4>
              <div className="text-xs text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Total Claims:</span>
                  <span className="font-medium">{districtStats.total_claims}</span>
                </div>
                <div className="flex justify-between">
                  <span>Granted:</span>
                  <span className="font-medium text-green-600">{districtStats.granted_claims}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-medium text-yellow-600">{districtStats.pending_claims}</span>
                </div>
                <div className="flex justify-between">
                  <span>Area Granted:</span>
                  <span className="font-medium">{districtStats.total_granted_area} ha</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <FRAMap
          mapCenter={mapCenter}
          filteredVillages={filteredVillages}
          getClaimTypeIcon={getClaimTypeIcon}
          getClaimTypeColor={getClaimTypeColor}
          isValidCoordinate={isValidCoordinate}
          showCoverageAreas={showCoverageAreas}
          filteredClaims={filteredClaims}
          showPattaHolders={showPattaHolders}
          pattaHolders={pattaHolders}
          selectedState={selectedState}
          L={L}
        />
        
      </div>
    </div>
  );
};

export default FRAAtlas;
