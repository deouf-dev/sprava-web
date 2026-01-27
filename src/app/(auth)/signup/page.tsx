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

type SignupResponse = {
  status_code: number;
  user_id: number;
  username: string;
  mail: string;
  api_token: string;
};

export default function SignupPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/chat");
    }
  }, [isAuthenticated, router]);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = (await apiFetch("/signup", {
        method: "POST",
        body: { mail: email, username, password, date_of_birth: dateOfBirth },
      })) as SignupResponse;

      const api_token = response.api_token;
      const user_id = response.user_id;
      const usernameResp = response.username;

      if (!api_token) throw new Error("No API token received");

      login(api_token, user_id, usernameResp);
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
          <CardTitle>Inscription</CardTitle>
          <CardDescription>
            Crée ton compte pour accéder à la messagerie.
          </CardDescription>
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
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
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
                autoComplete="new-password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date de naissance</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Inscription..." : "S'inscrire"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="underline underline-offset-4"
              >
                Se connecter
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
