import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Shield, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  Lock,
  Phone,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-base px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Secured by Blockchain
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Village Grievance Redressal System
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto">
              Transparent, blockchain-integrated platform empowering rural communities through 
              accountable grievance resolution and community verification
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/submit">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6" data-testid="button-submit-grievance-home">
                  <FileText className="w-5 h-5 mr-2" />
                  Submit Grievance
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm" data-testid="button-track-status-home">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Track Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our System?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built to serve rural India with transparency, accessibility, and community empowerment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Blockchain Transparency</CardTitle>
                <CardDescription className="text-base">
                  Immutable records prevent tampering of grievance status. Smart contracts enable 
                  automatic escalation when resolution time exceeds limits.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-status-resolved/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-status-resolved" />
                </div>
                <CardTitle>Community Verification</CardTitle>
                <CardDescription className="text-base">
                  Community members validate resolution status with photo/video evidence capability 
                  to prove unresolved issues.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Multi-Channel Access</CardTitle>
                <CardDescription className="text-base">
                  Submit grievances via web, voice recording, SMS, or WhatsApp. Voice will be 
                  auto-transcribed for accessibility.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Simple 4-step process to get your grievance resolved</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Submit Grievance",
                description: "Fill out the simple form with problem details, category, and evidence",
                icon: FileText,
              },
              {
                step: 2,
                title: "Official Assignment",
                description: "Grievance is auto-assigned to relevant Panchayat officer with timeline",
                icon: Users,
              },
              {
                step: 3,
                title: "Resolution Process",
                description: "Officer works on resolution. System auto-escalates if overdue",
                icon: AlertCircle,
              },
              {
                step: 4,
                title: "Community Verification",
                description: "Community verifies resolution. Blockchain records entire process",
                icon: CheckCircle,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                </div>
                <item.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Preventing False Closures Through Community Power
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Traditional systems allow officials to close complaints without verification, resulting in 
                only 6.3% resolution rate. Our community-verified blockchain approach ensures accountability.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-status-resolved flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">Community Validation</div>
                    <div className="text-muted-foreground">Local residents verify actual resolution</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-status-resolved flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">Photo Evidence</div>
                    <div className="text-muted-foreground">Before/after photos prove work completion</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-status-resolved flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">Auto Escalation</div>
                    <div className="text-muted-foreground">Smart contracts escalate overdue grievances</div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-status-overdue mb-2">6.3%</div>
                  <div className="text-sm text-muted-foreground">Traditional System Success Rate</div>
                </CardContent>
              </Card>
              <Card className="border-2 bg-status-resolved text-white">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold mb-2">85%+</div>
                  <div className="text-sm opacity-90">Our Target Resolution Rate</div>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Transparency & Traceability</div>
                </CardContent>
              </Card>
              <Card className="border-2 bg-secondary text-secondary-foreground">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <div className="text-sm opacity-90">Multi-Channel Access</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <Lock className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your Voice Matters. Your Community Validates.
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of villages using blockchain-powered transparency to hold officials accountable 
            and get real results.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/submit">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6" data-testid="button-get-started">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm" data-testid="button-call-helpline">
              <Phone className="w-5 h-5 mr-2" />
              Call Helpline: 1800-XXX-XXXX
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">© 2025 Village Grievance Redressal System | Government of India</p>
            <p>Powered by Blockchain Technology | Serving Rural Communities with Transparency</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
