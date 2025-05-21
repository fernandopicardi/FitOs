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
                <h1 className="text-4xl font-bold">Bem-vindo ao FitOS!</h1>
              </div>
              <CardDescription className="text-lg text-foreground/80">
                Pronto para conquistar seu dia? Seu treino personalizado te espera.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <p className="mb-6 text-foreground/70">
                FitOS está aqui para te guiar em sua jornada fitness com diversão, humor e treinos incríveis. Vamos nessa!
              </p>
              <div className="flex space-x-4">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md" asChild>
                  <Link href="/log">
                    <Zap className="mr-2 h-5 w-5" /> Iniciar Treino de Hoje
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/plans">
                    <Dumbbell className="mr-2 h-5 w-5" /> Ver Planos
                  </Link>
                </Button>
              </div>
            </CardContent>
          </div>
          <div className="md:w-1/2 relative min-h-[250px] md:min-h-full">
            <Image 
              src="https://placehold.co/800x600.png" 
              alt="Modern fitness abstract background" 
              fill
              objectFit="cover"
              data-ai-hint="fitness abstract"
              className="opacity-80"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/30 to-transparent md:bg-gradient-to-r md:from-background/70 md:via-background/30 md:to-transparent"></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Explorar Exercícios"
          description="Navegue em nossa extensa biblioteca ou adicione seus próprios movimentos personalizados."
          icon={<Dumbbell className="h-8 w-8 text-primary" />}
          link="/exercises"
          linkText="Ir para Biblioteca"
        />
        <FeatureCard
          title="Planeje Sua Vitória"
          description="Crie e gerencie seus cronogramas de treino semanais com facilidade."
          icon={<Sparkles className="h-8 w-8 text-primary" />}
          link="/plans"
          linkText="Gerenciar Planos"
        />
        <FeatureCard
          title="Acompanhe Seu Progresso"
          description="Registre seus treinos e veja o quão longe você chegou."
          icon={<Zap className="h-8 w-8 text-primary" />}
          link="/history"
          linkText="Ver Histórico"
        />
      </div>
       <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Dica Fitness do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg italic text-foreground/80">
            &quot;Por que o espantalho ganhou um prêmio? Porque ele era excepcional em seu campo! ...Assim como você será após este treino!&quot; 😂
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
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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
