"use client";

import z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { Poppins } from "next/font/google";
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import{
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { registerSchema } from "../../schemas";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
});

export const SignUpView = () => {

const router = useRouter();

const trpc = useTRPC();
const queryClient = useQueryClient();

const register = useMutation(trpc.auth.register.mutationOptions({
    onError: (error) => {
        toast.error(error.message);
    },
    onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
        router.push("/");
    },
}));

    const form = useForm<z.infer<typeof registerSchema>>({
        mode: "onChange",
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            username: "",
        },
    });

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        console.log('Form submitted with values:', values);
        console.log('Form valid:', form.formState.isValid);
        console.log('Form errors:', form.formState.errors);
        register.mutate(values);
    }
    
    const username = form.watch("username");
    const password = form.watch("password");
    const confirmPassword = form.watch("confirmPassword");
    const usernameErrors = form.formState.errors.username;

    const showPreview = username && !usernameErrors;
    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="bg-[#F4F4F0] h-screen w-full lg:col-span-3 overflow-y-auto">
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
                                <Link prefetch href="/sign-in">
                                    Sign in
                                </Link>
                            </Button>
                        </div>
                        <h1 className="text-4xl font-medium">
                            Join now to publish your digital products and memberships, Reach millions of customers worldwide.
                        </h1>  
                        <FormField 
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">Username</FormLabel>
                                    <FormControl>
                                        <Input {...field}/>
                                    </FormControl>
                                    <FormDescription
                                        className={cn("hidden", showPreview && "block" )}
                                    >
                                        Your store will be available at&nbsp;
                                        {/*TODO : use propper method to generate preview url */}
                                        <strong>{username}</strong>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />  
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
                                        <Input {...field} type="password" autoComplete="new-password"/>
                                    </FormControl>  
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">Retype Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" autoComplete="new-password"/>
                                    </FormControl>
                                    {passwordsMatch && confirmPassword && (
                                        <FormDescription className="text-green-600">
                                            ✓ Passwords match
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            disabled={register.isPending}
                            type="submit"
                            size="lg"
                            variant="elevated"
                            className="bg-black text-white hover:bg-teal-400 hover:text-primary"
                            onClick={() => {
                                console.log('Button clicked');
                                console.log('Is pending:', register.isPending);
                                console.log('Is form valid:', form.formState.isValid);
                                console.log('Form errors:', form.formState.errors);
                            }}
                        >
                            {register.isPending ? "Creating account..." : "Create account"}
                        </Button>
                   </form>
                </Form>
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