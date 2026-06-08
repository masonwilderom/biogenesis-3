"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Clock, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  firstName: z.string().trim().min(1).max(20),
  lastName: z.string().trim().min(1).max(20),
  email: z.string().email(),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(2).max(255)
});

export default function ContactSection() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { firstName, lastName, email, subject, message } = values;
    window.location.href = `mailto:leomirandadev@gmail.com?subject=${subject}&body=Hello I am ${firstName} ${lastName}, my Email is ${email}. %0D%0A${message}`;
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <header className="mb-6 max-w-3xl space-y-4 lg:mb-10">
          <h3 className="font-heading text-4xl text-balance md:text-5xl">
            Get Connect With Us access
          </h3>
          <p className="text-muted-foreground text-lg text-balance">
            Stay in touch with us for updates, support, and valuable insights. We’re here to help
            you every step of the way!
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="flex flex-col gap-4 *:rounded-lg *:p-6">
              <div className="bg-muted/50">
                <div className="mb-2 flex items-center gap-3">
                  <Building2 className="text-muted-foreground size-4" />
                  <div className="font-semibold">Location:</div>
                </div>
                <div className="text-muted-foreground text-sm">
                  123 Maple Lane, Springfield, IL 62704
                </div>
              </div>

              <div className="bg-muted/50">
                <div className="mb-2 flex items-center gap-3">
                  <Phone className="text-muted-foreground size-4" />
                  <div className="font-semibold">Call us:</div>
                </div>
                <div className="text-muted-foreground text-sm">+1 (555) 987-6543</div>
              </div>

              <div className="bg-muted/50">
                <div className="mb-2 flex items-center gap-3">
                  <Mail className="text-muted-foreground size-4" />
                  <div className="font-semibold">Email us:</div>
                </div>
                <div className="text-muted-foreground text-sm">contact@ourcompany.com</div>
              </div>

              <div className="bg-muted/50">
                <div className="mb-2 flex items-center gap-3">
                  <Clock className="text-muted-foreground size-4" />
                  <div className="font-semibold">Business Hours:</div>
                </div>
                <div className="text-muted-foreground text-sm">
                  Tuesday to Saturday, 9 AM - 5 PM
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-muted/50 order-1 border-0 shadow-none md:order-2">
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full gap-6">
                  <div className="flex flex-col gap-4 md:flex-row!">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="w-full gap-4">
                          <FormLabel className="font-semibold">Firstname</FormLabel>
                          <FormControl>
                            <Input className="bg-background" placeholder="Leopoldo" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="w-full gap-4">
                          <FormLabel className="font-semibold">Lastname</FormLabel>
                          <FormControl>
                            <Input className="bg-background" placeholder="Miranda" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="gap-4">
                          <FormLabel className="font-semibold">Email</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-background"
                              type="email"
                              placeholder="contact@bundui.com"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem className="gap-4">
                          <FormLabel className="font-semibold">Subject</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="bg-background w-full">
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Web Development">Web Development</SelectItem>
                              <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                              <SelectItem value="Figma Design">Figma Design</SelectItem>
                              <SelectItem value="REST API">REST API</SelectItem>
                              <SelectItem value="FullStack Project">FullStack Project</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="gap-4">
                          <FormLabel className="font-semibold">Message</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder="Your message..."
                              className="bg-background resize-none"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button size="lg">Send message</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
