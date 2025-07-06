"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";

const createDisputeSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject must be less than 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum([
    "product-not-received",
    "product-not-as-described", 
    "refund-request",
    "delivery-issue",
    "payment-issue",
    "other",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

type CreateDisputeForm = z.infer<typeof createDisputeSchema>;

interface CreateDisputeDialogProps {
  orderId: string;
  productName?: string;
  children?: React.ReactNode;
}

const categoryLabels = {
  "product-not-received": "Product Not Received",
  "product-not-as-described": "Product Not As Described",
  "refund-request": "Refund Request",
  "delivery-issue": "Delivery Issue",
  "payment-issue": "Payment Issue",
  "other": "Other",
};

const priorityLabels = {
  "low": "Low",
  "medium": "Medium", 
  "high": "High",
  "urgent": "Urgent",
};

export const CreateDisputeDialog = ({ orderId, productName, children }: CreateDisputeDialogProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const trpc = useTRPC();
  
  const form = useForm<CreateDisputeForm>({
    resolver: zodResolver(createDisputeSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "other",
      priority: "medium",
    },
  });

  const createDispute = useMutation({
    ...trpc.disputes.create.mutationOptions(),
    onSuccess: (data: any) => {
      toast.success("Dispute created successfully");
      setOpen(false);
      form.reset();
      router.push(`/dashboard/disputes/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create dispute");
    },
  });

  const onSubmit = (values: CreateDisputeForm) => {
    createDispute.mutate({
      orderId,
      ...values,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="elevated" size="sm">
            Create Dispute
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Dispute</DialogTitle>
          {productName && (
            <p className="text-sm text-muted-foreground">
              For product: {productName}
            </p>
          )}
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="cursor-pointer">
                      <SelectTrigger>
                        <SelectValue placeholder="Select dispute category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent >
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="cursor-pointer">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem >
                  <FormLabel >Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="cursor-pointer">
                      <SelectTrigger >
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="cursor-pointer">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl >
                    <Input 
                      placeholder="Brief description of the issue" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about your dispute..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="elevated"
                onClick={() => setOpen(false)}
                disabled={createDispute.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createDispute.isPending}
                variant="elevated"
              >
                {createDispute.isPending ? "Creating..." : "Create Dispute"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
