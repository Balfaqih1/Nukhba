import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getParticipant, saveParticipant, updateParticipant } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import { ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GRADES = [
  "روضة", "أول ابتدائي", "ثاني ابتدائي", "ثالث ابتدائي",
  "رابع ابتدائي", "خامس ابتدائي", "سادس ابتدائي",
  "أول متوسط", "ثاني متوسط", "ثالث متوسط",
  "أول ثانوي", "ثاني ثانوي", "ثالث ثانوي",
];

const DURATIONS = ["أسبوع", "أسبوعان", "شهر", "شهران", "ثلاثة أشهر"];

const formSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  age: z.coerce.number().min(3, "العمر يجب أن يكون 3 على الأقل").max(20, "العمر غير صحيح"),
  gradeLevel: z.string().min(1, "المرحلة الدراسية مطلوبة"),
  guardianName: z.string().min(1, "اسم ولي الأمر مطلوب"),
  guardianPhone: z.string().regex(/^05\d{8}$/, "رقم الجوال يجب أن يكون بصيغة 05xxxxxxxx"),
  guardianPhoneAlt: z.string().optional().or(z.literal("")),
  nationalId: z.string().min(10, "رقم الهوية غير صحيح").max(15, "رقم الهوية غير صحيح"),
  registrationDate: z.string().min(1, "تاريخ التسجيل مطلوب"),
  endDate: z.string().min(1, "تاريخ الانتهاء مطلوب"),
  amountPaid: z.coerce.number().min(0, "المبلغ يجب أن يكون رقماً موجباً"),
  amountRemaining: z.coerce.number().min(0, "المبلغ يجب أن يكون رقماً موجباً"),
  registrationDuration: z.string().min(1, "مدة التسجيل مطلوبة"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ParticipantForm({ params }: { params?: { id?: string } }) {
  const isEditing = !!params?.id;
  const participantId = isEditing ? parseInt(params!.id!, 10) : 0;

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const existing = isEditing ? getParticipant(participantId) : undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: 0,
      gradeLevel: "",
      guardianName: "",
      guardianPhone: "",
      guardianPhoneAlt: "",
      nationalId: "",
      registrationDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      amountPaid: 0,
      amountRemaining: 0,
      registrationDuration: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isEditing && existing) {
      form.reset({
        name: existing.name,
        age: existing.age,
        gradeLevel: existing.gradeLevel,
        guardianName: existing.guardianName,
        guardianPhone: existing.guardianPhone,
        guardianPhoneAlt: existing.guardianPhoneAlt || "",
        nationalId: existing.nationalId,
        registrationDate: existing.registrationDate,
        endDate: existing.endDate,
        amountPaid: existing.amountPaid,
        amountRemaining: existing.amountRemaining,
        registrationDuration: existing.registrationDuration,
        notes: existing.notes || "",
      });
    }
  }, []);

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
      age: data.age,
      gradeLevel: data.gradeLevel,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      guardianPhoneAlt: data.guardianPhoneAlt || "",
      nationalId: data.nationalId,
      registrationDate: data.registrationDate,
      endDate: data.endDate,
      amountPaid: data.amountPaid,
      amountRemaining: data.amountRemaining,
      registrationDuration: data.registrationDuration,
      notes: data.notes || "",
    };

    if (isEditing) {
      updateParticipant(participantId, payload);
      toast({ title: "تم التعديل", description: "تم تحديث بيانات المشترك بنجاح" });
    } else {
      saveParticipant(payload);
      toast({ title: "تمت الإضافة", description: "تم إضافة المشترك بنجاح" });
    }
    setLocation("/participants");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/participants")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {isEditing ? "تعديل بيانات مشترك" : "إضافة مشترك جديد"}
          </h2>
          <p className="text-muted-foreground mt-1">الرجاء إدخال بيانات المشترك كاملة</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">البيانات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المشترك <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="الاسم الرباعي" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهوية <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="رقم الهوية الوطنية أو الإقامة" {...field} dir="ltr" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العمر <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المرحلة الدراسية <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="اختر المرحلة الدراسية" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">بيانات التواصل</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="guardianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم ولي الأمر <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="اسم ولي الأمر" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="hidden md:block" />
              <FormField
                control={form.control}
                name="guardianPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الجوال <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="05xxxxxxxx" {...field} dir="ltr" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guardianPhoneAlt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم إضافي (اختياري)</FormLabel>
                    <FormControl><Input placeholder="05xxxxxxxx" {...field} dir="ltr" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">بيانات التسجيل والمالية</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="registrationDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مدة التسجيل <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="اختر المدة" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DURATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="hidden md:block" />
              <FormField
                control={form.control}
                name="registrationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ التسجيل <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الانتهاء <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amountPaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ المدفوع (ريال) <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amountRemaining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ المتبقي (ريال) <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>ملاحظات (اختياري)</FormLabel>
                    <FormControl><Input placeholder="أي ملاحظات إضافية..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setLocation("/participants")}>
              إلغاء
            </Button>
            <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4" />
              حفظ البيانات
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
