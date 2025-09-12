
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import FRASidebar from "../components/fra/FRASidebar";
import FRAMap from "../components/fra/FRAMap";
import ControlPanel from "../components/fra/ControlPanel";
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
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [selectedState, setSelectedState] = useState("Madhya Pradesh");
  const [fraVillages, setFraVillages] = useState([]);
  const [fraClaims, setFraClaims] = useState([]);
  const [pattaHolders, setPattaHolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([22.5, 78.5]);
  const [selectedClaimType, setSelectedClaimType] = useState("all");
  const [showFraVillages, setShowFraVillages] = useState(true);
  const [showCoverageAreas, setShowCoverageAreas] = useState(true);
  const [showPattaHolders, setShowPattaHolders] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districtStats, setDistrictStats] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showMapControls, setShowMapControls] = useState(true);
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
  const [baseMapLayer, setBaseMapLayer] = useState("OpenStreetMap");

  const targetStates = ["Madhya Pradesh", "Tripura", "Odisha", "Telangana"];

  const stateCoordinates = {
    "Madhya Pradesh": [23.2599, 77.4126],
    Tripura: [23.9408, 91.9882],
    Odisha: [20.9517, 85.0985],
    Telangana: [18.1124, 79.0193],
  };

  const filteredVillages = useMemo(() => {
    return fraVillages.filter((village) => {
      if (selectedState !== "All States" && village.state !== selectedState) return false;
      return true;
    });
  }, [fraVillages, selectedState]);

  const uniqueDistricts = useMemo(() => {
    return Array.from(
      new Set(
        (fraVillages || []).map((v) => v.district)
      )
    ).sort();
  }, [fraVillages]);

  const filteredClaims = useMemo(() => {
    return fraClaims.filter((claim) => {
      if (selectedState !== "All States" && claim.state !== selectedState) return false;
      if (selectedClaimType === "all") return true;
      return claim.claim_type === selectedClaimType;
    });
  }, [fraClaims, selectedState, selectedClaimType]);

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

  // Fetch FRA villages from backend
  const fetchFRAVillages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/fra/villages${selectedState !== "All States" ? `?state=${selectedState}` : ''}`
      );
      const data = await response.json();

      if (data.success) {
        console.log("FRA Villages data:", data.data);
        setFraVillages(data.data);
      } else {
        console.error("Failed to fetch FRA villages:", data.message);
        setFraVillages([]);
      }
    } catch (error) {
      console.error("Error fetching FRA villages:", error);
      setFraVillages([]);
    }
    setLoading(false);
  };

  // Fetch FRA claims from backend
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
        setFraClaims([]);
      }
    } catch (error) {
      console.error("Error fetching FRA claims:", error);
      setFraClaims([]);
    }
  };

  // Fetch patta holders from backend
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
        setPattaHolders([]);
      }
    } catch (error) {
      console.error("Error fetching patta holders:", error);
      setPattaHolders([]);
    }
  };  // Update state in claim form if state changes
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
          applicant_name: "",
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

  const isValidCoordinate = (lat, lng) => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  return (
    <div className="relative h-full min-h-screen bg-background text-foreground">
      <div className="flex flex-col h-full">
        <div className="flex-1 relative">
          {/* Map Controls Panel - All screen sizes */}
          <div className="fixed top-4 right-4 z-[1000] w-[340px] sm:w-[400px]">
            <ControlPanel
              showFraVillages={showFraVillages}
              setShowFraVillages={setShowFraVillages}
              showCoverageAreas={showCoverageAreas}
              setShowCoverageAreas={setShowCoverageAreas}
              showPattaHolders={showPattaHolders}
              setShowPattaHolders={setShowPattaHolders}
              baseMapLayer={baseMapLayer}
              setBaseMapLayer={setBaseMapLayer}
              targetStates={targetStates}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedClaimType={selectedClaimType}
              setSelectedClaimType={setSelectedClaimType}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              uniqueDistricts={uniqueDistricts}
              fraVillages={fraVillages}
              filteredClaims={filteredClaims}
              pattaHolders={pattaHolders}
              showMapControls={showMapControls}
              setShowMapControls={setShowMapControls}
              districtStats={districtStats}
              overlayOpacity={overlayOpacity}
              setOverlayOpacity={setOverlayOpacity}
            />
          </div>
          <FRAMap
            mapCenter={mapCenter}
            filteredVillages={filteredVillages}
            getClaimTypeIcon={getClaimTypeIcon}
            getClaimTypeColor={getClaimTypeColor}
            isValidCoordinate={isValidCoordinate}
            showFraVillages={showFraVillages}
            showCoverageAreas={showCoverageAreas}
            filteredClaims={filteredClaims}
            showPattaHolders={showPattaHolders}
            pattaHolders={pattaHolders}
            selectedState={selectedState}
            baseMapLayer={baseMapLayer}
            overlayOpacity={overlayOpacity}
            L={L}
          />
        </div>
      </div>
    </div>
  );
};

export default FRAAtlas;
