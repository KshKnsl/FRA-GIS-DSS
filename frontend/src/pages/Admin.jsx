import React, { useState, useEffect } from "react";
import { BarChart3, Users } from "lucide-react";
import { ClaimsStatusChart, MonthlyClaimsChart } from "./AdminCharts";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_claims: 0, granted_claims: 0, pending_claims: 0, total_granted_area: 0, approval_rate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/admin/stats')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          const data = result.data.overall;
          const approvalRate = data.total_claims > 0 ? ((data.approved_claims / data.total_claims) * 100).toFixed(1) : 0;
          setStats({
            total_claims: data.total_claims || 0,
            granted_claims: data.approved_claims || 0,
            pending_claims: data.pending_claims || 0,
            total_granted_area: data.total_area_granted || 0,
            approval_rate: approvalRate
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const exportData = async () => {
    try {
      const result = await (await fetch('http://localhost:4000/api/admin/stats')).json();
      if (!result.success) throw new Error('Failed to fetch data');

      const data = result.data;
      let csv = 'Category,Value\n';
      Object.entries(data.overall).forEach(([k, v]) => csv += `${k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())},${v}\n`);

      csv += '\nStatus Distribution\nStatus,Count\n';
      data.statusDistribution.forEach(item => csv += `${item.status},${item.count}\n`);

      csv += '\nState-wise Statistics\nState,Total Claims,Approved Claims,Pending Claims,Area Granted\n';
      data.stateWise.forEach(item => csv += `${item.state},${item.total_claims},${item.approved_claims},${item.pending_claims},${item.area_granted}\n`);

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fra_admin_data.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error exporting data');
    }
  };

  if (loading) return <div className="p-8 max-w-4xl mx-auto bg-background text-foreground flex justify-center items-center h-64"><div className="text-lg">Loading dashboard...</div></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-background text-foreground">
      <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" /> Admin Dashboard
      </h1>
      <p className="text-muted-foreground mb-6">Forest Rights Act implementation overview</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { title: "Total Claims", value: stats.total_claims.toLocaleString(), subtitle: "Across all states" },
          { title: "Approval Rate", value: `${stats.approval_rate}%`, subtitle: `${stats.granted_claims} approved claims` },
          { title: "Pending Claims", value: stats.pending_claims.toLocaleString(), subtitle: "Awaiting approval" },
          { title: "Granted Area", value: `${stats.total_granted_area.toLocaleString()} ha`, subtitle: "Total area approved" }
        ].map((card, i) => (
          <div key={i} className="bg-secondary rounded-lg p-4 shadow">
            <h2 className="font-semibold text-primary">{card.title}</h2>
            <div className="text-3xl font-bold text-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            <span className="text-xs text-primary">Live data from database</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-lg p-4 shadow">
          <h2 className="font-semibold text-primary mb-2">Claims Status Distribution</h2>
          <div className="border border-gray-200 rounded p-2"><ClaimsStatusChart /></div>
        </div>
        <div className="bg-card rounded-lg p-4 shadow">
          <h2 className="font-semibold text-primary mb-2">Monthly Claims Processed</h2>
          <div className="border border-gray-200 rounded p-2"><MonthlyClaimsChart /></div>
        </div>
        <div className="bg-card rounded-lg p-4 shadow">
          <h2 className="font-semibold text-primary mb-2">Data Quality</h2>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-foreground">{stats.approval_rate}%</span>
              <span className="text-xs text-muted-foreground">Approved</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-foreground">{(100 - parseFloat(stats.approval_rate)).toFixed(1)}%</span>
              <span className="text-xs text-muted-foreground">Pending/Rejected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-4 shadow mb-8">
        <h2 className="font-semibold text-primary mb-2">Quick Actions</h2>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Open FRA Atlas", action: () => navigate('/') },
            { label: "Run Decision Support", action: () => navigate('/decision-support') },
            { label: "Upload Legacy Docs", action: () => navigate('/documents') },
            { label: "Export Data (CSV)", action: exportData }
          ].map((btn, i) => (
            <button
              key={i}
              className="bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors"
              onClick={btn.action}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
