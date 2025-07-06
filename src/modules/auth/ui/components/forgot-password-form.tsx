"use client";

import z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";

import { forgotPasswordSchema } from "../../schemas";

interface ForgotPasswordFormProps {
    onBack: () => void;
}

export const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const trpc = useTRPC();

    const forgotPasswordMutation = useMutation(trpc.auth.forgotPassword.mutationOptions({
        onSuccess: () => {
            setIsSubmitted(true);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    }));

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        mode: "all",
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
            username: "",
            listedProducts: "",
            numberOfProducts: 0,
        },
    });

    const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
        forgotPasswordMutation.mutate(values);
    };

    if (isSubmitted) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <CardTitle className="text-xl font-medium">Request Submitted</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        An agent will send you an email within 24 hours to update your password.
                    </p>
                    <Button onClick={onBack} variant="outline" className="w-full">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Sign In
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Button
                        onClick={onBack}
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-xl font-medium">Forgot Password</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                    Please provide the following information to verify your identity and reset your password.
                </p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" placeholder="Enter your email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter your username" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="listedProducts"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Listed Products</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="List the names of products you have listed on your account..."
                                            className="min-h-[80px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="numberOfProducts"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number of Listed Products</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            min="0"
                                            placeholder="Enter number of products"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-black text-white hover:bg-gray-800"
                            disabled={forgotPasswordMutation.isPending}
                        >
                            {forgotPasswordMutation.isPending ? "Submitting..." : "Submit Request"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
