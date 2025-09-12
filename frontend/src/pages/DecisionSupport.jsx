import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AlertCircle, CheckCircle, TrendingUp, Users, MapPin, Target, Zap, Droplets, Home, GraduationCap, Heart } from "lucide-react";

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
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [villagesLoading, setVillagesLoading] = useState(false);
  const [filters, setFilters] = useState({
    waterIndex: "",
    agricultureArea: "",
    povertyScore: "",
    forestDegradation: "",
    tribalPopulation: ""
  });

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    fetchDistricts();
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchVillages();
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedVillage) {
      fetchVillageData();
      generateRecommendations();
    }
  }, [selectedVillage, filters]);

  const fetchSchemes = async () => {
    setSchemesLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/decision-support/schemes`);
      const data = await response.json();
      if (data.success) {
        const transformedSchemes = data.data.map(scheme => ({
          ...scheme,
          icon: getSchemeIcon(scheme.category),
          eligibility: Array.isArray(scheme.eligibility) ? scheme.eligibility : ["FRA patta holder"],
          benefits: Array.isArray(scheme.benefits) ? scheme.benefits : ["Scheme benefits available"]
        }));
        setSchemes(transformedSchemes);
      } else {
        setSchemes([]);
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
      setSchemes([]);
    }
    setSchemesLoading(false);
  };

  const fetchDistricts = async () => {
    setDistrictsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/villages?state=${selectedState}`);
      const data = await response.json();
      if (data.success) {
        const uniqueDistricts = [...new Set(data.data?.map(v => v.district) || [])];
        setDistricts(uniqueDistricts);
        console.log('Districts loaded:', uniqueDistricts);
      } else {
        setDistricts([]);
        console.error('Failed to load districts:', data);
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
        console.log('Villages loaded for district', selectedDistrict, ':', districtVillages);
      } else {
        setVillages([]);
        console.error('Failed to load villages:', data);
      }
    } catch (error) {
      console.error("Error fetching villages:", error);
      setVillages([]);
    } finally {
      setVillagesLoading(false);
    }
  };

  const fetchVillageData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/villages/${selectedVillage}/enhanced`);
      const data = await response.json();
      if (data.success) {
        setVillageData(data.village);
      } else {
        setVillageData(null);
      }
    } catch (error) {
      console.error("Error fetching village data:", error);
      setVillageData(null);
    }
    setLoading(false);
  };

  const generateRecommendations = async () => {
    if (!selectedVillage) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/decision-support/recommendations/${selectedVillage}`);
      const data = await response.json();

      if (data.success) {
        const transformedRecommendations = data.recommendations.map(rec => {
          const schemeData = schemes.find(s => s.name.toLowerCase().includes(rec.scheme.toLowerCase().replace(/\s+/g, '_')));
          return {
            ...rec,
            icon: schemeData?.icon || <Target className="w-5 h-5" />,
            category: schemeData?.category || "General",
            description: schemeData?.description || rec.scheme,
            eligibility: Array.isArray(schemeData?.eligibility) ? schemeData.eligibility : ["FRA patta holder"],
            benefits: Array.isArray(schemeData?.benefits) ? schemeData.benefits : ["Scheme benefits available"],
            reasons: rec.reason ? [rec.reason] : []
          };
        });
        setRecommendations(transformedRecommendations);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    }
    setLoading(false);
  };



  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-destructive/10 text-destructive";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSchemeIcon = (category) => {
    switch (category) {
      case "Agriculture":
      case "Financial Assistance":
        return <Home className="w-5 h-5" />;
      case "Water":
      case "Infrastructure":
        return <Droplets className="w-5 h-5" />;
      case "Employment":
        return <Users className="w-5 h-5" />;
      case "Housing":
        return <Home className="w-5 h-5" />;
      case "Nutrition":
        return <Heart className="w-5 h-5" />;
      case "Skill Development":
      case "Livelihood":
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-background text-foreground">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8 text-primary" />
          Decision Support System
        </h1>
        <p className="text-muted-foreground text-lg">
          AI-powered scheme recommendations for FRA villages and patta holders
        </p>
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Village Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Scheme Recommendations</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          {/* Location Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Select Location for Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                      <SelectItem value="Tripura">Tripura</SelectItem>
                      <SelectItem value="Odisha">Odisha</SelectItem>
                      <SelectItem value="Telangana">Telangana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="district">District</Label>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={districts.length === 0 || districtsLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        districtsLoading ? "Loading districts..." :
                        districts.length === 0 ? "No districts available" : "Select District"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="village">Village</Label>
                  <Select value={selectedVillage} onValueChange={setSelectedVillage} disabled={villages.length === 0 || villagesLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        villagesLoading ? "Loading villages..." :
                        villages.length === 0 ? "No villages available" : "Select Village"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {villages.map(village => (
                        <SelectItem key={village.village_name} value={village.village_name}>
                          {village.village_name} ({village.total_pattas} pattas)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Village Parameters */}
          {selectedVillage && (
            <Card>
              <CardHeader>
                <CardTitle>Village Parameters & Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="waterIndex">Water Index (0-1)</Label>
                    <Input
                      id="waterIndex"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={filters.waterIndex}
                      onChange={(e) => handleFilterChange("waterIndex", e.target.value)}
                      placeholder="0.3"
                    />
                  </div>

                  <div>
                    <Label htmlFor="agricultureArea">Agriculture Area (hectares)</Label>
                    <Input
                      id="agricultureArea"
                      type="number"
                      value={filters.agricultureArea}
                      onChange={(e) => handleFilterChange("agricultureArea", e.target.value)}
                      placeholder="150"
                    />
                  </div>

                  <div>
                    <Label htmlFor="povertyScore">Poverty Score (%)</Label>
                    <Input
                      id="povertyScore"
                      type="number"
                      min="0"
                      max="100"
                      value={filters.povertyScore}
                      onChange={(e) => handleFilterChange("povertyScore", e.target.value)}
                      placeholder="65"
                    />
                  </div>

                  <div>
                    <Label htmlFor="forestDegradation">Forest Degradation</Label>
                    <Select value={filters.forestDegradation} onValueChange={(value) => handleFilterChange("forestDegradation", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tribalPopulation">Tribal Population (%)</Label>
                    <Input
                      id="tribalPopulation"
                      type="number"
                      min="0"
                      max="100"
                      value={filters.tribalPopulation}
                      onChange={(e) => handleFilterChange("tribalPopulation", e.target.value)}
                      placeholder="75"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Village Data Display */}
          {villageData && (
            <Card>
              <CardHeader>
                <CardTitle>Village Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{villageData.total_population}</div>
                    <div className="text-sm text-muted-foreground">Total Population</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{villageData.tribal_population}</div>
                    <div className="text-sm text-muted-foreground">Tribal Population</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{villageData.total_households}</div>
                    <div className="text-sm text-muted-foreground">Households</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{villageData.fra_claims?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">FRA Claims</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Recommendations Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-primary mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {recommendations.filter(r => r.priority === "High").length}
                    </div>
                    <div className="text-sm text-muted-foreground">High Priority</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertCircle className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {recommendations.filter(r => r.priority === "Medium").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Medium Priority</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {recommendations.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Recommendations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((scheme, index) => (
                <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {scheme.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{scheme.name}</h3>
                            <Badge className={getPriorityColor(scheme.priority)}>
                              {scheme.priority}
                            </Badge>
                            <Badge variant="outline">
                              {getSchemeIcon(scheme.category)}
                              <span className="ml-1">{scheme.category}</span>
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{scheme.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Eligibility Criteria:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {scheme.eligibility.map((criteria, idx) => (
                                  <li key={idx} className="flex items-center">
                                    <CheckCircle className="w-3 h-3 text-primary mr-2" />
                                    {criteria}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2">Benefits:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {scheme.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex items-center">
                                    <Target className="w-3 h-3 text-primary mr-2" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {scheme.reasons.length > 0 && (
                            <div className="bg-secondary p-3 rounded-lg">
                              <h4 className="font-medium text-sm text-secondary-foreground mb-2">AI Recommendation Reasons:</h4>
                              <ul className="text-sm text-secondary-foreground space-y-1">
                                {scheme.reasons.map((reason, idx) => (
                                  <li key={idx} className="flex items-center">
                                    <Zap className="w-3 h-3 mr-2" />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {scheme.score}%
                        </div>
                        <div className="text-sm text-muted-foreground">Match Score</div>
                        <Button className="mt-2" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations Found</h3>
                  <p className="text-muted-foreground">
                    {selectedVillage
                      ? "Adjust your filters or village parameters to see scheme recommendations."
                      : "Select a village to generate AI-powered scheme recommendations."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="eligibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Matrix - Central Sector Schemes</CardTitle>
            </CardHeader>
            <CardContent>
              {schemesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading schemes...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-3 text-left">Scheme</th>
                        <th className="border border-border p-3 text-left">Category</th>
                        <th className="border border-border p-3 text-left">FRA Patta Holder</th>
                        <th className="border border-border p-3 text-left">Land Criteria</th>
                        <th className="border border-border p-3 text-left">Income Criteria</th>
                        <th className="border border-border p-3 text-left">Other Conditions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schemes.map((scheme) => (
                        <tr key={scheme.id} className="hover:bg-muted/50">
                          <td className="border border-border p-3 font-medium">{scheme.name}</td>
                          <td className="border border-border p-3">{scheme.category}</td>
                          <td className="border border-border p-3">
                            <Badge className="bg-primary/10 text-primary">Eligible</Badge>
                          </td>
                          <td className="border border-border p-3 text-sm">
                            {scheme.eligibility.find(e => e.includes("Land")) || "N/A"}
                          </td>
                          <td className="border border-border p-3 text-sm">
                            {scheme.eligibility.find(e => e.includes("BPL") || e.includes("poverty")) || "N/A"}
                          </td>
                          <td className="border border-border p-3 text-sm">
                            {scheme.eligibility.filter(e => !e.includes("Land") && !e.includes("BPL") && !e.includes("poverty")).join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DecisionSupport;
