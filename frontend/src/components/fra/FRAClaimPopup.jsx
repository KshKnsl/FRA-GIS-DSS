import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const FRAClaimPopup = ({ claim }) => {
  const [pattaHolders, setPattaHolders] = useState(null);
  const [loadingPatta, setLoadingPatta] = useState(false);
  const [errorPatta, setErrorPatta] = useState(null);
  const [landParcels, setLandParcels] = useState(null);
  const [loadingLand, setLoadingLand] = useState(false);
  const [errorLand, setErrorLand] = useState(null);

  const fetchPattaHolders = async () => {
    setLoadingPatta(true);
    setErrorPatta(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/fra/patta-holders/claim/${claim.id}`
      );
      const data = await response.json();
      if (data.success) {
        setPattaHolders(data.data);
      } else {
        setErrorPatta("No patta holders found.");
      }
    } catch (e) {
      setErrorPatta("Error fetching patta holders.");
    }
    setLoadingPatta(false);
  };

  const fetchLandParcels = async () => {
    setLoadingLand(true);
    setErrorLand(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/fra/land-parcels/${claim.id}`
      );
      const data = await response.json();
      if (data.success) {
        setLandParcels(data.data);
      } else {
        setErrorLand("No land parcels found.");
      }
    } catch (e) {
      setErrorLand("Error fetching land parcels.");
    }
    setLoadingLand(false);
  };

  return (
    <Card className="p-2 min-w-[250px]">
      <CardHeader>
        <CardTitle className="text-base">FRA Claim Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div><span className="font-medium">Community:</span> {claim.community_name}</div>
        <div><span className="font-medium">Type:</span> {claim.claim_type}</div>
        <div><span className="font-medium">Area:</span> {claim.area_hectares} hectares</div>
        <div><span className="font-medium">Status:</span> <span className={`ml-1 px-2 py-1 rounded text-xs ${claim.status === "Approved" ? "bg-green-100 text-green-800" : claim.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{claim.status}</span></div>
        <div><span className="font-medium">Village:</span> {claim.village_name}</div>
        <div><span className="font-medium">District:</span> {claim.district}</div>
        <div><span className="font-medium">Date Applied:</span> {new Date(claim.date_applied).toLocaleDateString()}</div>
        {claim.date_approved && <div><span className="font-medium">Date Approved:</span> {new Date(claim.date_approved).toLocaleDateString()}</div>}
        {claim.remarks && <div><span className="font-medium">Remarks:</span> {claim.remarks}</div>}
        <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700" onClick={fetchPattaHolders} disabled={loadingPatta}>
          {loadingPatta ? "Loading..." : "Show Patta Holders"}
        </Button>
        {errorPatta && <div className="text-xs text-red-600 mt-2">{errorPatta}</div>}
        {pattaHolders && (
          <div className="mt-2">
            <div className="font-medium text-xs text-gray-700 mb-1">Patta Holders:</div>
            <ul className="text-xs text-gray-800 space-y-1 max-h-32 overflow-y-auto">
              {pattaHolders.length === 0 && <li>No patta holders found.</li>}
              {pattaHolders.map((holder) => (
                <li key={holder.id} className="border-b pb-1 mb-1">
                  <div><span className="font-semibold">{holder.holder_name}</span> ({holder.patta_number})</div>
                  <div>Area: {holder.land_area_hectares} ha</div>
                  <div>Status: {holder.patta_status}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700" onClick={fetchLandParcels} disabled={loadingLand}>
          {loadingLand ? "Loading..." : "Show Land Parcels"}
        </Button>
        {errorLand && <div className="text-xs text-red-600 mt-2">{errorLand}</div>}
        {landParcels && (
          <div className="mt-2">
            <div className="font-medium text-xs text-gray-700 mb-1">Land Parcels:</div>
            <ul className="text-xs text-gray-800 space-y-1 max-h-32 overflow-y-auto">
              {landParcels.length === 0 && <li>No land parcels found.</li>}
              {landParcels.map((parcel) => (
                <li key={parcel.id} className="border-b pb-1 mb-1">
                  <div><span className="font-semibold">Parcel #{parcel.id}</span></div>
                  <div>Area: {parcel.area_hectares} ha</div>
                  <div>Type: {parcel.parcel_type}</div>
                  <div>Status: {parcel.status}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FRAClaimPopup;
