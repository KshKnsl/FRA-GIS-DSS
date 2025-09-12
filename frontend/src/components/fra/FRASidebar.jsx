
import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";


const FRASidebar = ({
  targetStates,
  selectedState,
  setSelectedState,
  showClaimModal,
  setShowClaimModal,
  claimForm,
  handleClaimFormChange,
  handleClaimSubmit,
  claimSubmitting,
  claimSuccess,
  uniqueDistricts,
  selectedDistrict,
  setSelectedDistrict,
  districtStats,
  selectedClaimType,
  setSelectedClaimType,
  showCoverageAreas,
  setShowCoverageAreas,
  showPattaHolders,
  setShowPattaHolders,
  fraVillages,
  fraClaims,
  filteredClaims,
  pattaHolders
}) => {
  return (
    <aside className="w-80 bg-white shadow-lg overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          FRA Atlas Control Panel
        </h2>
        {/* Add FRA Claim Button */}
        <div className="mb-6">
          <Button
            className="w-full mb-4"
            onClick={() => setShowClaimModal(true)}
          >
            Add New FRA Claim
          </Button>
          {/* Claim Modal */}
          {showClaimModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative z-[10000]">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                  onClick={() => {
                    setShowClaimModal(false);
                  }}
                >
                  &times;
                </button>
                <h2 className="text-lg font-bold mb-4 text-gray-800">
                  Submit New FRA Claim
                </h2>
                <form onSubmit={handleClaimSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Applicant Name
                    </label>
                    <input
                      type="text"
                      name="applicant_name"
                      value={claimForm.applicant_name}
                      onChange={handleClaimFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Community Name
                    </label>
                    <input
                      type="text"
                      name="community_name"
                      value={claimForm.community_name}
                      onChange={handleClaimFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Claim Type
                    </label>
                    <select
                      name="claim_type"
                      value={claimForm.claim_type}
                      onChange={handleClaimFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    >
                      <option value="IFR">Individual Forest Rights (IFR)</option>
                      <option value="CR">Community Rights (CR)</option>
                      <option value="CFR">Community Forest Resource Rights (CFR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Area (hectares)
                    </label>
                    <input
                      type="number"
                      name="area_hectares"
                      value={claimForm.area_hectares}
                      onChange={handleClaimFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Village Name
                    </label>
                    <input
                      type="text"
                      name="village_name"
                      value={claimForm.village_name}
                      onChange={handleClaimFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={claimForm.district}
                      onChange={handleClaimFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={claimForm.state}
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={claimForm.remarks}
                      onChange={handleClaimFormChange}
                      className="w-full px-3 py-2 border rounded"
                      rows={2}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    disabled={claimSubmitting}
                  >
                    {claimSubmitting ? "Submitting..." : "Submit Claim"}
                  </Button>
                  {claimSuccess && (
                    <div
                      className={`mt-2 text-center text-sm font-medium ${
                        claimSuccess.includes("success")
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {claimSuccess}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select State
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

        {/* District Selection and Stats */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select District (for stats)
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select District --</option>
            {uniqueDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {selectedDistrict && districtStats && (
            <div className="mt-3 bg-blue-50 p-3 rounded">
              <div className="font-semibold text-blue-800 mb-1">
                District Stats
              </div>
              <div className="text-xs text-gray-700 space-y-1">
                <div>
                  <span className="font-medium">Total Claims:</span> {districtStats.total_claims}
                </div>
                <div>
                  <span className="font-medium">Granted Claims:</span> {districtStats.granted_claims}
                </div>
                <div>
                  <span className="font-medium">Pending Claims:</span> {districtStats.pending_claims}
                </div>
                <div>
                  <span className="font-medium">IFR Claims:</span> {districtStats.ifr_claims}
                </div>
                <div>
                  <span className="font-medium">CR Claims:</span> {districtStats.cr_claims}
                </div>
                <div>
                  <span className="font-medium">CFR Claims:</span> {districtStats.cfr_claims}
                </div>
                <div>
                  <span className="font-medium">Total Granted Area:</span> {districtStats.total_granted_area} ha
                </div>
              </div>
            </div>
          )}
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

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <a
              href={`/fra-dashboard/${selectedState}`}
              className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors"
            >
              View Dashboard
            </a>
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
    </aside>
  );
};

export default FRASidebar;
