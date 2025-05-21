import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Dumbbell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Sparkles className="h-8 w-8" />
                <h1 className="text-4xl font-bold">Welcome, Fitness Pro!</h1>
              </div>
              <CardDescription className="text-lg text-foreground/80">
                Ready to conquer your day? Your personalized workout awaits.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <p className="mb-6 text-foreground/70">
                Workout Wizard is here to guide you through your fitness journey with fun, humor, and killer workouts. Let&apos;s get those gains!
              </p>
              <div className="flex space-x-4">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md" asChild>
                  <Link href="/log">
                    <Zap className="mr-2 h-5 w-5" /> Start Today&apos;s Workout
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/plans">
                    <Dumbbell className="mr-2 h-5 w-5" /> View Plans
                  </Link>
                </Button>
              </div>
            </CardContent>
          </div>
          <div className="md:w-1/2 relative min-h-[250px] md:min-h-full">
            <Image 
              src="https://placehold.co/800x600" 
              alt="Workout motivation" 
              fill // Changed layout to fill
              objectFit="cover"
              data-ai-hint="fitness workout"
              className="opacity-80" // Added slight opacity to blend with dark mode if needed
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent md:bg-gradient-to-r md:from-background/70 md:to-transparent"></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Explore Exercises"
          description="Browse our extensive library or add your own custom moves."
          icon={<Dumbbell className="h-8 w-8 text-primary" />}
          link="/exercises"
          linkText="Go to Library"
        />
        <FeatureCard
          title="Plan Your Victory"
          description="Create and manage your weekly workout schedules with ease."
          icon={<Sparkles className="h-8 w-8 text-primary" />}
          link="/plans"
          linkText="Manage Plans"
        />
        <FeatureCard
          title="Track Your Progress"
          description="Log your workouts and see how far you've come."
          icon={<Zap className="h-8 w-8 text-primary" />}
          link="/history"
          linkText="View History"
        />
      </div>
       <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Humorous Tip of the Day</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg italic text-foreground/80">
            &quot;Why did the scarecrow win an award? Because he was outstanding in his field! ...Just like you&apos;ll be after this workout!&quot; 😂
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
}

function FeatureCard({ title, description, icon, link, linkText }: FeatureCardProps) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        {icon}
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button variant="link" className="p-0 text-primary hover:text-primary/80" asChild>
          <Link href={link}>{linkText} &rarr;</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
