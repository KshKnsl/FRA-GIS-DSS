import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import DistrictDetailsModal from '../components/ui/DistrictDetailsModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart3, Check, Clock, Map } from 'lucide-react';

const COLORS = {
  IFR: '#3B82F6', // Blue
  CR: '#10B981',  // Green
  CFR: '#F59E0B'  // Orange
};

const FRADashboard = () => {
  const { state } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtModalOpen, setDistrictModalOpen] = useState(false);
  const [districtDetails, setDistrictDetails] = useState(null);
  const [districtLoading, setDistrictLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [state]);

  const fetchDistrictDetails = async (district) => {
    setDistrictLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/stats/${state}/${district.district}`);
      const data = await response.json();
      
      if (data.success) {
        setDistrictDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching district details:', error);
    }
    setDistrictLoading(false);
  };

  const handleViewDetails = async (district) => {
    setSelectedDistrict(district);
    setDistrictModalOpen(true);
    await fetchDistrictDetails(district);
  };

  const closeModal = () => {
    setDistrictModalOpen(false);
    setSelectedDistrict(null);
    setDistrictDetails(null);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fra/dashboard/${state}`);
      const data = await response.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">No data available</h2>
        <p className="text-muted-foreground">Unable to load dashboard data for {state}</p>
      </div>
    );
  }

  const { statistics, districts } = dashboardData;

  const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  const claimTypeData = [
    { name: 'IFR', value: parseInt(statistics.ifr_claims || 0) },
    { name: 'CR', value: parseInt(statistics.cr_claims || 0) },
    { name: 'CFR', value: parseInt(statistics.cfr_claims || 0) },
  ];
  
  const totalClaimsForPie = claimTypeData.reduce((acc, curr) => acc + curr.value, 0);


  const StatCard = ({ title, value, icon, subtitle }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">FRA Dashboard</h1>
          <p className="text-muted-foreground mt-1">{state} - Forest Rights Act Implementation Status</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Claims" value={statistics.total_claims} icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} subtitle="All FRA applications" />
          <StatCard title="Granted Claims" value={statistics.granted_claims} icon={<Check className="h-4 w-4 text-muted-foreground" />} subtitle={`${calculatePercentage(statistics.granted_claims, statistics.total_claims)}% success rate`} />
          <StatCard title="Pending Claims" value={statistics.pending_claims} icon={<Clock className="h-4 w-4 text-muted-foreground" />} subtitle={`${calculatePercentage(statistics.pending_claims, statistics.total_claims)}% pending`} />
          <StatCard title="Total Area" value={`${parseFloat(statistics.total_granted_area || 0).toFixed(1)} ha`} icon={<Map className="h-4 w-4 text-muted-foreground" />} subtitle="Hectares under FRA" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Claim Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {totalClaimsForPie > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={claimTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {claimTypeData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px]">
                  <p className="text-muted-foreground">No claim type data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Implementation Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Granted Claims</span>
                  <span>{calculatePercentage(statistics.granted_claims, statistics.total_claims)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${calculatePercentage(statistics.granted_claims, statistics.total_claims)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pending Claims</span>
                  <span>{calculatePercentage(statistics.pending_claims, statistics.total_claims)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${calculatePercentage(statistics.pending_claims, statistics.total_claims)}%` }}></div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-secondary rounded-lg">
                <p className="text-sm text-secondary-foreground">
                  <strong>Implementation Rate:</strong> {calculatePercentage(statistics.granted_claims, statistics.total_claims)}% of claims have been successfully granted.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>District-wise Implementation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">District</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Claims</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Granted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Success Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {districts.map((district, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{district.district}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{district.claims_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{district.granted_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={
                          calculatePercentage(district.granted_count, district.claims_count) > 70 
                            ? 'bg-primary/10 text-primary' 
                            : calculatePercentage(district.granted_count, district.claims_count) > 40
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-destructive/10 text-destructive'
                        }>
                          {calculatePercentage(district.granted_count, district.claims_count)}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button onClick={() => handleViewDetails(district)} className="text-primary hover:text-primary/80 font-medium">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <DistrictDetailsModal
        isOpen={districtModalOpen}
        onClose={closeModal}
        district={selectedDistrict}
        districtData={districtDetails}
        loading={districtLoading}
      />
    </div>
  );
};

export default FRADashboard;