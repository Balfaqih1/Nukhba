import React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { login } from "@/lib/storage";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    const ok = login(data.username, data.password);
    if (ok) {
      setLocation("/");
    } else {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "تأكد من اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-sidebar skew-y-[-4deg] origin-top-left -z-10 opacity-10"></div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-sidebar rounded-2xl flex items-center justify-center shadow-xl mb-6">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">نادي النخبة</h1>
          <p className="text-muted-foreground mt-2 font-medium">بوابة الإدارة الخاصة</p>
        </div>

        <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">أدخل بيانات الاعتماد للمتابعة</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم المستخدم" {...field} className="bg-background" dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-background" dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-md shadow-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  دخول
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          هذه البوابة مخصصة حصرياً لإدارة نادي النخبة.<br />جميع العمليات مراقبة ومسجلة.
        </p>
      </div>
    </div>
  );
}
