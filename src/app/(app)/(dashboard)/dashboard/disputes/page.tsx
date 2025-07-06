"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { useTRPC } from "@/trpc/client";
import { DisputeCard } from "@/modules/disputes/ui/components/dispute-card";

const statusOptions = [
  { value: "all", label: "All Disputes" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function DisputesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const trpc = useTRPC();

  const { data: disputes, isLoading, error } = useQuery({
    ...trpc.disputes.getMyDisputes.queryOptions({
      limit: 10,
      page: currentPage,
      status: statusFilter === "all" ? undefined : statusFilter as any,
    }),
    refetchOnWindowFocus: false,
  });

  const getStatusCounts = () => {
    if (!disputes?.docs) return {};
    
    const counts: Record<string, number> = {};
    disputes.docs.forEach((dispute: any) => {
      counts[dispute.status] = (counts[dispute.status] || 0) + 1;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading disputes. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dispute Center</h1>
            <p className="text-muted-foreground">
              Manage your disputes and communicate with other parties
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">
                {statusCounts.open || 0}
              </div>
              <p className="text-sm text-muted-foreground">Open</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">
                {statusCounts['in-progress'] || 0}
              </div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.resolved || 0}
              </div>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-600">
                {statusCounts.closed || 0}
              </div>
              <p className="text-sm text-muted-foreground">Closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Disputes List */}
        <div className="space-y-4">
          {disputes?.docs && disputes.docs.length > 0 ? (
            disputes.docs.map((dispute: any) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                currentUserId={dispute.buyer?.id} // This should come from user context
              />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {statusFilter === "all" 
                      ? "You don't have any disputes yet." 
                      : `No ${statusFilter} disputes found.`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Disputes can be created from your purchase history when you have issues with orders.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {disputes?.totalPages && disputes.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {disputes.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(disputes.totalPages, prev + 1))}
              disabled={currentPage === disputes.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
