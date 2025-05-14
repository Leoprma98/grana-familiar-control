
import React, { useState } from "react";
import { useFinance } from "../../contexts/FinanceContext";
import { formatCurrency } from "../../utils/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Wallet, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from "recharts";

const FoodAllowanceList: React.FC = () => {
  const { getCurrentMonthData, addFoodAllowance, updateFoodAllowance, deleteFoodAllowance } = useFinance();
  const monthData = getCurrentMonthData();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [currentAllowance, setCurrentAllowance] = useState<any>({
    person: "Léo",
    totalAmount: 0,
    usedAmount: 0,
  });

  // Handle Form Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentAllowance({ ...currentAllowance, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentAllowance({ ...currentAllowance, [name]: value });
  };

  const handleSaveAllowance = () => {
    try {
      if (currentAllowance.id) {
        updateFoodAllowance({
          id: currentAllowance.id,
          person: currentAllowance.person,
          totalAmount: parseFloat(currentAllowance.totalAmount),
          usedAmount: parseFloat(currentAllowance.usedAmount),
        });
        toast.success("Vale-alimentação atualizado com sucesso!");
        setIsEditDialogOpen(false);
      } else {
        addFoodAllowance({
          person: currentAllowance.person,
          totalAmount: parseFloat(currentAllowance.totalAmount),
          usedAmount: parseFloat(currentAllowance.usedAmount),
        });
        toast.success("Vale-alimentação adicionado com sucesso!");
        setIsAddDialogOpen(false);
      }
      
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar o vale-alimentação. Verifique os campos.");
    }
  };

  const handleDeleteAllowance = () => {
    deleteFoodAllowance(currentAllowance.id);
    toast.success("Vale-alimentação removido com sucesso!");
    setIsDeleteDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentAllowance({
      person: "Léo",
      totalAmount: 0,
      usedAmount: 0,
    });
  };

  const handleEdit = (allowance: any) => {
    setCurrentAllowance({
      ...allowance
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (allowance: any) => {
    setCurrentAllowance(allowance);
    setIsDeleteDialogOpen(true);
  };

  const persons = [
    { value: "Léo", label: "Léo" },
    { value: "Cat", label: "Cat" },
    { value: "Outro", label: "Outro" },
  ];

  const calculateUsagePercentage = (allowance: any) => {
    return Math.min(Math.round((allowance.usedAmount / allowance.totalAmount) * 100), 100);
  };

  const getRemainingAmount = (allowance: any) => {
    return Math.max(allowance.totalAmount - allowance.usedAmount, 0);
  };

  const totalAllowance = monthData.foodAllowances.reduce(
    (sum, allowance) => sum + allowance.totalAmount, 0
  );
  
  const totalUsed = monthData.foodAllowances.reduce(
    (sum, allowance) => sum + allowance.usedAmount, 0
  );

  // Prepare data for pie chart
  const pieChartData = monthData.foodAllowances.map((allowance) => ({
    name: allowance.person,
    used: allowance.usedAmount,
    remaining: getRemainingAmount(allowance),
  }));

  const COLORS = ["#0EA5E9", "#8B5CF6", "#F97316", "#EAB308"];

  const renderAllowanceForm = () => (
    <>
      <div className="grid grid-cols-1 gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="person" className="text-right">
            Pessoa
          </Label>
          <div className="col-span-3">
            <Select
              value={currentAllowance.person}
              onValueChange={(value) => handleSelectChange("person", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a pessoa" />
              </SelectTrigger>
              <SelectContent>
                {persons.map((person) => (
                  <SelectItem key={person.value} value={person.value}>
                    {person.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="totalAmount" className="text-right">
            Valor Total
          </Label>
          <div className="col-span-3">
            <Input
              id="totalAmount"
              name="totalAmount"
              type="number"
              value={currentAllowance.totalAmount}
              onChange={handleInputChange}
              className="col-span-3"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="usedAmount" className="text-right">
            Valor Utilizado
          </Label>
          <div className="col-span-3">
            <Input
              id="usedAmount"
              name="usedAmount"
              type="number"
              value={currentAllowance.usedAmount}
              onChange={handleInputChange}
              className="col-span-3"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" onClick={handleSaveAllowance}>
          Salvar
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Vale-Alimentação</h2>
          <div className="flex gap-4">
            <p className="text-muted-foreground">
              Total: {formatCurrency(totalAllowance)}
            </p>
            <p className="text-red-600">
              Usado: {formatCurrency(totalUsed)}
            </p>
            <p className="text-green-600">
              Saldo: {formatCurrency(totalAllowance - totalUsed)}
            </p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Novo Vale
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Vale-Alimentação</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do novo vale-alimentação abaixo.
              </DialogDescription>
            </DialogHeader>
            {renderAllowanceForm()}
          </DialogContent>
        </Dialog>
      </div>

      {monthData.foodAllowances.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo dos Vales</CardTitle>
                <CardDescription>
                  Distribuição de uso dos vales por pessoa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="used"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {monthData.foodAllowances.map((allowance) => (
                <Card key={allowance.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{allowance.person}</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(allowance)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(allowance)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Total: {formatCurrency(allowance.totalAmount)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Utilizado:</span>
                        <span className="text-sm font-medium">{calculateUsagePercentage(allowance)}%</span>
                      </div>
                      <Progress value={calculateUsagePercentage(allowance)} className="h-2" />
                      
                      <div className="flex justify-between items-center mt-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Usado</p>
                          <p className="font-medium text-red-600">{formatCurrency(allowance.usedAmount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Saldo</p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(getRemainingAmount(allowance))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Nenhum vale-alimentação registrado neste mês
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Vale
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vale-Alimentação</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do vale-alimentação abaixo.
            </DialogDescription>
          </DialogHeader>
          {renderAllowanceForm()}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Vale-Alimentação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este vale-alimentação?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllowance}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodAllowanceList;
