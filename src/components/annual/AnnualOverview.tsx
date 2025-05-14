
import React, { useState } from "react";
import { useFinance } from "../../contexts/FinanceContext";
import { formatCurrency, getMonthName } from "../../utils/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AnnualOverview: React.FC = () => {
  const { monthsData, getMonthSummary, currentYear, setCurrentYear } = useFinance();
  const [viewType, setViewType] = useState<"chart" | "table">("chart");
  
  // Filter data for the current year
  const yearData = monthsData.filter(data => data.year === currentYear);

  // Prepare data for charts
  const chartData = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthData = yearData.find(data => data.month === monthIndex);
    const summary = getMonthSummary(monthIndex, currentYear);
    
    return {
      name: getMonthName(monthIndex),
      receitas: summary.totalIncome,
      despesas: summary.totalExpenses,
      poupanca: summary.totalSaved,
      saldo: summary.balance,
      monthIndex,
    };
  });

  // Aggregate data for the year
  const yearSummary = {
    totalIncome: chartData.reduce((sum, data) => sum + data.receitas, 0),
    totalExpenses: chartData.reduce((sum, data) => sum + data.despesas, 0),
    totalSaved: chartData.reduce((sum, data) => sum + data.poupanca, 0),
    balance: chartData.reduce((sum, data) => sum + data.saldo, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Resumo Anual</h2>
          <p className="text-muted-foreground">
            Visão geral do ano {currentYear}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={currentYear.toString()}
            onValueChange={(value) => setCurrentYear(Number(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue>{currentYear}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Tabs defaultValue={viewType} onValueChange={(v) => setViewType(v as "chart" | "table")}>
            <TabsList>
              <TabsTrigger value="chart">Gráficos</TabsTrigger>
              <TabsTrigger value="table">Tabela</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(yearSummary.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média mensal: {formatCurrency(yearSummary.totalIncome / 12)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(yearSummary.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média mensal: {formatCurrency(yearSummary.totalExpenses / 12)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Poupado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(yearSummary.totalSaved)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média mensal: {formatCurrency(yearSummary.totalSaved / 12)}
            </p>
          </CardContent>
        </Card>

        <Card className={yearSummary.balance >= 0 ? "bg-green-50" : "bg-red-50"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo do Ano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className={`text-2xl font-bold ${
                yearSummary.balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(yearSummary.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média mensal: {formatCurrency(yearSummary.balance / 12)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts or Table */}
      <TabsContent value="chart" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>
              Comparação entre receitas e despesas ao longo do ano
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="#0EA5E9" />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução do Saldo</CardTitle>
            <CardDescription>
              Variação do saldo ao longo do ano
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo"
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="poupanca"
                  name="Poupança"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="table">
        <Card>
          <CardHeader>
            <CardTitle>Dados mensais de {currentYear}</CardTitle>
            <CardDescription>
              Visão detalhada dos valores por mês
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Mês</th>
                  <th className="text-right py-2">Receitas</th>
                  <th className="text-right py-2">Despesas</th>
                  <th className="text-right py-2">Poupança</th>
                  <th className="text-right py-2">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((data, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2">{data.name}</td>
                    <td className="text-right py-2 text-blue-600">
                      {formatCurrency(data.receitas)}
                    </td>
                    <td className="text-right py-2 text-red-600">
                      {formatCurrency(data.despesas)}
                    </td>
                    <td className="text-right py-2 text-purple-600">
                      {formatCurrency(data.poupanca)}
                    </td>
                    <td
                      className={`text-right py-2 ${
                        data.saldo >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(data.saldo)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 font-bold bg-gray-50">
                  <td className="py-2">TOTAL</td>
                  <td className="text-right py-2 text-blue-600">
                    {formatCurrency(yearSummary.totalIncome)}
                  </td>
                  <td className="text-right py-2 text-red-600">
                    {formatCurrency(yearSummary.totalExpenses)}
                  </td>
                  <td className="text-right py-2 text-purple-600">
                    {formatCurrency(yearSummary.totalSaved)}
                  </td>
                  <td
                    className={`text-right py-2 ${
                      yearSummary.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(yearSummary.balance)}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
};

export default AnnualOverview;
