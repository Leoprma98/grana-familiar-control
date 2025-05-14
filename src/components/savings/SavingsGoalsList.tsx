
import React, { useState } from "react";
import { useFinance } from "../../contexts/FinanceContext";
import { formatCurrency, getMonthName } from "../../utils/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { PiggyBank, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Month } from "@/types/finance";

const SavingsGoalsList: React.FC = () => {
  const { getCurrentMonthData, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, getMonthSummary, currentMonth, currentYear } = useFinance();
  const monthData = getCurrentMonthData();
  const summary = getMonthSummary(currentMonth, currentYear);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [currentGoal, setCurrentGoal] = useState<any>({
    name: "",
    targetAmount: 0,
    savedAmount: 0,
    targetMonth: currentMonth,
    targetYear: currentYear,
  });

  // Handle Form Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentGoal({ ...currentGoal, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentGoal({ ...currentGoal, [name]: value });
  };

  const handleSaveGoal = () => {
    try {
      if (currentGoal.id) {
        updateSavingsGoal({
          id: currentGoal.id,
          name: currentGoal.name,
          targetAmount: parseFloat(currentGoal.targetAmount),
          savedAmount: parseFloat(currentGoal.savedAmount),
          targetMonth: parseInt(currentGoal.targetMonth) as Month,
          targetYear: parseInt(currentGoal.targetYear),
        });
        toast.success("Meta atualizada com sucesso!");
        setIsEditDialogOpen(false);
      } else {
        addSavingsGoal({
          name: currentGoal.name,
          targetAmount: parseFloat(currentGoal.targetAmount),
          savedAmount: parseFloat(currentGoal.savedAmount),
          targetMonth: parseInt(currentGoal.targetMonth) as Month,
          targetYear: parseInt(currentGoal.targetYear),
        });
        toast.success("Meta adicionada com sucesso!");
        setIsAddDialogOpen(false);
      }
      
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar a meta. Verifique os campos.");
    }
  };

  const handleDeleteGoal = () => {
    deleteSavingsGoal(currentGoal.id);
    toast.success("Meta removida com sucesso!");
    setIsDeleteDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentGoal({
      name: "",
      targetAmount: 0,
      savedAmount: 0,
      targetMonth: currentMonth,
      targetYear: currentYear,
    });
  };

  const handleEdit = (goal: any) => {
    setCurrentGoal({
      ...goal,
      targetMonth: goal.targetMonth.toString(),
      targetYear: goal.targetYear.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (goal: any) => {
    setCurrentGoal(goal);
    setIsDeleteDialogOpen(true);
  };

  const renderGoalForm = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
    
    return (
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
                value={currentGoal.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Nome da meta"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetAmount" className="text-right">
              Valor da Meta
            </Label>
            <div className="col-span-3">
              <Input
                id="targetAmount"
                name="targetAmount"
                type="number"
                value={currentGoal.targetAmount}
                onChange={handleInputChange}
                className="col-span-3"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="savedAmount" className="text-right">
              Valor Guardado
            </Label>
            <div className="col-span-3">
              <Input
                id="savedAmount"
                name="savedAmount"
                type="number"
                value={currentGoal.savedAmount}
                onChange={handleInputChange}
                className="col-span-3"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetMonth" className="text-right">
              Mês Alvo
            </Label>
            <div className="col-span-3">
              <Select
                value={currentGoal.targetMonth.toString()}
                onValueChange={(value) => handleSelectChange("targetMonth", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthName(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetYear" className="text-right">
              Ano Alvo
            </Label>
            <div className="col-span-3">
              <Select
                value={currentGoal.targetYear.toString()}
                onValueChange={(value) => handleSelectChange("targetYear", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="submit" onClick={handleSaveGoal}>
            Salvar
          </Button>
        </DialogFooter>
      </>
    );
  };

  const calculateProgress = (goal: any) => {
    return Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
  };
  
  const getRemainingAmount = (goal: any) => {
    return Math.max(goal.targetAmount - goal.savedAmount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Metas de Poupança</h2>
          <p className="text-muted-foreground">
            Total Poupado: {formatCurrency(summary.totalSaved)}
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Nova Meta
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Meta</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da nova meta de poupança abaixo.
              </DialogDescription>
            </DialogHeader>
            {renderGoalForm()}
          </DialogContent>
        </Dialog>
      </div>

      {monthData.savingsGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monthData.savingsGoals.map((goal) => (
            <Card key={goal.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{goal.name}</CardTitle>
                <CardDescription>
                  Meta: {getMonthName(goal.targetMonth)} {goal.targetYear}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progresso:</span>
                    <span className="text-sm font-medium">{calculateProgress(goal)}%</span>
                  </div>
                  <Progress value={calculateProgress(goal)} className="h-2" />
                  
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Guardado</p>
                      <p className="font-medium">{formatCurrency(goal.savedAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Meta</p>
                      <p className="font-medium">{formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-muted p-2 rounded-md">
                    <p className="text-sm">
                      Falta: {formatCurrency(getRemainingAmount(goal))}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(goal)}>
                  <Pencil className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(goal)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Nenhuma meta de poupança registrada neste mês
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Meta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da meta de poupança abaixo.
            </DialogDescription>
          </DialogHeader>
          {renderGoalForm()}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Meta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta meta de poupança?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavingsGoalsList;
