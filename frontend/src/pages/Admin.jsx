import React, { useState, useEffect } from "react";
import { BarChart3, Users, CheckCircle, Clock, PieChart, ThumbsUp, Database, FileUp, Map as MapIcon } from "lucide-react"; // Renamed Map to MapIcon
import { ClaimsStatusChart, MonthlyClaimsChart } from "./AdminCharts";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_claims: 0,
    approved_claims: 0,
    pending_claims: 0,
    total_area_granted: 0,
    approval_rate: 0,
    digitized_claims_percent: 0,
    geo_referenced_claims_percent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          const overall = result.data.overall;
          const quality = result.data.dataQuality;
          const approvalRate = overall.total_claims > 0 ? ((overall.approved_claims / overall.total_claims) * 100).toFixed(1) : 0;
          const digitizedPercent = quality.total_claims > 0 ? ((quality.digitized_claims / quality.total_claims) * 100).toFixed(1) : 0;
          const geoReferencedPercent = quality.total_claims > 0 ? ((quality.geo_referenced_claims / quality.total_claims) * 100).toFixed(1) : 0;

          setStats({
            total_claims: overall.total_claims || 0,
            approved_claims: overall.approved_claims || 0,
            pending_claims: overall.pending_claims || 0,
            total_area_granted: parseFloat(overall.total_area_granted || 0).toLocaleString(),
            approval_rate: approvalRate,
            digitized_claims_percent: digitizedPercent,
            geo_referenced_claims_percent: geoReferencedPercent,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ title, value, icon, subtitle }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-background text-foreground">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Forest Rights Act implementation overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Claims" value={stats.total_claims.toLocaleString()} subtitle="Across all states" icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Approval Rate" value={`${stats.approval_rate}%`} subtitle={`${stats.approved_claims.toLocaleString()} approved claims`} icon={<ThumbsUp className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Pending Claims" value={stats.pending_claims.toLocaleString()} subtitle="Awaiting approval" icon={<Clock className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Granted Area (ha)" value={stats.total_granted_area} subtitle="Total area approved" icon={<MapIcon className="h-5 w-5 text-muted-foreground" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Claims Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyClaimsChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claims Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ClaimsStatusChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Quality</CardTitle>
            <p className="text-xs text-muted-foreground pt-1">Metrics for data integrity</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Digitized Claims</span>
                <span className="text-sm font-bold">{stats.digitized_claims_percent}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${stats.digitized_claims_percent}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Geo-Referenced Claims</span>
                <span className="text-sm font-bold">{stats.geo_referenced_claims_percent}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-secondary-foreground h-2.5 rounded-full" style={{ width: `${stats.geo_referenced_claims_percent}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-xs text-muted-foreground pt-1">Navigate to key sections of the application</p>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" onClick={() => navigate('/')}>
              <MapIcon className="mr-2 h-4 w-4" /> Open FRA Atlas
            </Button>
            <Button className="flex-1" variant="secondary" onClick={() => navigate('/decision-support')}>
              <Database className="mr-2 h-4 w-4" /> Run Decision Support
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => navigate('/documents')}>
              <FileUp className="mr-2 h-4 w-4" /> Upload Legacy Docs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;