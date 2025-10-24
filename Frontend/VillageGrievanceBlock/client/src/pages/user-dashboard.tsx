import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, Eye, MessageSquare, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { Grievance } from "@shared/schema";

export default function UserDashboard() {
  const { data: grievances, isLoading } = useQuery<Grievance[]>({
    queryKey: ["/api/grievances"],
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-status-pending",
      in_progress: "bg-status-progress",
      resolved: "bg-status-resolved",
      pending_verification: "bg-status-verification",
      overdue: "bg-status-overdue",
    };
    return colors[status as keyof typeof colors] || "bg-status-pending";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      in_progress: AlertCircle,
      resolved: CheckCircle2,
      pending_verification: AlertTriangle,
      overdue: AlertCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: "Pending",
      in_progress: "In Progress",
      resolved: "Resolved",
      pending_verification: "Pending Verification",
      overdue: "Overdue",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getDaysOverdue = (dueDate: string | null): number => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const filterGrievances = (status?: string) => {
    if (!grievances) return [];
    if (!status) return grievances;
    return grievances.filter(g => g.status === status);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your grievances...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <span>My Grievances</span>
        </h1>
        <p className="text-lg text-muted-foreground">Track and manage your submitted complaints</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{grievances?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Grievances</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-pending mb-1">
                {filterGrievances("pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-progress mb-1">
                {filterGrievances("in_progress").length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-resolved mb-1">
                {filterGrievances("resolved").length}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl mb-6">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue" data-testid="tab-overdue">Overdue</TabsTrigger>
          <TabsTrigger value="pending_verification" data-testid="tab-verification">Verification</TabsTrigger>
          <TabsTrigger value="resolved" data-testid="tab-resolved">Resolved</TabsTrigger>
        </TabsList>

        {["all", "pending", "overdue", "pending_verification", "resolved"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filterGrievances(tab === "all" ? undefined : tab).length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No grievances found</p>
                    <p className="text-sm mt-2">Submit a new grievance to get started</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filterGrievances(tab === "all" ? undefined : tab).map((grievance) => {
                const daysOverdue = getDaysOverdue(grievance.dueDate);
                const isOverdue = daysOverdue > 0 && grievance.status !== "resolved";
                
                return (
                  <Card
                    key={grievance.id}
                    className={`border-l-4 ${
                      isOverdue ? "border-l-status-overdue" : `border-l-${getStatusColor(grievance.status).replace("bg-", "")}`
                    }`}
                    data-testid={`card-grievance-${grievance.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={`${getStatusColor(isOverdue ? "overdue" : grievance.status)} text-white`}
                            >
                              {getStatusIcon(isOverdue ? "overdue" : grievance.status)}
                              <span className="ml-1.5">{isOverdue ? "OVERDUE" : getStatusLabel(grievance.status)}</span>
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              #{grievance.grievanceNumber}
                            </span>
                          </div>
                          <CardTitle className="text-xl">{grievance.title}</CardTitle>
                          <CardDescription className="mt-2 line-clamp-2">
                            {grievance.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Submitted</div>
                          <div className="text-sm font-medium flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(grievance.createdAt), "MMM dd, yyyy")}
                          </div>
                        </div>
                        {grievance.dueDate && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Due Date</div>
                            <div className="text-sm font-medium flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {format(new Date(grievance.dueDate), "MMM dd, yyyy")}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Category</div>
                          <div className="text-sm font-medium">{grievance.category}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Village</div>
                          <div className="text-sm font-medium">{grievance.villageName}</div>
                        </div>
                      </div>

                      {isOverdue && (
                        <div className="bg-status-overdue/10 border border-status-overdue/30 rounded-md p-3">
                          <p className="text-sm font-medium text-status-overdue">
                            Days Overdue: {daysOverdue} | Auto-Escalated to District
                          </p>
                        </div>
                      )}

                      {grievance.status === "pending_verification" && (
                        <div className="bg-status-verification/10 border border-status-verification/30 rounded-md p-3">
                          <p className="text-sm font-medium text-status-verification">
                            Community Verification: 5 days remaining
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" data-testid={`button-view-details-${grievance.id}`}>
                          <Eye className="w-4 h-4 mr-1.5" />
                          View Details
                        </Button>
                        {grievance.status === "pending_verification" && (
                          <Button variant="default" size="sm" data-testid={`button-verify-${grievance.id}`}>
                            <MessageSquare className="w-4 h-4 mr-1.5" />
                            Verify/Dispute
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
