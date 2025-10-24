import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Clock, CheckCircle2, Eye, Calendar, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Grievance } from "@shared/schema";

export default function OfficialDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTimeline, setSelectedTimeline] = useState<{ [key: string]: number }>({});

  const { data: grievances, isLoading } = useQuery<Grievance[]>({
    queryKey: ["/api/grievances/assigned"],
  });

  const acceptTaskMutation = useMutation({
    mutationFn: ({ id, timeline }: { id: string; timeline: number }) =>
      apiRequest("POST", `/api/grievances/${id}/accept`, { resolutionTimeline: timeline }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grievances/assigned"] });
      toast({
        title: "Task Accepted",
        description: "Grievance has been assigned to you",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-blue-500",
      medium: "bg-status-verification",
      high: "bg-status-overdue",
    };
    return colors[priority as keyof typeof colors] || "bg-status-verification";
  };

  const newAssignments = grievances?.filter(g => g.status === "pending") || [];
  const inProgress = grievances?.filter(g => g.status === "in_progress") || [];
  const overdue = grievances?.filter(g => {
    if (!g.dueDate || g.status === "resolved") return false;
    return new Date(g.dueDate) < new Date();
  }) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <span>Assigned Grievances</span>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            Panchayat Officer
          </Badge>
        </h1>
        <p className="text-lg text-muted-foreground">Manage and resolve community grievances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-overdue mb-1">{newAssignments.length}</div>
              <div className="text-sm text-muted-foreground">New Assignments</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-progress mb-1">{inProgress.length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-overdue mb-1">{overdue.length}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {newAssignments.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">New Assignments</h2>
            <div className="space-y-4">
              {newAssignments.map((grievance) => (
                <Card
                  key={grievance.id}
                  className="border-l-4 border-l-status-overdue"
                  data-testid={`card-assignment-${grievance.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-status-overdue text-white">
                            <AlertCircle className="w-4 h-4 mr-1.5" />
                            NEW ASSIGNMENT
                          </Badge>
                          <span className="text-sm text-muted-foreground">#{grievance.grievanceNumber}</span>
                          <Badge className={`${getPriorityColor(grievance.priority)} text-white`}>
                            {grievance.priority.toUpperCase()}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Village</div>
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {grievance.villageName}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Submitted</div>
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(grievance.createdAt), "MMM dd, yyyy")}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Category</div>
                        <div className="text-sm font-medium">{grievance.category}</div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg">
                      <label className="text-sm font-medium mb-2 block">Set Resolution Timeline</label>
                      <div className="flex gap-3 items-center flex-wrap">
                        <Select
                          onValueChange={(value) => 
                            setSelectedTimeline({ ...selectedTimeline, [grievance.id]: parseInt(value) })
                          }
                          defaultValue="15"
                        >
                          <SelectTrigger className="w-48" data-testid={`select-timeline-${grievance.id}`}>
                            <SelectValue placeholder="Select Days" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="15">15 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() =>
                            acceptTaskMutation.mutate({
                              id: grievance.id,
                              timeline: selectedTimeline[grievance.id] || 15,
                            })
                          }
                          disabled={acceptTaskMutation.isPending}
                          data-testid={`button-accept-task-${grievance.id}`}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          Accept Task
                        </Button>
                        <Button variant="outline" data-testid={`button-view-full-details-${grievance.id}`}>
                          <Eye className="w-4 h-4 mr-1.5" />
                          View Full Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {inProgress.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">In Progress</h2>
            <div className="space-y-4">
              {inProgress.map((grievance) => (
                <Card
                  key={grievance.id}
                  className="border-l-4 border-l-status-progress"
                  data-testid={`card-in-progress-${grievance.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-status-progress text-white">
                            <Clock className="w-4 h-4 mr-1.5" />
                            IN PROGRESS
                          </Badge>
                          <span className="text-sm text-muted-foreground">#{grievance.grievanceNumber}</span>
                        </div>
                        <CardTitle className="text-xl">{grievance.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Village</div>
                        <div className="text-sm font-medium">{grievance.villageName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Due Date</div>
                        <div className="text-sm font-medium">
                          {grievance.dueDate ? format(new Date(grievance.dueDate), "MMM dd, yyyy") : "Not set"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Category</div>
                        <div className="text-sm font-medium">{grievance.category}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button variant="default" data-testid={`button-mark-resolved-${grievance.id}`}>
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Mark as Resolved
                      </Button>
                      <Button variant="outline" data-testid={`button-view-details-in-progress-${grievance.id}`}>
                        <Eye className="w-4 h-4 mr-1.5" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {grievances && grievances.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No grievances assigned</p>
                <p className="text-sm mt-2">New assignments will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
