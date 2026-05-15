"use client";

import React, { useState } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { LoginForm } from "./LoginForm";
import { RegisterFormStep1 } from "./RegisterFormStep1";
import { RegisterFormStep2 } from "./RegisterFormStep2";
import { LoadingScreen } from "./LoadingScreen";
import { handleLoginUser, handleRegisterUser } from "@/lib/auth";

interface AuthFlowProps {
  onAuthSuccess: () => void;
  onGuestEnter: () => void;
}

export function AuthFlow({ onAuthSuccess, onGuestEnter }: AuthFlowProps) {
  const [stage, setStage] = useState<"welcome" | "login" | "reg1" | "reg2" | "loading">("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [regNombre, setRegNombre] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: loginError } = await handleLoginUser(email, password);
    
    if (loginError) {
      setError(loginError.message || "Error al iniciar sesión");
      setLoading(false);
    } else {
      setStage("loading");
      setTimeout(() => onAuthSuccess(), 1000);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!telefono || !regNombre) {
      setError("Completa todos los campos");
      setLoading(false);
      return;
    }

    const { error: regError } = await handleRegisterUser(email, password, regNombre, telefono);
    
    if (regError) {
      setError(regError.message || "Error al crear cuenta");
      setLoading(false);
    } else {
      setStage("loading");
      setTimeout(() => onAuthSuccess(), 1000);
    }
  };

  if (stage === "welcome") {
    return (
      <WelcomeScreen
        onRegister={() => setStage("reg1")}
        onLogin={() => setStage("login")}
        onGuest={onGuestEnter}
      />
    );
  }

  if (stage === "login") {
    return (
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        loading={loading}
        onSubmit={handleLogin}
        onBack={() => setStage("welcome")}
      />
    );
  }

  if (stage === "reg1") {
    return (
      <RegisterFormStep1
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        onSubmit={(e) => {
          e.preventDefault();
          setStage("reg2");
        }}
        onBack={() => setStage("welcome")}
      />
    );
  }

  if (stage === "reg2") {
    return (
      <RegisterFormStep2
        nombre={regNombre}
        setNombre={setRegNombre}
        telefono={telefono}
        setTelefono={setTelefono}
        error={error}
        loading={loading}
        onSubmit={handleRegister}
        onBack={() => setStage("reg1")}
      />
    );
  }

  if (stage === "loading") {
    return <LoadingScreen />;
  }

  return null;
}
