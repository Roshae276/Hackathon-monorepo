import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ThumbsUp, ThumbsDown, Users, Timer, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Grievance } from "@shared/schema";

export default function CommunityVerification() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [selectedGrievance, setSelectedGrievance] = useState<string | null>(null);

  const { data: grievances, isLoading } = useQuery<Grievance[]>({
    queryKey: ["/api/grievances/verification/pending"],
  });

  const userSatisfactionMutation = useMutation({
    mutationFn: ({ id, satisfaction }: { id: string; satisfaction: "satisfied" | "not_satisfied" }) =>
      apiRequest("POST", `/api/grievances/${id}/user-satisfaction`, { satisfaction }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grievances/verification/pending"] });
      toast({
        title: "Satisfaction Submitted",
        description: "Your response has been recorded and blockchain verified.",
      });
    },
  });

  const communityVoteMutation = useMutation({
    mutationFn: ({ id, voteType, comments }: { id: string; voteType: "verify" | "dispute"; comments?: string }) =>
      apiRequest("POST", `/api/grievances/${id}/community-vote`, { voteType, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grievances/verification/pending"] });
      toast({
        title: "Vote Recorded",
        description: "Your community vote has been submitted successfully.",
      });
      setComments({});
      setSelectedGrievance(null);
    },
  });

  const getDaysRemaining = (deadline: Date | string | null): number => {
    if (!deadline) return 0;
    const today = new Date();
    const due = new Date(deadline);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading grievances for verification...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Users className="w-8 h-8" />
          Community Verification Center
        </h1>
        <p className="text-lg text-muted-foreground">
          Help verify resolved grievances in your area and ensure accountability
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-verification mb-1">
                {grievances?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pending Verification</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-resolved mb-1">
                {grievances?.filter(g => g.communityVerifyCount >= 3).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Community Verified</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-status-overdue mb-1">
                {grievances?.filter(g => g.communityDisputeCount > 0).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Disputed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {grievances && grievances.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No grievances pending verification</p>
                <p className="text-sm mt-2">Check back later for new resolutions to verify</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          grievances?.map((grievance) => {
            const daysRemaining = getDaysRemaining(grievance.verificationDeadline);
            const hasUserResponded = !!grievance.userSatisfaction;

            return (
              <Card
                key={grievance.id}
                className="border-l-4 border-l-status-verification"
                data-testid={`card-verification-${grievance.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className="bg-status-verification text-white">
                          <Timer className="w-4 h-4 mr-1.5" />
                          PENDING VERIFICATION
                        </Badge>
                        <span className="text-sm text-muted-foreground">#{grievance.grievanceNumber}</span>
                      </div>
                      <CardTitle className="text-xl">{grievance.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {grievance.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Village</div>
                      <div className="text-sm font-medium">{grievance.villageName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Resolved On</div>
                      <div className="text-sm font-medium flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {grievance.resolvedAt ? format(new Date(grievance.resolvedAt), "MMM dd, yyyy") : "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Verification Window</div>
                      <div className="text-sm font-medium flex items-center gap-1.5">
                        <Timer className="w-4 h-4" />
                        {daysRemaining} days remaining
                      </div>
                    </div>
                  </div>

                  {grievance.resolutionNotes && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Resolution Notes:</h4>
                      <p className="text-sm text-muted-foreground">{grievance.resolutionNotes}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">👤 Original Reporter Status</h4>
                    {hasUserResponded ? (
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm font-medium">
                          User Response: {grievance.userSatisfaction === "satisfied" ? (
                            <span className="text-status-resolved">👍 Satisfied</span>
                          ) : (
                            <span className="text-status-overdue">👎 Not Satisfied</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Responded on {grievance.userSatisfactionAt ? format(new Date(grievance.userSatisfactionAt), "MMM dd, yyyy") : ""}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <p className="text-sm font-medium">⏳ Awaiting user response</p>
                          <p className="text-sm text-muted-foreground">Original reporter has not yet responded</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => userSatisfactionMutation.mutate({ id: grievance.id, satisfaction: "satisfied" })}
                            disabled={userSatisfactionMutation.isPending}
                            data-testid={`button-satisfied-${grievance.id}`}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1.5" />
                            Satisfied
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => userSatisfactionMutation.mutate({ id: grievance.id, satisfaction: "not_satisfied" })}
                            disabled={userSatisfactionMutation.isPending}
                            data-testid={`button-not-satisfied-${grievance.id}`}
                          >
                            <ThumbsDown className="w-4 h-4 mr-1.5" />
                            Not Satisfied
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">👥 Community Verification</h4>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">📊 Verification Progress:</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            • <span className="text-status-resolved font-semibold">{grievance.communityVerifyCount}</span> community members agreed (✓ Verified)
                          </p>
                          <p className="text-sm">
                            • <span className="text-status-overdue font-semibold">{grievance.communityDisputeCount}</span> community members disputed (✗ Not Fixed)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            • Minimum threshold: 3-5 verifications needed
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            if (selectedGrievance === grievance.id) {
                              communityVoteMutation.mutate({ 
                                id: grievance.id, 
                                voteType: "verify",
                                comments: comments[grievance.id]
                              });
                            } else {
                              setSelectedGrievance(grievance.id);
                            }
                          }}
                          disabled={communityVoteMutation.isPending}
                          data-testid={`button-agree-${grievance.id}`}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1.5" />
                          Agree - Problem Fixed
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedGrievance(selectedGrievance === grievance.id ? null : grievance.id)}
                          data-testid={`button-dispute-${grievance.id}`}
                        >
                          <ThumbsDown className="w-4 h-4 mr-1.5" />
                          Dispute - Not Fixed
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-view-details-verification-${grievance.id}`}>
                          <Eye className="w-4 h-4 mr-1.5" />
                          View Details
                        </Button>
                      </div>

                      {selectedGrievance === grievance.id && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              If disputing, explain why the problem is not fixed:
                            </label>
                            <Textarea
                              value={comments[grievance.id] || ""}
                              onChange={(e) => setComments({ ...comments, [grievance.id]: e.target.value })}
                              placeholder="Provide detailed explanation and current evidence..."
                              className="min-h-24"
                              data-testid={`textarea-dispute-comments-${grievance.id}`}
                            />
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => communityVoteMutation.mutate({ 
                              id: grievance.id, 
                              voteType: "dispute",
                              comments: comments[grievance.id]
                            })}
                            disabled={communityVoteMutation.isPending}
                            data-testid={`button-submit-dispute-${grievance.id}`}
                          >
                            Submit Dispute
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">⚖️ Verification Logic:</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>• If USER agrees → ✅ Case closed immediately</p>
                        <p>• If USER inactive for 3-4 days → Community votes activate</p>
                        <p>• If USER or COMMUNITY disputes → 🚨 Escalate to Admin</p>
                        <p>• If NO response (user + community) for 15 days → ✅ Auto-closed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
