import React from "react";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";

const ControlPanel = ({
  showFraVillages,
  setShowFraVillages,
  showCoverageAreas,
  setShowCoverageAreas,
  showPattaHolders,
  setShowPattaHolders,
  baseMapLayer,
  setBaseMapLayer,
  targetStates,
  selectedState,
  setSelectedState,
  selectedClaimType,
  setSelectedClaimType,
  selectedDistrict,
  setSelectedDistrict,
  uniqueDistricts,
  fraVillages,
  filteredClaims,
  pattaHolders,
  showMapControls,
  setShowMapControls,
  districtStats,
  overlayOpacity,
  setOverlayOpacity
}) => {
  return (
    <Card className={`p-4 w-full shadow-lg ${showMapControls ? 'space-y-4' : 'space-y-2'}`}>
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-primary text-base">Map Controls</h4>
        <button
          className="bg-muted px-2 py-1 rounded text-xs font-medium border border-border hover:bg-background"
          onClick={() => setShowMapControls((prev) => !prev)}
          aria-label={showMapControls ? "Hide Map Controls" : "Show Map Controls"}
        >
          {showMapControls ? "Hide" : "Show"}
        </button>
      </div>
      {showMapControls && (
        <>
          <div className="space-y-3">
            <div>
              <Label htmlFor="state-select">Select State</Label>
              <Select
                value={selectedState}
                onValueChange={setSelectedState}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All States">All States</SelectItem>
                  {targetStates.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="claim-type-select">Filter by Claim Type</Label>
              <Select
                value={selectedClaimType}
                onValueChange={setSelectedClaimType}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select claim type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="IFR">Individual Forest Rights (IFR)</SelectItem>
                  <SelectItem value="CR">Community Rights (CR)</SelectItem>
                  <SelectItem value="CFR">Community Forest Resource Rights (CFR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="district-select">Select District</Label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select a district" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueDistricts.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Overlay Opacity</Label>
              <Slider
                value={[overlayOpacity]}
                onValueChange={(value) => setOverlayOpacity(value[0])}
                max={1}
                min={0.1}
                step={0.01}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">{Math.round(overlayOpacity * 100)}%</div>
            </div>
            <div className="space-y-2">
              <Label>Map Layers & Overlays</Label>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showFraVillages}
                    onCheckedChange={setShowFraVillages}
                  />
                  <span className="text-xs">FRA Villages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showCoverageAreas}
                    onCheckedChange={setShowCoverageAreas}
                  />
                  <span className="text-xs">FRA Coverage Areas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showPattaHolders}
                    onCheckedChange={setShowPattaHolders}
                  />
                  <span className="text-xs">Patta Holders</span>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="base-map-select">Base Map Layer</Label>
              <Select
                value={baseMapLayer}
                onValueChange={setBaseMapLayer}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select base map" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpenStreetMap">OpenStreetMap</SelectItem>
                  <SelectItem value="SurveyOfIndia">Survey of India Topo</SelectItem>
                  <SelectItem value="Esri">Esri World Imagery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
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
            {selectedDistrict && districtStats && (
              <Card className="bg-blue-50 dark:bg-blue-900 p-3 mt-2">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 text-sm">
                  {selectedDistrict} District
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Total Claims:</span>
                    <span className="font-medium">{districtStats.total_claims}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Granted:</span>
                    <span className="font-medium text-primary">{districtStats.granted_claims}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="font-medium text-yellow-600 dark:text-yellow-300">{districtStats.pending_claims}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Area Granted:</span>
                    <span className="font-medium">{districtStats.total_granted_area} ha</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default ControlPanel;
