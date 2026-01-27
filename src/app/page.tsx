"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center bg-muted/40 p-4">
      {/* Logo Sprava */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <img src="/favicon.ico" alt="Sprava" className="h-7 w-7" />
        <div className="text-lg font-semibold tracking-tight">Sprava</div>
      </div>

      {/* Card centrale */}
      <Card className="w-full max-w-sm">
        <CardContent className="py-10 flex flex-col items-center text-center gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Bienvenue sur Sprava
            </h1>
            <p className="text-sm text-muted-foreground">
              Une messagerie simple, rapide et moderne.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button className="w-full" onClick={() => router.push("/login")}>
              Se connecter
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/signup")}
            >
              Créer un compte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
