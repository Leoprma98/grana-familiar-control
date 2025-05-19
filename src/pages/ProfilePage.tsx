
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, User, Users } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getFamilyMembers } from "@/utils/authUtils";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useIsMobile } from "@/hooks/use-mobile";

const ProfilePage: React.FC = () => {
  const { user, profile, family, updateProfile, joinFamily, signOut } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Header configuration for consistency with other pages
  const navItems = [{ id: "profile", label: "Perfil do Usuário" }];
  const activeTab = "profile";
  const toggleMobileMenu = () => {}; // Empty function as we don't need mobile menu here
  
  // Esquema de validação para atualização de perfil
  const profileSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres")
  });
  
  // Esquema de validação para ingressar em nova família
  const familySchema = z.object({
    familyCode: z.string().min(4, "Código de família inválido")
  });
  
  type ProfileFormValues = z.infer<typeof profileSchema>;
  type FamilyFormValues = z.infer<typeof familySchema>;
  
  // Formulários
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || ""
    }
  });
  
  const familyForm = useForm<FamilyFormValues>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      familyCode: ""
    }
  });
  
  // Buscar membros da família quando o componente carregar
  useEffect(() => {
    const loadFamilyMembers = async () => {
      if (profile?.family_id) {
        try {
          console.log("Carregando membros da família:", profile.family_id);
          const members = await getFamilyMembers(profile.family_id);
          console.log("Membros carregados:", members);
          setFamilyMembers(members || []);
        } catch (error) {
          console.error("Erro ao carregar membros da família:", error);
        }
      }
    };
    
    loadFamilyMembers();
  }, [profile?.family_id]);
  
  // Atualizar o formulário quando o perfil mudar
  useEffect(() => {
    if (profile) {
      profileForm.setValue("name", profile.name);
    }
  }, [profile, profileForm]);
  
  // Handler para atualizar perfil
  const handleUpdateProfile = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      await updateProfile(values.name);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler para ingressar em nova família
  const handleJoinFamily = async (values: FamilyFormValues) => {
    try {
      setIsSubmitting(true);
      await joinFamily(values.familyCode);
      familyForm.reset();
    } catch (error) {
      console.error("Erro ao ingressar na família:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Copiar código da família para o clipboard
  const copyFamilyCode = () => {
    if (family) {
      navigator.clipboard.writeText(family.code);
      toast.success("Código copiado para a área de transferência!");
    }
  };
  
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }
  
  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-6">
      {/* Added Header component for consistency */}
      <Header 
        isMobile={isMobile}
        activeTab={activeTab}
        navItems={navItems}
        toggleMobileMenu={toggleMobileMenu}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Seu nome" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </form>
            </Form>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-medium">Código da Família</p>
                <Button size="sm" variant="outline" onClick={copyFamilyCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <p className="text-lg font-bold">{family?.code || "Carregando..."}</p>
              <p className="text-sm text-muted-foreground">
                Compartilhe este código com os membros da sua família para que eles possam
                acessar as mesmas informações financeiras.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <p className="font-medium mb-2">Membros da Família</p>
              {familyMembers.length > 0 ? (
                <div className="space-y-2">
                  {familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center p-2 border rounded">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="text-xs">
                          {member.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum membro encontrado.
                </p>
              )}
            </div>
            
            <Separator />
            
            <div>
              <p className="font-medium mb-2">Ingressar em outra família</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Mudar de Família
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ingressar em outra família</DialogTitle>
                    <DialogDescription>
                      Atenção! Ao ingressar em outra família, você perderá acesso aos dados
                      financeiros da família atual.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...familyForm}>
                    <form onSubmit={familyForm.handleSubmit(handleJoinFamily)} className="space-y-4">
                      <FormField
                        control={familyForm.control}
                        name="familyCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código da Família</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Users className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Ex: FAM-A123" className="pl-8" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Ingressando..." : "Ingressar"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Separator />
            
            <Button variant="destructive" onClick={signOut}>
              Sair da conta
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{user.email}</p>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Membro desde</p>
              <p>{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Código da Família</p>
              <p>{family?.code}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
