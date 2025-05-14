
import React, { useState } from "react";
import { useFinance } from "../../contexts/FinanceContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { ExpenseCategory, PaymentStatus } from "../../types/finance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt, Plus, Pencil, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ExpenseList: React.FC = () => {
  const { getCurrentMonthData, addExpense, updateExpense, deleteExpense, getMonthSummary, currentMonth, currentYear } = useFinance();
  const monthData = getCurrentMonthData();
  const summary = getMonthSummary(currentMonth, currentYear);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterTab, setFilterTab] = useState("all");
  
  const [currentExpense, setCurrentExpense] = useState<any>({
    name: "",
    category: "fixa",
    amount: 0,
    date: new Date().toISOString().substring(0, 10),
    status: "pendente",
  });

  // Handle Form Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentExpense({ ...currentExpense, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentExpense({ ...currentExpense, [name]: value });
  };

  const handleSaveExpense = () => {
    try {
      if (currentExpense.id) {
        updateExpense({
          id: currentExpense.id,
          name: currentExpense.name,
          category: currentExpense.category as ExpenseCategory,
          amount: parseFloat(currentExpense.amount),
          date: new Date(currentExpense.date),
          status: currentExpense.status as PaymentStatus,
        });
        toast.success("Despesa atualizada com sucesso!");
        setIsEditDialogOpen(false);
      } else {
        addExpense({
          name: currentExpense.name,
          category: currentExpense.category as ExpenseCategory,
          amount: parseFloat(currentExpense.amount),
          date: new Date(currentExpense.date),
          status: currentExpense.status as PaymentStatus,
        });
        toast.success("Despesa adicionada com sucesso!");
        setIsAddDialogOpen(false);
      }
      
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar a despesa. Verifique os campos.");
    }
  };

  const handleDeleteExpense = () => {
    deleteExpense(currentExpense.id);
    toast.success("Despesa removida com sucesso!");
    setIsDeleteDialogOpen(false);
    resetForm();
  };

  const handleMarkAsPaid = (expense: any) => {
    updateExpense({
      ...expense,
      status: "paga"
    });
    toast.success("Despesa marcada como paga!");
  };

  const resetForm = () => {
    setCurrentExpense({
      name: "",
      category: "fixa",
      amount: 0,
      date: new Date().toISOString().substring(0, 10),
      status: "pendente",
    });
  };

  const handleEdit = (expense: any) => {
    setCurrentExpense({
      ...expense,
      date: new Date(expense.date).toISOString().substring(0, 10),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (expense: any) => {
    setCurrentExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const expenseCategories = [
    { value: "fixa", label: "Fixa" },
    { value: "variável", label: "Variável" },
    { value: "parcelada", label: "Parcelada" },
    { value: "lazer", label: "Lazer" },
    { value: "saúde", label: "Saúde" },
    { value: "transporte", label: "Transporte" },
    { value: "outros", label: "Outros" },
  ];

  const statusOptions = [
    { value: "pendente", label: "Pendente" },
    { value: "paga", label: "Paga" },
  ];

  // Filter expenses based on selected tab
  const filteredExpenses = monthData.expenses.filter((expense) => {
    if (filterTab === "all") return true;
    if (filterTab === "pending") return expense.status === "pendente";
    if (filterTab === "paid") return expense.status === "paga";
    return expense.category === filterTab;
  });

  // Group expenses by category
  const groupedExpenses: Record<string, typeof monthData.expenses> = {};
  
  filteredExpenses.forEach((expense) => {
    if (!groupedExpenses[expense.category]) {
      groupedExpenses[expense.category] = [];
    }
    groupedExpenses[expense.category].push(expense);
  });

  const totalPaid = monthData.expenses
    .filter(expense => expense.status === "paga")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalPending = monthData.expenses
    .filter(expense => expense.status === "pendente")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const renderExpenseForm = () => (
    <>
      <div className="grid grid-cols-1 gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nome
          </Label>
          <div className="col-span-3">
            <Input
              id="name"
              name="name"
              value={currentExpense.name}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Nome da despesa"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Categoria
          </Label>
          <div className="col-span-3">
            <Select
              value={currentExpense.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Valor
          </Label>
          <div className="col-span-3">
            <Input
              id="amount"
              name="amount"
              type="number"
              value={currentExpense.amount}
              onChange={handleInputChange}
              className="col-span-3"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">
            Data
          </Label>
          <div className="col-span-3">
            <Input
              id="date"
              name="date"
              type="date"
              value={currentExpense.date}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">
            Status
          </Label>
          <div className="col-span-3">
            <Select
              value={currentExpense.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" onClick={handleSaveExpense}>
          Salvar
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Despesas</h2>
          <div className="flex gap-4">
            <p className="text-muted-foreground">
              Total: {formatCurrency(summary.totalExpenses)}
            </p>
            <p className="text-green-600">
              Pago: {formatCurrency(totalPaid)}
            </p>
            <p className="text-red-600">
              Pendente: {formatCurrency(totalPending)}
            </p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Nova Despesa
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Despesa</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da nova despesa abaixo.
              </DialogDescription>
            </DialogHeader>
            {renderExpenseForm()}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={filterTab} onValueChange={setFilterTab}>
        <TabsList className="mb-4 flex flex-wrap justify-start">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="paid">Pagas</TabsTrigger>
          {expenseCategories.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filterTab}>
          {Object.keys(groupedExpenses).length > 0 ? (
            Object.entries(groupedExpenses).map(([category, expenses]) => (
              <Card key={category} className="mb-6">
                <CardHeader>
                  <CardTitle>
                    {expenseCategories.find(c => c.value === category)?.label || category}
                  </CardTitle>
                  <CardDescription>
                    Total: {formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{expense.name}</TableCell>
                          <TableCell>{formatCurrency(expense.amount)}</TableCell>
                          <TableCell>{formatDate(expense.date)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                expense.status === "paga" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              }
                            >
                              {expense.status === "paga" ? "Paga" : "Pendente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {expense.status === "pendente" && (
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="mr-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleMarkAsPaid(expense)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(expense)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  {filterTab === "all" 
                    ? "Nenhuma despesa registrada neste mês" 
                    : filterTab === "pending"
                    ? "Não há despesas pendentes"
                    : filterTab === "paid"
                    ? "Não há despesas pagas"
                    : `Não há despesas na categoria ${expenseCategories.find(c => c.value === filterTab)?.label || filterTab}`}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Despesa
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da despesa abaixo.
            </DialogDescription>
          </DialogHeader>
          {renderExpenseForm()}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Despesa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta despesa?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteExpense}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseList;
