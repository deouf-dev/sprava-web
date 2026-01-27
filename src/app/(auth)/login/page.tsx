"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth/AuthContext";
import { apiFetch } from "@/lib/api/apiFetch";

type LoginResponse = {
  user_id: number;
  username: string;
  mail: string;
  api_token: string;
  avatar_id: string | null;
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/chat");
    }
  }, [isAuthenticated, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = (await apiFetch("/login", {
        method: "POST",
        body: { mail: email, password },
      })) as LoginResponse;

      if (!response.api_token) {
        throw new Error("Erreur de connexion, vérifier vos identifiants.");
      }

      login(response.api_token, response.user_id, response.username);
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <img src="/favicon.ico" alt="Sprava" className="h-7 w-7" />
        <div className="text-lg font-semibold tracking-tight">Sprava</div>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Accède à ta messagerie.</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="underline underline-offset-4"
              >
                Créer un compte
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
