import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

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
    <Card className={cn("w-full shadow-lg transition-all duration-300 bg-card/95 backdrop-blur-sm")}>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-base font-semibold">Map Controls</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMapControls((prev) => !prev)}
          aria-label={showMapControls ? "Hide Map Controls" : "Show Map Controls"}
        >
          {showMapControls ? "Hide" : "Show"}
        </Button>
      </CardHeader>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          showMapControls ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className="p-4 pt-0">
          <ScrollArea className="max-h-[calc(100vh-15rem)] pr-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="state-select">Select State</Label>
                <Select
                  value={selectedState}
                  onValueChange={setSelectedState}
                >
                  <SelectTrigger id="state-select" className="w-full mt-1">
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger id="claim-type-select" className="w-full mt-1">
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
                  value={selectedDistrict || 'all-districts'}
                  onValueChange={(value) => setSelectedDistrict(value === 'all-districts' ? '' : value)}
                >
                  <SelectTrigger id="district-select" className="w-full mt-1">
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-districts">All Districts</SelectItem>
                    {uniqueDistricts && uniqueDistricts.filter(d => d).map((d, index) => (
                      <SelectItem key={`${d}-${index}`} value={d}>{d}</SelectItem>
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
                <div className="text-xs text-muted-foreground text-right">{Math.round(overlayOpacity * 100)}%</div>
              </div>
              <div className="space-y-3">
                <Label>Map Layers & Overlays</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">FRA Villages</span>
                  <Switch
                    checked={showFraVillages}
                    onCheckedChange={setShowFraVillages}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">FRA Coverage Areas</span>
                  <Switch
                    checked={showCoverageAreas}
                    onCheckedChange={setShowCoverageAreas}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Patta Holders</span>
                  <Switch
                    checked={showPattaHolders}
                    onCheckedChange={setShowPattaHolders}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="base-map-select">Base Map Layer</Label>
                <Select
                  value={baseMapLayer}
                  onValueChange={setBaseMapLayer}
                >
                  <SelectTrigger id="base-map-select" className="w-full mt-1">
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
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Villages:</span>
                  <span className="font-medium text-foreground">{fraVillages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Claims:</span>
                  <span className="font-medium text-foreground">{filteredClaims.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Patta Holders:</span>
                  <span className="font-medium text-foreground">{pattaHolders.length}</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </div>
    </Card>
  );
};

export default ControlPanel;