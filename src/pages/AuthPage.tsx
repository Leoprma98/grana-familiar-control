
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronLeft, Lock, Mail, User, Users } from "lucide-react";

// Esquema de validação para login
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});

// Esquema de validação para registro
const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  familyCode: z.string().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage: React.FC = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [authTab, setAuthTab] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Formulário de login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  
  // Formulário de registro
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      familyCode: ""
    }
  });
  
  // Handler para login
  const handleLogin = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      await signIn(values.email, values.password);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler para registro
  const handleRegister = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      await signUp(
        values.email, 
        values.password, 
        values.name,
        values.familyCode && values.familyCode.trim() !== "" ? values.familyCode : undefined
      );
    } catch (error) {
      console.error("Erro ao registrar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Se já estiver autenticado, redirecionar para página inicial
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Grana Familiar</h1>
          <p className="text-gray-600">Gerencie suas finanças em família</p>
        </div>
        
        <Tabs defaultValue="login" value={authTab} onValueChange={setAuthTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Entre na sua conta para gerenciar suas finanças familiares
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="seu@email.com" className="pl-8" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="••••••••" className="pl-8" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                      {isSubmitting ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-gray-500 text-center">
                  Não tem uma conta?{" "}
                  <button 
                    onClick={() => setAuthTab("register")}
                    className="text-primary hover:underline"
                  >
                    Cadastre-se
                  </button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Cadastro</CardTitle>
                <CardDescription>
                  Crie sua conta para começar a gerenciar suas finanças familiares
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
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
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="seu@email.com" className="pl-8" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="••••••••" className="pl-8" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="familyCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código da Família (opcional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Users className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Ex: FAM-A123" className="pl-8" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-gray-500">
                            Deixe em branco para criar uma nova família ou informe um código existente para ingressar em uma família.
                          </p>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                      {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-gray-500 text-center">
                  Já tem uma conta?{" "}
                  <button 
                    onClick={() => setAuthTab("login")}
                    className="text-primary hover:underline"
                  >
                    Faça login
                  </button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
