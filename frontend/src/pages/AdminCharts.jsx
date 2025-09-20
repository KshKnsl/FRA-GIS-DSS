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
} from "recharts";

const COLORS = ["#22c55e", "#fde68a", "#ef4444"];

export function ClaimsStatusChart() {
  const [statusData, setStatusData] = useState([
    { name: "Approved", value: 0 },
    { name: "Pending", value: 0 },
    { name: "Rejected", value: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatusData = async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats`);
      const result = await response.json();

      if (result.success) {
        const data = result.data.statusDistribution; // Access nested status distribution data
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

        console.log("Processed status data:", processedData);
        setStatusData(processedData);
      }
      setLoading(false);
    };

    fetchStatusData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">Loading...</div>
    );
  }

  
  const hasData = statusData.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="flex justify-center items-center h-32 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={statusData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={60}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {statusData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
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
          console.log("Processed monthly data:", processedData);
          setMonthlyData(processedData);
        }
      } catch (error) {
        console.error("Error fetching monthly data:", error);
        // Fallback to sample data if API fails
        setMonthlyData([
          { month: "Jan", value: 110 },
          { month: "Feb", value: 95 },
          { month: "Mar", value: 120 },
          { month: "Apr", value: 130 },
          { month: "May", value: 140 },
          { month: "Jun", value: 125 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">Loading...</div>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <div className="flex justify-center items-center h-32 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={monthlyData}>
        <XAxis dataKey="month" stroke="#166534" fontSize={12} />
        <YAxis stroke="#166534" fontSize={12} />
        <Tooltip />
        <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
