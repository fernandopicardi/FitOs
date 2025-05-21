
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Zap, Dumbbell, Edit3, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';

const DASHBOARD_HERO_IMAGE_KEY = 'fitosDashboardHeroImage';
const DEFAULT_HERO_IMAGE_URL = "https://placehold.co/800x600.png";

export default function DashboardPage() {
  const [heroImageUrl, setHeroImageUrl] = useState<string>(DEFAULT_HERO_IMAGE_URL);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [isEditingImage, setIsEditingImage] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedUrl = localStorage.getItem(DASHBOARD_HERO_IMAGE_KEY);
    if (savedUrl) {
      setHeroImageUrl(savedUrl);
    }
  }, []);

  const handleEditImage = () => {
    setNewImageUrl(heroImageUrl);
    setIsEditingImage(true);
  };

  const handleSaveImage = () => {
    if (newImageUrl.trim() === '') {
      toast({
        title: "Invalid URL",
        description: "Image URL cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    setHeroImageUrl(newImageUrl);
    localStorage.setItem(DASHBOARD_HERO_IMAGE_KEY, newImageUrl);
    setIsEditingImage(false);
    toast({
      title: "Hero Image Updated!",
      description: "The new dashboard hero image has been saved.",
      duration: 3000,
    });
  };

  const handleCancelEdit = () => {
    setIsEditingImage(false);
    setNewImageUrl(''); // Reset the new image URL input
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
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
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
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
          <div className="md:w-1/2 relative min-h-[250px] md:min-h-full group">
            <Image 
              src={heroImageUrl} 
              alt="Modern fitness abstract background" 
              fill
              objectFit="cover"
              data-ai-hint="fitness abstract"
              className="opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              onError={() => { // Fallback if user provides a bad URL
                toast({ title: 'Image Load Error', description: 'Could not load the image. Reverting to default.', variant: 'destructive' });
                setHeroImageUrl(DEFAULT_HERO_IMAGE_URL);
                localStorage.removeItem(DASHBOARD_HERO_IMAGE_KEY);
              }}
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/30 to-transparent md:bg-gradient-to-r md:from-background/70 md:via-background/30 md:to-transparent"></div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-3 right-3 z-10 bg-background/50 hover:bg-background/80 text-foreground/70 hover:text-foreground backdrop-blur-sm"
              onClick={handleEditImage}
            >
              <Edit3 className="h-5 w-5" />
              <span className="sr-only">Edit Hero Image</span>
            </Button>
            {isEditingImage && (
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md p-4 m-3 rounded-lg shadow-xl space-y-3 z-20 border border-border">
                <Input 
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter new image URL (e.g., https://...)"
                  className="bg-background/70 border-border"
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground">
                    <X className="mr-1 h-4 w-4" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveImage} className="bg-primary hover:bg-primary/90">
                    <Check className="mr-1 h-4 w-4" /> Save
                  </Button>
                </div>
              </div>
            )}
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
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.03]">
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
