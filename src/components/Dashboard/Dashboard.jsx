import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Text,
  Title,
  Stack,
  Group,
  NumberInput,
  Loader,
} from "@mantine/core";
import Papa from "papaparse"; // Import PapaParse
import {
  processTransactionData,
  processTransactionDataForDisplay,
} from "../../utils/dashboardUtils";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../api";

const PIE_COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]; // Colors for pie chart
const BAR_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
]; // Colors for bar chart

function Dashboard() {
  const [pieChartData, setPieChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [totalExpense, setTotalExpense] = useState(0);

  const getGroupByCategory = async () => {
    const response = await api.get(
      `/api/v1/reports/groupByCategory?field=category`
    );
    const totalExpense = response.data.data.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    setTotalExpense(totalExpense);

    const pieChartData = response?.data?.data
      .map((item, index) => ({
        name: item._id,
        value: item.amount,
        percentage: Math.round((item.amount / totalExpense) * 100),
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }))
      .slice(0, 5);
    setPieChartData(pieChartData || []);
  };

  const getGroupByMode = async () => {
    const response = await api.get(
      `/api/v1/reports/groupByCategory?field=mode`
    );
    const totalExpense = response.data.data.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const barChartData = response?.data?.data
      .map((item, index) => ({
        name: item._id,
        value: item.amount,
        percentage: Math.round((item.amount / totalExpense) * 100),
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }))
      .slice(0, 5);

    setBarChartData(barChartData || []);
  };

  useEffect(() => {
    getGroupByMode();
    getGroupByCategory();
  }, []);

  return (
    <Stack spacing="lg" mt="lg">
      <Grid gutter="lg">
        <Grid.Col span={12}>
          <Paper shadow="sm" p="md" radius="md">
            <Text size="sm" c="dimmed">
              Total Expenses
            </Text>
            <Title order={3}>
              ₹
              {totalExpense.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Title>
          </Paper>
        </Grid.Col>
        {/* Monthly Total Expenses Card */}
        {/* <Grid.Col span={4}>
          <Paper shadow="sm" p="md" radius="md">
            <Text size="sm" c="dimmed">
              Monthly Total Expenses
            </Text>
            <Title order={3}>
              ₹
              {monthlyExpense.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Title>
          </Paper>
        </Grid.Col> */}
        {/* Pie Chart for Category Distribution */}
        <Grid.Col span={6}>
          <Paper shadow="sm" p="md" radius="md">
            <Title order={4}>Expenses by Category</Title>
            <PieChart width={400} height={300}>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {pieChartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${props.payload.percentage}%`,
                  name,
                ]} // Show percentage in tooltip
              />
              <Legend />
            </PieChart>
            {/* Display actual values next to labels */}
            <div style={{ marginTop: "10px" }}>
              {pieChartData?.map((entry, index) => (
                <div key={`label-${index}`} style={{ color: entry.fill }}>
                  <span
                    style={{
                      backgroundColor: entry.fill,
                      padding: "5px",
                      borderRadius: "5px",
                      marginRight: "5px",
                    }}
                  ></span>
                  {entry.name}: ₹{entry.value.toFixed(2)}{" "}
                </div>
              ))}
            </div>
          </Paper>
        </Grid.Col>
        <Grid.Col span={6}>
          <Paper shadow="sm" p="md" radius="md">
            <Title order={4}>Payment Mode Distribution</Title>
            <BarChart width={400} height={300} data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" radius={[10, 10, 0, 0]} />
            </BarChart>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

export default Dashboard;
