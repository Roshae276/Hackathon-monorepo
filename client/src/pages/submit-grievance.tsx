import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { FileText, Camera, Mic, MapPin, User, Phone, Mail, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertGrievanceSchema } from "@shared/schema";

const categories = [
  "Water Supply",
  "Road & Infrastructure",
  "Electricity",
  "Sanitation & Waste Management",
  "Healthcare",
  "Education",
  "Agriculture Support",
  "Social Welfare Schemes",
  "Other"
];

const formSchema = insertGrievanceSchema.extend({
  fullName: z.string().min(3, "Full name is required"),
  mobileNumber: z.string().regex(/^\+91\d{10}$/, "Mobile number must be in format +91XXXXXXXXXX"),
  email: z.string().email().optional().or(z.literal("")),
});

export default function SubmitGrievance() {
  const [step, setStep] = useState(1);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "Water Supply",
      description: "",
      villageName: "",
      fullName: "",
      mobileNumber: "+91",
      email: "",
      priority: "medium",
      evidenceFiles: [],
      voiceRecordingUrl: null,
      voiceTranscription: null,
      resolutionTimeline: null,
      dueDate: null,
      resolutionNotes: null,
      resolutionEvidence: [],
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("POST", "/api/grievances", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grievances"] });
      toast({
        title: "Grievance Submitted Successfully",
        description: "Your grievance has been registered and will be reviewed shortly.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit grievance. Please try again.",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    submitMutation.mutate(data);
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    
    if (step === 1) {
      fieldsToValidate = ["title", "category"];
    } else if (step === 2) {
      fieldsToValidate = [];
    } else if (step === 3) {
      fieldsToValidate = ["description"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Submit New Grievance</h1>
        <p className="text-lg text-muted-foreground">Help us serve you better by providing detailed information</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Step {step} of 4</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" data-testid="progress-submission" />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { num: 1, label: "Problem Details" },
          { num: 2, label: "Evidence" },
          { num: 3, label: "Description" },
          { num: 4, label: "Contact Info" }
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
              step === s.num
                ? "bg-primary text-primary-foreground border-primary"
                : step > s.num
                ? "bg-status-resolved text-white border-status-resolved"
                : "bg-card text-muted-foreground border-border"
            }`}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background/20">
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Problem Identification
                </CardTitle>
                <CardDescription>Provide basic information about your grievance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Problem Title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter brief problem description"
                          className="text-base min-h-12"
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormDescription>
                        Summarize your problem in one line
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-base min-h-12" data-testid="select-category">
                            <SelectValue placeholder="Select Problem Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Upload Evidence
                </CardTitle>
                <CardDescription>Add photos or videos to support your grievance (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover-elevate cursor-pointer transition-colors">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-base font-medium mb-2">Drag & Drop or Click to Upload</p>
                  <p className="text-sm text-muted-foreground">
                    Supported: JPG, PNG, MP4 (Max 10MB)
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    data-testid="input-evidence-files"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Note: Evidence helps officials better understand and resolve your issue
                </p>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Detailed Description
                </CardTitle>
                <CardDescription>Describe your problem in detail</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Problem Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe your problem in detail... (Minimum 50 characters)"
                          className="min-h-40 text-base resize-none"
                          maxLength={500}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormDescription>
                          Provide as much detail as possible
                        </FormDescription>
                        <span className="text-sm text-muted-foreground">
                          {field.value?.length || 0}/500
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border rounded-lg p-6 bg-muted/30">
                  <Label className="text-base mb-4 block">Voice Recording (Alternative Input)</Label>
                  <div className="flex gap-3 items-center justify-center">
                    <Button
                      type="button"
                      variant={isRecording ? "destructive" : "secondary"}
                      size="lg"
                      onClick={() => setIsRecording(!isRecording)}
                      data-testid="button-voice-record"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      {isRecording ? "Stop Recording" : "Start Recording"}
                    </Button>
                    {recordingTime > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')} / 3:00
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Voice will be auto-transcribed
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location & Contact Information
                </CardTitle>
                <CardDescription>Help us reach you with updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="villageName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Village Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your village name"
                          className="text-base min-h-12"
                          data-testid="input-village-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Your Name *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Full name as per Aadhaar"
                            className="text-base min-h-12 pl-10"
                            data-testid="input-full-name"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Mobile Number *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="+91XXXXXXXXXX"
                            className="text-base min-h-12 pl-10"
                            data-testid="input-mobile-number"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        You'll receive SMS updates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Email Address (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="your.email@example.com"
                            className="text-base min-h-12 pl-10"
                            data-testid="input-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 h-5 w-5 rounded border-border"
                      data-testid="checkbox-confirm-accuracy"
                    />
                    <span className="text-sm text-foreground">
                      I confirm that the information provided is accurate and truthful to the best of my knowledge
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={prevStep}
              disabled={step === 1}
              data-testid="button-previous-step"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {step < 4 ? (
              <Button
                type="button"
                size="lg"
                onClick={nextStep}
                data-testid="button-next-step"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={submitMutation.isPending}
                data-testid="button-submit-grievance"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Grievance"}
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {step === 4 && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => form.reset()}
              data-testid="button-reset-form"
            >
              Reset Form
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
