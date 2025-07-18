"use client";

import z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { Poppins } from "next/font/google";
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
//import { useTRPC } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import{
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { loginSchema } from "../../schemas";
import { useTRPC } from "@/trpc/client";
import { ForgotPasswordForm } from "../components/forgot-password-form";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
});

export const SignInView = () => {
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const router = useRouter();

const trpc = useTRPC();
const queryClient = useQueryClient();

const login = useMutation(trpc.auth.login.mutationOptions({
    
    onError: (error) => {
        toast.error(error.message);
    },
    onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
        router.push("/");
    },
}));

    const form = useForm<z.infer<typeof loginSchema>>({
        mode: "all",
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof loginSchema>) => {
        login.mutate(values);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="bg-[#F4F4F0] h-screen w-full lg:col-span-3 overflow-y-auto">
                {showForgotPassword ? (
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
                    </div>
                ) : (
                    <Form {...form}>
                       <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-8 p-4 lg:p-16"
                       >
                            <div className="flex items-center justify-between mb-8">
                                <Link href="/">
                                    <span className={cn("text-2xl font-semibold", poppins.className)}>
                                        Pexry
                                    </span>
                                </Link>
                                <Button 
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="text-base border-none underline"
                                >
                                    <Link prefetch href="/sign-up">
                                        Sign up
                                    </Link>
                                </Button>
                            </div>
                            <h1 className="text-4xl font-medium">
                                 Welcome Back.
                            </h1>  
                            <FormField 
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">Email</FormLabel>
                                        <FormControl>
                                            <Input {...field}/>
                                        </FormControl>  
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">Password</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="password" autoComplete="current-password"/>
                                        </FormControl>  
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    className="underline cursor-pointer text-black"
                                    onClick={() => setShowForgotPassword(true)}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <Button
                                disabled={login.isPending}
                                type="submit"
                                size="lg"
                                variant="elevated"
                                className="bg-black text-white hover:bg-teal-400 hover:text-primary"
                            >
                            Log in
                       </Button>
                       </form>
                    </Form>
                )}
            </div>
            <div 
                className="h-screen w-full lg:col-span-2 hidden lg:block"
                style={{
                   backgroundImage: "url('/digital-products.png')",
                   backgroundSize: "cover",
                   backgroundPosition: "center",
                }}
            />
        </div>
    );
};