"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Settings, Trash2, Eye, EyeOff, Users, Shield } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserAgentFormData {
  name: string;
  email: string;
  password: string;
  permissions: {
    handlePayouts: boolean;
    handleSupportTickets: boolean;
    handleLiveChat: boolean;
    viewUserData: boolean;
    manageDisputes: boolean;
  };
}

const initialFormData: UserAgentFormData = {
  name: "",
  email: "",
  password: "",
  permissions: {
    handlePayouts: false,
    handleSupportTickets: false,
    handleLiveChat: false,
    viewUserData: false,
    manageDisputes: false,
  },
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getAvailabilityColor = (availability: string) => {
  switch (availability) {
    case "available":
      return "bg-green-100 text-green-800";
    case "unavailable":
      return "bg-gray-100 text-gray-800";
    case "busy":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function UserAgentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserAgentFormData>(initialFormData);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  
  const trpc = useTRPC();

  // Load user agents
  const { data: agentsData, refetch: refetchAgents } = useQuery(
    trpc.userAgents.getAll.queryOptions({
      page: 1,
      limit: 50,
      status: statusFilter === "all" ? undefined : statusFilter,
    })
  );

  // Create agent mutation
  const createAgentMutation = useMutation(trpc.userAgents.create.mutationOptions({
    onSuccess: () => {
      toast.success("User agent created successfully!");
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      refetchAgents();
    },
    onError: (error) => {
      console.error('Error creating agent:', error);
      toast.error(error.message || "Failed to create user agent. Please try again.");
    }
  }));

  // Update agent mutation
  const updateAgentMutation = useMutation(trpc.userAgents.update.mutationOptions({
    onSuccess: () => {
      toast.success("User agent updated successfully!");
      refetchAgents();
    },
    onError: (error) => {
      console.error('Error updating agent:', error);
      toast.error(error.message || "Failed to update user agent. Please try again.");
    }
  }));

  // Delete agent mutation
  const deleteAgentMutation = useMutation(trpc.userAgents.delete.mutationOptions({
    onSuccess: () => {
      toast.success("User agent deleted successfully!");
      refetchAgents();
    },
    onError: (error) => {
      console.error('Error deleting agent:', error);
      toast.error(error.message || "Failed to delete user agent. Please try again.");
    }
  }));

  const handleCreateAgent = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    createAgentMutation.mutate(formData);
  };

  const handleUpdateStatus = (id: string, status: "active" | "inactive" | "suspended") => {
    updateAgentMutation.mutate({ id, status });
  };

  const handleDeleteAgent = (id: string) => {
    if (confirm("Are you sure you want to delete this user agent?")) {
      deleteAgentMutation.mutate({ id });
    }
  };

  const togglePasswordVisibility = (agentId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  const handlePermissionChange = (permission: keyof UserAgentFormData['permissions'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked
      }
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Agent Management</h1>
          <p className="text-gray-600">
            Manage support agents, their permissions, and availability
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New User Agent</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Agent's full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="agent@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Secure password"
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Permissions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="handlePayouts"
                        checked={formData.permissions.handlePayouts}
                        onCheckedChange={(checked) => handlePermissionChange('handlePayouts', checked as boolean)}
                      />
                      <Label htmlFor="handlePayouts">Handle Payouts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="handleSupportTickets"
                        checked={formData.permissions.handleSupportTickets}
                        onCheckedChange={(checked) => handlePermissionChange('handleSupportTickets', checked as boolean)}
                      />
                      <Label htmlFor="handleSupportTickets">Handle Support Tickets</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="handleLiveChat"
                        checked={formData.permissions.handleLiveChat}
                        onCheckedChange={(checked) => handlePermissionChange('handleLiveChat', checked as boolean)}
                      />
                      <Label htmlFor="handleLiveChat">Handle Live Chat Messages</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="viewUserData"
                        checked={formData.permissions.viewUserData}
                        onCheckedChange={(checked) => handlePermissionChange('viewUserData', checked as boolean)}
                      />
                      <Label htmlFor="viewUserData">View User Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="manageDisputes"
                        checked={formData.permissions.manageDisputes}
                        onCheckedChange={(checked) => handlePermissionChange('manageDisputes', checked as boolean)}
                      />
                      <Label htmlFor="manageDisputes">Manage Disputes</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAgent} disabled={createAgentMutation.isPending}>
                    {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Agents</p>
                <p className="text-2xl font-bold">{agentsData?.totalDocs || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {agentsData?.docs?.filter(a => a.status === "active").length || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-blue-600">
                  {agentsData?.docs?.filter(a => a.availability === "available").length || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Chats</p>
                <p className="text-2xl font-bold text-purple-600">
                  {agentsData?.docs?.reduce((sum, a) => sum + (a.totalChatsHandled || 0), 0) || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <div className="space-y-4">
        {agentsData?.docs?.map((agent) => (
          <Card key={agent.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                      <Badge className={getAvailabilityColor(agent.availability)}>
                        {agent.availability}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Password: 
                      {showPasswords[agent.id] ? (
                        <span className="font-mono ml-1">{agent.password}</span>
                      ) : (
                        <span className="ml-1">••••••••</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 ml-1"
                        onClick={() => togglePasswordVisibility(agent.id)}
                      >
                        {showPasswords[agent.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </span>
                    <span>Assigned Chats: {agent.assignedChats || 0}</span>
                    <span>Total Handled: {agent.totalChatsHandled || 0}</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.permissions?.handlePayouts && (
                        <Badge variant="outline">Handle Payouts</Badge>
                      )}
                      {agent.permissions?.handleSupportTickets && (
                        <Badge variant="outline">Support Tickets</Badge>
                      )}
                      {agent.permissions?.handleLiveChat && (
                        <Badge variant="outline">Live Chat</Badge>
                      )}
                      {agent.permissions?.viewUserData && (
                        <Badge variant="outline">View User Data</Badge>
                      )}
                      {agent.permissions?.manageDisputes && (
                        <Badge variant="outline">Manage Disputes</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={agent.status} onValueChange={(value: any) => handleUpdateStatus(agent.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {agentsData?.docs?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-500">
                Create your first user agent to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
