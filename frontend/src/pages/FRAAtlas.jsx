
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
    <div className="flex h-screen bg-gray-100">
      <FRASidebar
        targetStates={targetStates}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        showClaimModal={showClaimModal}
        setShowClaimModal={setShowClaimModal}
        claimForm={claimForm}
        handleClaimFormChange={handleClaimFormChange}
        handleClaimSubmit={handleClaimSubmit}
        claimSubmitting={claimSubmitting}
        claimSuccess={claimSuccess}
        uniqueDistricts={uniqueDistricts}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        districtStats={districtStats}
        selectedClaimType={selectedClaimType}
        setSelectedClaimType={setSelectedClaimType}
        showCoverageAreas={showCoverageAreas}
        setShowCoverageAreas={setShowCoverageAreas}
        showPattaHolders={showPattaHolders}
        setShowPattaHolders={setShowPattaHolders}
        fraVillages={fraVillages}
        fraClaims={fraClaims}
        filteredClaims={filteredClaims}
        pattaHolders={pattaHolders}
      />
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded-md shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              Loading FRA data...
            </div>
          </div>
        )}
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
          L={L}
        />
        {/* Map Info Panel */}
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm z-[1000]">
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
