import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
} from "recharts";
import {
  Paper,
  Title,
  Button,
  LoadingOverlay,
  Text,
  Container,
} from "@mantine/core";
import api from "../../api";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a4de6c",
  "#d0ed57",
];

const CategoryTrendsChart = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/v1/reports/categoryTrends");

      if (response.data.data) {
        setCategories(response.data.data.categories);
        setData(response.data.data.data);
      }
    } catch (error) {
      console.error("Error fetching category trends:", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data.length) return;

    const csvContent = [
      ["Month", ...categories],
      ...data.map((item) => [
        item.month,
        ...categories.map((category) => item[category] || 0),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "category-trends.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <p
            style={{ margin: "0 0 5px", fontWeight: "bold" }}
          >{`Month: ${label}`}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{
                color: entry.color,
                margin: "3px 0",
                fontSize: "0.9em",
              }}
            >
              {`${entry.name}: ₹${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Container fluid p={0}>
      <Paper
        p="md"
        shadow="sm"
        style={{
          position: "relative",
          minHeight: "500px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <LoadingOverlay visible={loading} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            width: "100%",
          }}
        >
          <Title order={2}>Category Spending Trends</Title>
          <Button onClick={handleExport} disabled={!data.length}>
            Export
          </Button>
        </div>

        {data.length > 0 ? (
          <div style={{ width: "100%", height: "500px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  height={36}
                  wrapperStyle={{
                    paddingTop: "20px",
                  }}
                />
                {categories.map((category, index) => (
                  <Area
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
                <Brush
                  dataKey="month"
                  height={30}
                  stroke="#8884d8"
                  startIndex={Math.max(0, data.length - 6)}
                  endIndex={data.length - 1}
                  travellerWidth={10}
                  fill="#f5f5f5"
                  style={{ marginTop: "20px" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          !loading && (
            <Text align="center" color="dimmed">
              No data available
            </Text>
          )
        )}
      </Paper>
    </Container>
  );
};

export default CategoryTrendsChart;
