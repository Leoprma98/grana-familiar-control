
import React from "react";
import { useFinance } from "../../contexts/FinanceContext";
import { formatCurrency } from "../../utils/formatters";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowDown, ArrowUp, Coins, PiggyBank, Receipt } from "lucide-react";

const DashboardOverview: React.FC = () => {
  const { currentMonth, currentYear, getCurrentMonthData, getMonthSummary } = useFinance();
  const monthData = getCurrentMonthData();
  const summary = getMonthSummary(currentMonth, currentYear);

  // Calculate total food allowance information
  const totalAllowanceAmount = monthData.foodAllowances.reduce(
    (sum, allowance) => sum + allowance.totalAmount, 0
  );
  
  const totalUsedAmount = monthData.foodAllowances.reduce(
    (sum, allowance) => sum + allowance.usedAmount, 0
  );
  
  const totalRemainingAmount = Math.max(totalAllowanceAmount - totalUsedAmount, 0);
  
  const usagePercentage = totalAllowanceAmount > 0 
    ? Math.min(Math.round((totalUsedAmount / totalAllowanceAmount) * 100), 100) 
    : 0;

  // Prepare data for bar chart
  const barChartData = [
    {
      name: "Visão Geral",
      Receitas: summary.totalIncome,
      Despesas: summary.totalExpenses,
      Poupança: summary.totalSaved,
    },
  ];

  // Calculate expense distribution by category
  const expensesByCategory: Record<string, number> = {};
  monthData.expenses.forEach((expense) => {
    if (expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] += expense.amount;
    } else {
      expensesByCategory[expense.category] = expense.amount;
    }
  });

  const pieChartData = Object.keys(expensesByCategory).map((category) => ({
    name: category,
    value: expensesByCategory[category],
  }));

  // Colors for pie chart
  const COLORS = ["#0EA5E9", "#8B5CF6", "#F97316", "#EAB308", "#22c55e", "#ef4444", "#64748b"];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Coins className="h-8 w-8 text-blue-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ArrowDown className="h-8 w-8 text-red-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Poupado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <PiggyBank className="h-8 w-8 text-purple-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(summary.totalSaved)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${summary.balance >= 0 ? "border-l-green-500" : "border-l-red-500"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {summary.balance >= 0 ? (
                <ArrowUp className="h-8 w-8 text-green-500" />
              ) : (
                <ArrowDown className="h-8 w-8 text-red-500" />
              )}
              <div className="text-right">
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Food Allowance Section */}
      <Card className="border border-[#9b87f5]/20 bg-[#9b87f5]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#9b87f5]" />
            Vale-Alimentação
          </CardTitle>
          <CardDescription>
            Resumo do vale-alimentação para o mês atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthData.foodAllowances.length > 0 ? (
            <div className="space-y-6">
              {/* Overall progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilização total: {usagePercentage}%</span>
                  <span>{formatCurrency(totalUsedAmount)} de {formatCurrency(totalAllowanceAmount)}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#9b87f5]"
                    style={{ width: `${usagePercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Individual allowances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {monthData.foodAllowances.map((allowance) => {
                  const individualPercentage = allowance.totalAmount > 0
                    ? Math.min(Math.round((allowance.usedAmount / allowance.totalAmount) * 100), 100)
                    : 0;
                  const remaining = Math.max(allowance.totalAmount - allowance.usedAmount, 0);

                  return (
                    <div key={allowance.id} className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{allowance.person}</h4>
                        <span className="text-sm text-gray-500">{individualPercentage}% usado</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full ${individualPercentage > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${individualPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Usado: {formatCurrency(allowance.usedAmount)}</span>
                        <span className="text-green-600">Saldo: {formatCurrency(remaining)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Nenhum vale-alimentação registrado para este mês
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral do Mês</CardTitle>
            <CardDescription>
              Comparação entre receitas, despesas e poupança
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="Receitas" fill="#0EA5E9" />
                <Bar dataKey="Despesas" fill="#ef4444" />
                <Bar dataKey="Poupança" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das despesas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px] text-gray-500">
                Não há despesas registradas neste mês
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
