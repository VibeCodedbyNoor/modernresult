import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Upload, Globe, Shield, Zap, BarChart3, ArrowRight } from 'lucide-react';

const features = [
  { icon: Upload, title: 'Easy Upload', desc: 'Import results via CSV or Google Sheets in seconds' },
  { icon: Globe, title: 'Branded Portal', desc: 'Your school gets its own unique URL and branding' },
  { icon: Shield, title: 'Secure & Private', desc: 'Student data is encrypted and access-controlled' },
  { icon: Zap, title: 'Instant Setup', desc: 'Go live in under 5 minutes — no coding required' },
  { icon: BarChart3, title: 'Multiple Exams', desc: 'Manage mid-terms, finals, and custom sessions' },
  { icon: CheckCircle, title: 'Student Friendly', desc: 'Students check results by roll number or name' },
];

const plans = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    features: ['Up to 200 students', '1 exam session', 'CSV upload', 'Basic branding', 'Email support'],
    popular: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    features: ['Up to 2,000 students', 'Unlimited exams', 'CSV + Google Sheets', 'Full branding', 'Priority support', 'Result analytics'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$79',
    period: '/month',
    features: ['Unlimited students', 'Unlimited exams', 'All upload methods', 'Custom domain support', 'Dedicated support', 'API access'],
    popular: false,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold text-primary">
            ResultCheck
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
            Trusted by 500+ institutions
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Launch your school's
            <span className="text-primary"> online result portal</span>
            {' '}in minutes
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload student results, share a branded link, and let students check their results instantly. No coding needed.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link to="/signup">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/results/demo-academy">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Everything you need</h2>
          <p className="text-muted-foreground mt-3 text-lg">Simple tools to digitize your result management</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <Card key={i} className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20" id="pricing">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Simple, transparent pricing</h2>
          <p className="text-muted-foreground mt-3 text-lg">Start free, upgrade as you grow</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={`relative border-2 ${plan.popular ? 'border-primary shadow-lg' : 'border-border'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ResultCheck. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
