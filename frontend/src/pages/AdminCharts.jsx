import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

const COLORS = ["#22c55e", "#facc15", "#ef4444"];

export function ClaimsStatusChart() {
  const [statusData, setStatusData] = useState([
    { name: "Approved", value: 0 },
    { name: "Pending", value: 0 },
    { name: "Rejected", value: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats`);
        const result = await response.json();

        if (result.success) {
          const data = result.data.statusDistribution;
          const processedData = [
            {
              name: "Approved",
              value: parseInt(
                data.find((s) => s.status === "granted")?.count || 0
              ),
            },
            {
              name: "Pending",
              value: parseInt(
                (data.find((s) => s.status === "pending")?.count || 0) +
                (data.find((s) => s.status === "under_review")?.count || 0)
              ),
            },
            {
              name: "Rejected",
              value: parseInt(
                data.find((s) => s.status === "rejected")?.count || 0
              ),
            },
          ];
          setStatusData(processedData);
        }
      } catch (error) {
        console.error("Error fetching status data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  const hasData = statusData.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={statusData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          labelLine={false}
          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {statusData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyClaimsChart() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/monthly-trends`
        );
        const result = await response.json();

        if (result.success) {
          const processedData = result.data.map((item) => ({
            ...item,
            value: parseInt(item.value),
          }));
          setMonthlyData(processedData);
        }
      } catch (error) {
        console.error("Error fetching monthly data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={monthlyData}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
        />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}