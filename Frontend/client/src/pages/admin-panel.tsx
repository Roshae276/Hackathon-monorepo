import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Clock, Eye, Calendar, TrendingUp, Shield, ArrowUp, History } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Grievance, EscalationHistory } from "@shared/schema";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [escalationReasons, setEscalationReasons] = useState<{ [key: string]: string }>({});
  const [selectedGrievanceForHistory, setSelectedGrievanceForHistory] = useState<string | null>(null);

  const { data: disputedGrievances, isLoading: isLoadingDisputed } = useQuery<Grievance[]>({
    queryKey: ["/api/admin/disputed"],
  });

  const { data: overdueGrievances, isLoading: isLoadingOverdue } = useQuery<Grievance[]>({
    queryKey: ["/api/admin/overdue"],
  });

  const { data: escalationHistory } = useQuery<EscalationHistory[]>({
    queryKey: ["/api/escalation-history", selectedGrievanceForHistory],
    enabled: !!selectedGrievanceForHistory,
    queryFn: () => apiRequest("GET", `/api/escalation-history/${selectedGrievanceForHistory}`),
  });

  const escalateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiRequest("POST", `/api/grievances/${id}/escalate`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/disputed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/overdue"] });
      toast({
        title: "Grievance Escalated",
        description: "The grievance has been escalated to the next authority level.",
      });
      setEscalationReasons({});
    },
  });

  const isLoading = isLoadingDisputed || isLoadingOverdue;

  const getAuthorityLevelColor = (level: string) => {
    const colors = {
      panchayat: "bg-blue-500",
      block: "bg-status-verification",
      district: "bg-status-overdue",
      state: "bg-purple-500",
    };
    return colors[level as keyof typeof colors] || "bg-gray-500";
  };

  const getAuthorityLevelLabel = (level: string) => {
    const labels = {
      panchayat: "Panchayat",
      block: "Block Level",
      district: "District Level",
      state: "State Level",
    };
    return labels[level as keyof typeof labels] || level;
  };

  const getDaysOverdue = (dueDate: string | Date | null): number => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8" />
          Admin Panel
        </h1>
        <p className="text-lg text-muted-foreground">
          Monitor and manage disputed and overdue grievances
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-overdue mb-1">
                {disputedGrievances?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Disputed Grievances</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-verification mb-1">
                {overdueGrievances?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Overdue Grievances</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {disputedGrievances?.filter(g => g.escalationCount > 0).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Escalated Cases</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-resolved mb-1">
                {disputedGrievances?.filter(g => g.communityDisputeCount >= 2).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="disputed" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="disputed" data-testid="tab-disputed">Disputed Grievances</TabsTrigger>
          <TabsTrigger value="overdue" data-testid="tab-overdue">Overdue Grievances</TabsTrigger>
        </TabsList>

        <TabsContent value="disputed" className="space-y-4">
          {disputedGrievances && disputedGrievances.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <div className="text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No disputed grievances</p>
                  <p className="text-sm mt-2">All grievances are verified</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            disputedGrievances?.map((grievance) => (
              <Card
                key={grievance.id}
                className="border-l-4 border-l-status-overdue"
                data-testid={`card-disputed-${grievance.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className="bg-status-overdue text-white">
                          <AlertTriangle className="w-4 h-4 mr-1.5" />
                          DISPUTED
                        </Badge>
                        <span className="text-sm text-muted-foreground">#{grievance.grievanceNumber}</span>
                        <Badge className={`${getAuthorityLevelColor(grievance.currentAuthorityLevel)} text-white`}>
                          {getAuthorityLevelLabel(grievance.currentAuthorityLevel)}
                        </Badge>
                        {grievance.escalationCount > 0 && (
                          <Badge variant="secondary">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Escalated {grievance.escalationCount}x
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{grievance.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {grievance.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Village</div>
                      <div className="text-sm font-medium">{grievance.villageName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Category</div>
                      <div className="text-sm font-medium">{grievance.category}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">User Satisfaction</div>
                      <div className="text-sm font-medium">
                        {grievance.userSatisfaction === "satisfied" ? (
                          <span className="text-status-resolved">👍 Satisfied</span>
                        ) : grievance.userSatisfaction === "not_satisfied" ? (
                          <span className="text-status-overdue">👎 Not Satisfied</span>
                        ) : (
                          <span className="text-muted-foreground">No response</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Community Disputes</div>
                      <div className="text-sm font-medium text-status-overdue">
                        {grievance.communityDisputeCount} disputes
                      </div>
                    </div>
                  </div>

                  {grievance.escalationReason && (
                    <div className="bg-status-overdue/10 border border-status-overdue/30 rounded-md p-3">
                      <h4 className="text-sm font-semibold mb-1">Escalation Reason:</h4>
                      <p className="text-sm text-muted-foreground">{grievance.escalationReason}</p>
                    </div>
                  )}

                  {escalationReasons[grievance.id] !== undefined ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Escalation Reason (minimum 100 characters):
                        </label>
                        <Textarea
                          value={escalationReasons[grievance.id] || ""}
                          onChange={(e) =>
                            setEscalationReasons({ ...escalationReasons, [grievance.id]: e.target.value })
                          }
                          placeholder="Provide detailed justification for escalation..."
                          className="min-h-32"
                          data-testid={`textarea-escalation-reason-${grievance.id}`}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {escalationReasons[grievance.id]?.length || 0} / 100 characters
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            escalateMutation.mutate({ id: grievance.id, reason: escalationReasons[grievance.id] })
                          }
                          disabled={!escalationReasons[grievance.id] || escalationReasons[grievance.id].length < 100}
                          data-testid={`button-submit-escalate-${grievance.id}`}
                        >
                          <ArrowUp className="w-4 h-4 mr-1.5" />
                          Confirm Escalation
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newReasons = { ...escalationReasons };
                            delete newReasons[grievance.id];
                            setEscalationReasons(newReasons);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedGrievanceForHistory(grievance.id)}
                            data-testid={`button-escalation-history-${grievance.id}`}
                          >
                            <History className="w-4 h-4 mr-1.5" />
                            View Escalation History
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Escalation History - #{grievance.grievanceNumber}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            {escalationHistory && escalationHistory.length > 0 ? (
                              escalationHistory.map((entry, index) => (
                                <Card key={entry.id} className="border-l-4 border-l-primary">
                                  <CardContent className="pt-4">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                      <Badge className="bg-primary text-white">
                                        Level {index + 1}: {entry.toAuthorityLevel}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {format(new Date(entry.escalatedAt), "MMM dd, yyyy HH:mm")}
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-sm font-medium">From: </span>
                                        <span className="text-sm text-muted-foreground">{entry.fromAuthorityLevel}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium">Reason: </span>
                                        <p className="text-sm text-muted-foreground mt-1">{entry.reason}</p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium">Due Date: </span>
                                        <span className="text-sm text-muted-foreground">
                                          {format(new Date(entry.escalationDueDate), "MMM dd, yyyy")}
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No escalation history available</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setEscalationReasons({ ...escalationReasons, [grievance.id]: "" })}
                        data-testid={`button-escalate-${grievance.id}`}
                      >
                        <ArrowUp className="w-4 h-4 mr-1.5" />
                        Escalate to Next Level
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueGrievances && overdueGrievances.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <div className="text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No overdue grievances</p>
                  <p className="text-sm mt-2">All grievances are on track</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            overdueGrievances?.map((grievance) => {
              const daysOverdue = getDaysOverdue(grievance.dueDate);

              return (
                <Card
                  key={grievance.id}
                  className="border-l-4 border-l-status-verification"
                  data-testid={`card-overdue-${grievance.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className="bg-status-verification text-white">
                            <Clock className="w-4 h-4 mr-1.5" />
                            OVERDUE
                          </Badge>
                          <span className="text-sm text-muted-foreground">#{grievance.grievanceNumber}</span>
                          <Badge className={`${getAuthorityLevelColor(grievance.currentAuthorityLevel)} text-white`}>
                            {getAuthorityLevelLabel(grievance.currentAuthorityLevel)}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{grievance.title}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {grievance.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Village</div>
                        <div className="text-sm font-medium">{grievance.villageName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Category</div>
                        <div className="text-sm font-medium">{grievance.category}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Due Date</div>
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {grievance.dueDate ? format(new Date(grievance.dueDate), "MMM dd, yyyy") : "Not set"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Days Overdue</div>
                        <div className="text-sm font-medium text-status-overdue">
                          {daysOverdue} days
                        </div>
                      </div>
                    </div>

                    <div className="bg-status-verification/10 border border-status-verification/30 rounded-md p-3">
                      <p className="text-sm font-medium text-status-verification">
                        This grievance is {daysOverdue} days overdue and should be auto-escalated
                      </p>
                    </div>

                    {escalationReasons[grievance.id] !== undefined ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Escalation Reason (minimum 100 characters):
                          </label>
                          <Textarea
                            value={escalationReasons[grievance.id] || ""}
                            onChange={(e) =>
                              setEscalationReasons({ ...escalationReasons, [grievance.id]: e.target.value })
                            }
                            placeholder="Provide detailed justification for escalation due to overdue status..."
                            className="min-h-32"
                            data-testid={`textarea-escalation-reason-overdue-${grievance.id}`}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            {escalationReasons[grievance.id]?.length || 0} / 100 characters
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              escalateMutation.mutate({ id: grievance.id, reason: escalationReasons[grievance.id] })
                            }
                            disabled={!escalationReasons[grievance.id] || escalationReasons[grievance.id].length < 100}
                            data-testid={`button-submit-escalate-overdue-${grievance.id}`}
                          >
                            <ArrowUp className="w-4 h-4 mr-1.5" />
                            Confirm Escalation
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const newReasons = { ...escalationReasons };
                              delete newReasons[grievance.id];
                              setEscalationReasons(newReasons);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedGrievanceForHistory(grievance.id)}
                              data-testid={`button-escalation-history-overdue-${grievance.id}`}
                            >
                              <History className="w-4 h-4 mr-1.5" />
                              View Escalation History
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Escalation History - #{grievance.grievanceNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              {escalationHistory && escalationHistory.length > 0 ? (
                                escalationHistory.map((entry, index) => (
                                  <Card key={entry.id} className="border-l-4 border-l-primary">
                                    <CardContent className="pt-4">
                                      <div className="flex items-start justify-between gap-4 mb-2">
                                        <Badge className="bg-primary text-white">
                                          Level {index + 1}: {entry.toAuthorityLevel}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                          {format(new Date(entry.escalatedAt), "MMM dd, yyyy HH:mm")}
                                        </span>
                                      </div>
                                      <div className="space-y-2">
                                        <div>
                                          <span className="text-sm font-medium">From: </span>
                                          <span className="text-sm text-muted-foreground">{entry.fromAuthorityLevel}</span>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium">Reason: </span>
                                          <p className="text-sm text-muted-foreground mt-1">{entry.reason}</p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium">Due Date: </span>
                                          <span className="text-sm text-muted-foreground">
                                            {format(new Date(entry.escalationDueDate), "MMM dd, yyyy")}
                                          </span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                  <p>No escalation history available</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setEscalationReasons({ ...escalationReasons, [grievance.id]: "" })}
                          data-testid={`button-force-escalate-${grievance.id}`}
                        >
                          <ArrowUp className="w-4 h-4 mr-1.5" />
                          Force Escalate
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
