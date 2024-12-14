import {
  Container,
  Title,
  Paper,
  Text,
  Grid,
  Group,
  Stack,
  Alert,
  NumberInput,
  Loader,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { mockTransactions } from "../../data/mockTransactions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { utils as xlsxUtils, write as xlsxWrite } from "xlsx";
import api from "../../api";
import CategoryTrendsChart from "../Charts/CategoryTrendsChart";

// Prediction helper functions
const calculateMovingAverage = (data, periods = 3) => {
  return data
    .map((_, index, array) => {
      if (index < periods - 1) return null;
      const sum = array
        .slice(index - periods + 1, index + 1)
        .reduce((acc, val) => acc + val.amount, 0);
      return sum / periods;
    })
    .filter((val) => val !== null);
};

const predictNextValue = (data) => {
  const movingAvg = calculateMovingAverage(data);
  const lastThreeAvg = movingAvg.slice(-3);
  const trend = (lastThreeAvg[2] - lastThreeAvg[0]) / 2;
  return lastThreeAvg[2] + trend;
};

function Reports() {
  const [timeRange, setTimeRange] = useState("6months");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeByCategory, setTimeByCategory] = useState([]);
  const chartRef = useRef(null);
  const [arimaPredictions, setArimaPredictions] = useState([]);
  const [steps, setSteps] = useState(12); // default 12 steps
  const [isLoading, setIsLoading] = useState(false);

  const getTimeByCategory = async (field, timeBy) => {
    try {
      const response = await api.get(
        `/api/v1/reports/timeByCategory?field=${field}&timeBy=${timeBy}`
      );

      // Transform the data for the line chart
      console.log(response.data);
      const transformedData = response.data.data.map((item) => ({
        year: item._id.timeGroup,
        amount: item.amount,
        count: item.count,
      }));

      // Sort by year
      transformedData.sort((a, b) => a.year - b.year);

      setTimeByCategory(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getTimeByCategory("amount", "year");
  }, []);

  useEffect(() => {
    const fetchArimaPredictions = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/v1/arima/predict?steps=${steps}`);
        setArimaPredictions(response.data);
      } catch (error) {
        console.error("Error fetching ARIMA predictions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArimaPredictions();
  }, [steps]);

  // Prepare historical and prediction data
  const analysisData = useMemo(() => {
    const now = new Date();
    const monthsToAnalyze = timeRange === "6months" ? 6 : 12;

    // Group transactions by month
    const monthlyData = Array.from({ length: monthsToAnalyze }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = mockTransactions.filter((t) => {
        const transDate = new Date(t.date);
        return (
          transDate.getMonth() === date.getMonth() &&
          transDate.getFullYear() === date.getFullYear() &&
          (selectedCategory === "all" || t.category === selectedCategory)
        );
      });

      return {
        month: date.toLocaleString("default", { month: "short" }),
        amount: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
        date: date,
      };
    }).reverse();

    // Calculate predictions
    const predictedValue = predictNextValue(monthlyData);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      historical: monthlyData,
      prediction: [
        ...monthlyData,
        {
          month: nextMonth.toLocaleString("default", { month: "short" }),
          amount: predictedValue,
          predicted: true,
        },
      ],
    };
  }, [timeRange, selectedCategory]);

  // Calculate budget alerts
  const budgetAlerts = useMemo(() => {
    const predictedAmount =
      analysisData.prediction[analysisData.prediction.length - 1].amount;
    const averageSpending =
      analysisData.historical.reduce((sum, month) => sum + month.amount, 0) /
      analysisData.historical.length;

    return {
      isOverBudget: predictedAmount > averageSpending * 1.2,
      predictedAmount,
      averageSpending,
    };
  }, [analysisData]);

  // Prepare data for stacked area chart
  const stackedData = useMemo(() => {
    const now = new Date();
    const monthsToAnalyze = timeRange === "6months" ? 6 : 12;

    // Create array of last N months
    const months = Array.from({ length: monthsToAnalyze }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        month: date.toLocaleString("default", { month: "short" }),
        date: date,
      };
    }).reverse();

    // Get unique categories
    const uniqueCategories = [
      ...new Set(mockTransactions.map((t) => t.category)),
    ];

    // Calculate amounts for each category by month
    return months.map(({ month, date }) => {
      const monthData = { month };

      uniqueCategories.forEach((category) => {
        const amount = mockTransactions
          .filter((t) => {
            const transDate = new Date(t.date);
            return (
              t.category === category &&
              transDate.getMonth() === date.getMonth() &&
              transDate.getFullYear() === date.getFullYear()
            );
          })
          .reduce((sum, t) => sum + t.amount, 0);

        monthData[category] = amount;
      });

      return monthData;
    });
  }, [timeRange, mockTransactions]);

  // Generate colors for categories
  const categoryColors = {
    Food: "#8884d8",
    Transportation: "#82ca9d",
    Utilities: "#ffc658",
    Entertainment: "#ff7300",
    Shopping: "#0088fe",
    // Add more colors as needed
  };

  // Export Functions
  const exportAsPNG = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      canvas.toBlob((blob) => {
        saveAs(
          blob,
          `financial-report-${new Date().toISOString().slice(0, 10)}.png`
        );
      });
    } catch (error) {
      console.error("Error exporting as PNG:", error);
    }
  };

  const exportAsCSV = () => {
    try {
      // Prepare data in CSV format
      const csvData = stackedData.map((monthData) => {
        return {
          Month: monthData.month,
          ...Object.keys(categoryColors).reduce((acc, category) => {
            acc[category] = monthData[category] || 0;
            return acc;
          }, {}),
          Total: Object.keys(categoryColors).reduce(
            (sum, category) => sum + (monthData[category] || 0),
            0
          ),
        };
      });

      // Convert to worksheet
      const ws = xlsxUtils.json_to_sheet(csvData);
      const wb = xlsxUtils.book_new();
      xlsxUtils.book_append_sheet(wb, ws, "Financial Report");

      // Generate and download file
      const excelBuffer = xlsxWrite(wb, { bookType: "csv", type: "array" });
      const data = new Blob([excelBuffer], { type: "text/csv" });
      saveAs(
        data,
        `financial-report-${new Date().toISOString().slice(0, 10)}.csv`
      );
    } catch (error) {
      console.error("Error exporting as CSV:", error);
    }
  };

  const exportAsPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL("image/png");

      // Initialize PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add title
      pdf.setFontSize(16);
      pdf.text("Financial Report", 15, 15);

      // Add date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 25);

      // Add chart
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 30;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 15, 35, pdfWidth, pdfHeight);

      // Add summary table
      const summaryY = pdfHeight + 50;
      pdf.setFontSize(14);
      pdf.text("Summary", 15, summaryY);

      // Add category totals
      Object.keys(categoryColors).forEach((category, index) => {
        const total = stackedData.reduce(
          (sum, month) => sum + (month[category] || 0),
          0
        );
        pdf.setFontSize(12);
        pdf.text(
          `${category}: ₹${total.toLocaleString()}`,
          15,
          summaryY + 10 + index * 7
        );
      });

      // Save PDF
      pdf.save(`financial-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Error exporting as PDF:", error);
    }
  };

  // Calculate confidence level (example logic)
  const confidenceLevel = useMemo(() => {
    const historicalAmounts = analysisData.historical.map(
      (month) => month.amount
    );
    const average =
      historicalAmounts.reduce((sum, amount) => sum + amount, 0) /
      historicalAmounts.length;
    const predictedAmount =
      analysisData.prediction[analysisData.prediction.length - 1].amount;

    // Example confidence level calculation
    return ((predictedAmount / average) * 100).toFixed(2); // Percentage
  }, [analysisData]);

  return (
    <Container size="xl">
      <Group position="apart" mb="md">
        <Title order={2}>Financial Analytics & Predictions</Title>
      </Group>

      {budgetAlerts.isOverBudget && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Budget Alert"
          color="red"
          mb="md"
        >
          Predicted spending (₹{budgetAlerts.predictedAmount.toLocaleString()})
          is 20% above your average monthly spending.
        </Alert>
      )}
      <Grid mt="md">
        <Grid.Col span={12}>
          <Paper shadow="sm" p="md" withBorder mt="xl">
            <Group position="apart" mb="md">
              <Title order={3}>ARIMA Predictions</Title>
              <NumberInput
                value={steps}
                onChange={(value) => setSteps(value)}
                min={1}
                max={30}
                label="Number of days"
                width={200}
                styles={{ root: { width: 200 } }}
                disabled={isLoading}
              />
            </Group>
            <Text size="sm" color="dimmed" mb="lg">
              Next {steps} days forecast
            </Text>

            {isLoading ? (
              <Group position="center" py="xl">
                <Loader size="md" />
              </Group>
            ) : (
              <Group spacing="xl">
                {arimaPredictions.map((value, index) => {
                  // Calculate future date
                  const futureDate = new Date();
                  futureDate.setDate(futureDate.getDate() + index + 1);

                  return (
                    <div key={index}>
                      <Text size="sm" color="dimmed">
                        {futureDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </Text>
                      <Text weight={500}>₹{value.toFixed(2)}</Text>
                    </div>
                  );
                })}
              </Group>
            )}
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid mt="md">
        <Grid.Col span={12}>
          <Paper shadow="sm" p="md" withBorder>
            <Title order={3}>Yearly Spending Trends</Title>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={timeByCategory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tickFormatter={(value) => `${value}`} />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString()}`,
                    "Amount",
                  ]}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Total Amount"
                  dot={{ r: 4 }}
                />
                <Brush
                  dataKey="year"
                  height={30}
                  stroke="#8884d8"
                  startIndex={0}
                  endIndex={timeByCategory.length - 1}
                  travellerWidth={10}
                  fill="#f5f5f5"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid mt="md">
        <Grid.Col span={12}>
          <Paper shadow="sm" p="md" withBorder>
            <Title order={3}>Transaction Count by Year</Title>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={timeByCategory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tickFormatter={(value) => `${value}`} />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value}`, "Transactions"]}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Transaction Count"
                  dot={{ r: 4 }}
                />
                <Brush
                  dataKey="year"
                  height={30}
                  stroke="#82ca9d"
                  startIndex={0}
                  endIndex={timeByCategory.length - 1}
                  travellerWidth={10}
                  fill="#f5f5f5"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid mt="md">
        <Grid.Col span={12}>
          <CategoryTrendsChart />
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default Reports;
