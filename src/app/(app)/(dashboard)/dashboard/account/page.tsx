"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Form as ShadForm } from "@/components/ui/form";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormType = z.infer<typeof passwordSchema>;
const walletSchema = z.object({
  usdtNetwork: z.enum(["TRC20", "ERC20", "BEP20"], { required_error: "Network is required" }),
  usdtWalletAddress: z.string().min(5, "Wallet address is required"),
});
type WalletFormType = z.infer<typeof walletSchema>;
const storeSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  image: z.string().optional().nullable(), // media id
});
type StoreFormType = z.infer<typeof storeSchema>;

const SIDEBAR_SECTIONS = [
  { key: "info", label: "Account Info" },
  { key: "wallet", label: "Change Wallet Address" },
  { key: "password", label: "Change Password" },
];

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [wallet, setWallet] = useState("");
  const [network, setNetwork] = useState<"TRC20" | "ERC20" | "BEP20">("TRC20");
  const [storeImageUrl, setStoreImageUrl] = useState<string | null>(null);
  const [storeImageId, setStoreImageId] = useState<string | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);

  // Change Password Form
  const passwordForm = useForm<PasswordFormType>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // USDT Wallet Form
  const walletForm = useForm<WalletFormType>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      usdtNetwork: network,
      usdtWalletAddress: wallet,
    },
  });

  // Fix: set storeForm default values from tenant if available
  const storeForm = useForm<StoreFormType>({
    resolver: zodResolver(storeSchema),
    defaultValues: { name: "", image: null },
  });

  // Mutations
  const changePassword = useMutation(trpc.user.changePassword.mutationOptions());
  const updateWallet = useMutation(trpc.user.updateWallet.mutationOptions());
  const updateStore = useMutation(trpc.tenants.update.mutationOptions());

  // Fetch current session (to get tenant slug)
  const { data: session } = useQuery({
    ...trpc.auth.session.queryOptions(),
  });
  // Fix: support both string and object for tenant
  let tenantSlug: string | undefined = undefined;
  const userTenant = session?.user?.tenants?.[0]?.tenant;
  if (typeof userTenant === 'string') {
    tenantSlug = userTenant;
  } else if (userTenant && typeof userTenant === 'object' && 'slug' in userTenant) {
    tenantSlug = userTenant.slug;
  }
  // Fetch tenant info
  const { data: tenant, isLoading: loadingTenant, refetch: refetchTenant } = useQuery(
    tenantSlug
      ? trpc.tenants.getOne.queryOptions({ slug: tenantSlug })
      : { queryKey: ["tenants.getOne-disabled"], enabled: false, queryFn: async () => undefined } as any
  );

  useEffect(() => {
    if (tenant && Object.keys(tenant).length > 0 && (tenant as any).id) {
      setStoreId((tenant as any).id);
      // Only reset if values changed to avoid React warning
      storeForm.reset({ name: (tenant as any).name, image: (tenant as any).image?.id || null });
      setStoreImageId((tenant as any).image?.id || null);
      setStoreImageUrl((tenant as any).image?.url || null);
      setStoreLoading(false);
    }
  }, [tenant]);

  const onPasswordSubmit = async (values: PasswordFormType) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed successfully!");
      passwordForm.reset();
    } catch (e: any) {
      toast.error(e?.message || "Failed to change password");
    }
  };

  const onWalletSubmit = async (values: WalletFormType) => {
    try {
      await updateWallet.mutateAsync({ 
        usdtNetwork: values.usdtNetwork,
        usdtWalletAddress: values.usdtWalletAddress 
      });
      setWallet(values.usdtWalletAddress);
      setNetwork(values.usdtNetwork);
      toast.success("Wallet address updated!");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update wallet address");
    }
  };

  // Sidebar state
  const [activeSection, setActiveSection] = useState<string>("info");

  // Get user email
  const userEmail = session?.user?.email || "-";
  // Get wallet address (from user or wallet state)
  const walletAddress = session?.user?.usdtWalletAddress || wallet || "-";
  // Get store name (type guard for tenant)
  const storeName = (tenant && typeof tenant === 'object' && 'name' in tenant && typeof tenant.name === 'string' && tenant.name) ? tenant.name : "-";
  // Get wallet network
  const walletNetwork = session?.user?.usdtNetwork || network || "-";

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-12 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <nav className="flex flex-col gap-2">
              {SIDEBAR_SECTIONS.map((section) => (
                <button
                  key={section.key}
                  className={`text-left px-3 py-2 rounded transition font-medium cursor-pointer ${activeSection === section.key ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setActiveSection(section.key)}
                  type="button"
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeSection === "info" && (
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Store Name</div>
                    <div className="text-lg font-semibold">{String(storeName)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div className="text-lg font-semibold break-all">{userEmail}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Wallet Network</div>
                    <div className="text-lg font-semibold">{walletNetwork}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Wallet Address</div>
                    <div className="text-sm font-mono break-all bg-gray-50 p-2 rounded">{walletAddress}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeSection === "wallet" && (
            <Card>
              <CardHeader>
                <CardTitle>Change Wallet Address</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...walletForm}>
                  <form onSubmit={walletForm.handleSubmit(onWalletSubmit)} className="space-y-4">
                    <FormField name="usdtNetwork" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Network</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select network" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TRC20">TRC20</SelectItem>
                              <SelectItem value="ERC20">ERC20</SelectItem>
                              <SelectItem value="BEP20">BEP20</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                <FormField name="usdtWalletAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your USDT wallet address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                    <Button  variant="elevated" type="submit" className="w-full bg-black text-white hover:bg-white hover:text-black">
                      Save Wallet Address
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {activeSection === "password" && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField name="currentPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" autoComplete="current-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="newPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" autoComplete="new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" autoComplete="new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button variant="elevated" type="submit" className="w-full bg-black text-white hover:bg-white hover:text-black">
                      Change Password
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;