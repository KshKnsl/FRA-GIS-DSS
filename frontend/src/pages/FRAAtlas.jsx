import React, { useState, useEffect, useMemo } from "react";
import FRAMap from "../components/fra/FRAMap";
import ControlPanel from "../components/fra/ControlPanel";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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
  const [showMapControls, setShowMapControls] = useState(true);
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
    if (!fraVillages) return [];
    return Array.from(
      new Set(
        fraVillages.map((v) => v.district).filter(Boolean)
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
    if (selectedState !== "All States") {
      fetchFRAData(selectedState);
    }
    setSelectedDistrict("");
    setDistrictStats(null);
  }, [selectedState]);

  const fetchFRAData = async (state) => {
    setLoading(true);
    try {
      const [villagesRes, claimsRes, pattaHoldersRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/villages?state=${state}`),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/claims/${state}`),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/patta-holders/state/${state}`)
      ]);

      const villagesData = await villagesRes.json();
      if (villagesData.success) setFraVillages(villagesData.data);

      const claimsData = await claimsRes.json();
      if (claimsData.success) setFraClaims(claimsData.data);

      const pattaHoldersData = await pattaHoldersRes.json();
      if (pattaHoldersData.success) setPattaHolders(pattaHoldersData.data);

    } catch (error) {
      console.error("Error fetching FRA data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDistrict) {
      fetchDistrictStats(selectedDistrict);
    } else {
      setDistrictStats(null);
    }
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
        setDistrictStats(data.data.statistics);
      } else {
        setDistrictStats(null);
      }
    } catch (error) {
      console.error("Error fetching district stats:", error);
      setDistrictStats(null);
    }
  };

  useEffect(() => {
    if (stateCoordinates[selectedState]) {
      setMapCenter(stateCoordinates[selectedState]);
    }
  }, [selectedState]);

  const getClaimTypeColor = (claimType) => {
    switch (claimType) {
      case "IFR": return "#3B82F6";
      case "CR": return "#10B981";
      case "CFR": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  const getClaimTypeIcon = (claimType) => {
    const color = getClaimTypeColor(claimType);
    return createCustomIcon(color);
  };

  const isValidCoordinate = (lat, lng) => {
    return lat != null && lng != null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute bottom-4 right-4 z-[401] w-[340px] sm:w-[400px]">
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
  );
};

export default FRAAtlas;