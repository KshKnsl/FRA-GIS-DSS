import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle, CheckCircle, TrendingUp, Users, MapPin, Target, Zap, Droplets, Home, GraduationCap, Heart, BrainCircuit } from "lucide-react";

const DecisionSupport = () => {
  const [selectedState, setSelectedState] = useState("Madhya Pradesh");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [villageData, setVillageData] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [villagesLoading, setVillagesLoading] = useState(false);
  const [filters, setFilters] = useState({
    waterIndex: "0.3",
    povertyScore: "65",
    forestDegradation: "medium",
  });

  useEffect(() => {
    fetchDistricts();
    setSelectedDistrict("");
    setSelectedVillage("");
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchVillages();
      setSelectedVillage("");
    }
  }, [selectedDistrict]);

  const fetchDistricts = async () => {
    setDistrictsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/villages?state=${selectedState}`);
      const data = await response.json();
      if (data.success) {
        const uniqueDistricts = [...new Set(data.data?.map(v => v.district).filter(Boolean) || [])];
        setDistricts(uniqueDistricts);
      } else {
        setDistricts([]);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
    } finally {
      setDistrictsLoading(false);
    }
  };

  const fetchVillages = async () => {
    if (!selectedDistrict) return;
    setVillagesLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/villages?state=${selectedState}`);
      const data = await response.json();
      if (data.success) {
        const districtVillages = data.data?.filter(v => v.district === selectedDistrict) || [];
        setVillages(districtVillages);
      } else {
        setVillages([]);
      }
    } catch (error) {
      console.error("Error fetching villages:", error);
      setVillages([]);
    } finally {
      setVillagesLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (!selectedVillage) return;
    setLoading(true);
    setRecommendations([]);
    setVillageData(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/decision-support/recommendations/${encodeURIComponent(selectedVillage)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const transformedRecs = data.recommendations.map(rec => ({
          ...rec,
          icon: getSchemeIcon(rec.name),
        }));
        setRecommendations(transformedRecs);
        setVillageData(data.village);
      } else {
        console.error("Failed to get recommendations:", data.message);
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-destructive/10 text-destructive";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "Low": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSchemeIcon = (schemeName) => {
    const name = schemeName.toLowerCase();
    if (name.includes('kisan')) return <Home className="w-5 h-5 text-primary" />;
    if (name.includes('jal jeevan')) return <Droplets className="w-5 h-5 text-blue-500" />;
    if (name.includes('mgnrega')) return <Users className="w-5 h-5 text-orange-500" />;
    if (name.includes('awas')) return <Home className="w-5 h-5 text-green-500" />;
    if (name.includes('health')) return <Heart className="w-5 h-5 text-red-500" />;
    if (name.includes('van dhan')) return <GraduationCap className="w-5 h-5 text-yellow-500" />;
    return <Target className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-background text-foreground">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-primary" />
          Decision Support System
        </h1>
        <p className="text-muted-foreground text-lg">
          AI-powered scheme recommendations for FRA villages and patta holders
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">1. Select Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* State, District, Village selectors */}
              <div>
                <Label>State</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                    <SelectItem value="Tripura">Tripura</SelectItem>
                    <SelectItem value="Odisha">Odisha</SelectItem>
                    <SelectItem value="Telangana">Telangana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>District</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={districts.length === 0 || districtsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={districtsLoading ? "Loading..." : "Select District"} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Village</Label>
                <Select value={selectedVillage} onValueChange={setSelectedVillage} disabled={villages.length === 0 || villagesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={villagesLoading ? "Loading..." : "Select Village"} />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map(v => <SelectItem key={v.village_name} value={v.village_name}>{v.village_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">2. Adjust Parameters</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Filter inputs */}
              <div>
                <Label>Water Index (0-1)</Label>
                <Input type="number" step="0.1" min="0" max="1" value={filters.waterIndex} onChange={(e) => handleFilterChange("waterIndex", e.target.value)} />
              </div>
              <div>
                <Label>Poverty Score (%)</Label>
                <Input type="number" min="0" max="100" value={filters.povertyScore} onChange={(e) => handleFilterChange("povertyScore", e.target.value)} />
              </div>
              <div>
                <Label>Forest Degradation</Label>
                <Select value={filters.forestDegradation} onValueChange={(value) => handleFilterChange("forestDegradation", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Button onClick={generateRecommendations} disabled={!selectedVillage || loading} className="w-full text-lg py-6">
            {loading ? "Analyzing..." : "Generate AI Recommendations"}
          </Button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Results display */}
          {loading ? (
             <Card className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">AI is analyzing data...</p>
                </div>
             </Card>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
               {villageData && (
                <Card>
                    <CardHeader><CardTitle>Overview for {villageData.village_name}</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div><p className="text-2xl font-bold">{villageData.total_population}</p><p className="text-xs text-muted-foreground">Population</p></div>
                        <div><p className="text-2xl font-bold">{villageData.tribal_population}</p><p className="text-xs text-muted-foreground">Tribal Population</p></div>
                        <div><p className="text-2xl font-bold">{villageData.fra_pattas_count}</p><p className="text-xs text-muted-foreground">FRA Pattas</p></div>
                        <div><p className="text-2xl font-bold">{villageData.forest_cover_percentage}%</p><p className="text-xs text-muted-foreground">Forest Cover</p></div>
                    </CardContent>
                </Card>
               )}
              {recommendations.map((rec, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-primary/10 rounded-full">{rec.icon}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{rec.name}</h3>
                            <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                          </div>
                          <div className="bg-muted p-3 rounded-lg mt-2">
                            <h4 className="font-medium text-sm text-foreground mb-1">AI Recommendation Reasons:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {rec.reasons.map((reason, idx) => (
                                <li key={idx} className="flex items-center gap-2"><Zap className="w-3 h-3 text-primary"/>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-2xl font-bold text-primary mb-1">{rec.match_score}%</div>
                        <div className="text-sm text-muted-foreground">Match Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <Card className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center p-6">
                  <BrainCircuit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Awaiting Analysis</h3>
                  <p className="text-muted-foreground">
                    Select a village and click "Generate AI Recommendations" to get started.
                  </p>
                </div>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecisionSupport;