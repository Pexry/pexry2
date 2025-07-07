"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { LoaderIcon, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const MIN_WITHDRAWAL = 10;

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "approved":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "approved":
      return <CheckCircle className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  // Fetch availableForWithdrawal from backend
  const { data, isLoading, error } = useQuery({
    ...trpc.user.availableForWithdrawal.queryOptions(),
  });
  
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [amount, setAmount] = useState("");
  const withdrawMutation = useMutation(trpc.user.requestWithdrawal.mutationOptions());

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt < MIN_WITHDRAWAL || amt > (data?.availableForWithdrawal ?? 0)) {
        toast.error(`Enter an amount between $${MIN_WITHDRAWAL} and $${data?.availableForWithdrawal ?? 0}`);
        setIsWithdrawing(false);
        return;
      }
      await withdrawMutation.mutateAsync({ amount: amt });
      toast.success("Withdrawal request submitted!");
      setAmount("");
      queryClient.invalidateQueries({ queryKey: trpc.user.availableForWithdrawal.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.user.withdrawalHistory.queryKey() });
    } catch (e: any) {
      toast.error(e?.message || "Failed to request withdrawal");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Fetch withdrawal history
  const { data: history, isLoading: loadingHistory } = useQuery({
    ...trpc.user.withdrawalHistory.queryOptions(),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoaderIcon className="animate-spin size-8 text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-10">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading payout data: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-12 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Withdraw Earnings</h1>
          <p className="text-muted-foreground">
            Request withdrawals from your available earnings
          </p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Available for Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-green-600">
              ${data?.availableForWithdrawal?.toFixed(2) ?? "0.00"}
            </div>
            <p className="text-sm text-muted-foreground">
              Ready to withdraw immediately
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Balance on Hold
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-yellow-600">
              ${data?.balanceOnHold?.toFixed(2) ?? "0.00"}
            </div>
            <p className="text-sm text-muted-foreground">
              Held due to open disputes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Total Earnings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium">Total Earnings:</span>
            <span className="font-bold text-blue-600">
              ${data?.totalEarnings?.toFixed(2) ?? "0.00"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Form */}
      {data?.pendingWithdrawal ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Withdrawal Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-yellow-800">Amount Requested:</span>
                <span className="font-bold text-yellow-800">${data.pendingWithdrawal.amount?.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-yellow-800">Status:</span>
                <Badge className={getStatusColor(data.pendingWithdrawal.status || 'pending')}>
                  {getStatusIcon(data.pendingWithdrawal.status || 'pending')}
                  <span className="ml-1 capitalize">{data.pendingWithdrawal.status}</span>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-yellow-800">Requested:</span>
                <span className="text-yellow-700">
                  {data.pendingWithdrawal.createdAt 
                    ? formatDistanceToNow(new Date(data.pendingWithdrawal.createdAt), { addSuffix: true })
                    : 'Unknown'
                  }
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              You cannot submit a new withdrawal request while you have a {data.pendingWithdrawal.status} request.
              Please wait for it to be processed.
            </p>
          </CardContent>
        </Card>
      ) : (data?.availableForWithdrawal ?? 0) >= MIN_WITHDRAWAL ? (
        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Withdrawal Amount</span>
                <span className="text-sm text-muted-foreground">
                  Min: ${MIN_WITHDRAWAL}
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`Min $${MIN_WITHDRAWAL}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={data?.availableForWithdrawal ?? 0}
                  min={MIN_WITHDRAWAL}
                />
                <Button 
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="shrink-0"
                >
                  {isWithdrawing ? <LoaderIcon className="animate-spin h-4 w-4" /> : "Withdraw"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>Minimum withdrawal amount is ${MIN_WITHDRAWAL}.</p>
              <p>You need at least ${MIN_WITHDRAWAL} available to request a withdrawal.</p>
              <p>Withdrawals are made each Monday</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <LoaderIcon className="animate-spin size-6 text-muted-foreground" />
            </div>
          ) : !history || history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No withdrawal requests yet.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((request: any) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            ${request.amount.toFixed(2)}
                          </span>
                          <Badge className={getStatusColor(request.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Requested{" "}
                          {formatDistanceToNow(new Date(request.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {request.processedAt && (
                        <div className="text-right text-sm text-muted-foreground">
                          Processed{" "}
                          {formatDistanceToNow(new Date(request.processedAt), {
                            addSuffix: true,
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
