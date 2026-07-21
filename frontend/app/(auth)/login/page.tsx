"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLogin } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const form = useForm<LoginForm>({
    defaultValues: {
      email: "ana@agropilot.ec",
      password: "demo1234",
    },
    resolver: zodResolver(loginSchema),
  });

  const errorMessage = login.error instanceof Error ? login.error.message : null;

  async function onSubmit(values: LoginForm) {
    await login.mutateAsync(values);
    router.push("/dashboard");
  }

  return (
    <div className="auth-form-card">
      <header>
        <p className="eyebrow">Bienvenida</p>
        <h2>Ingresa a tu espacio agrícola</h2>
        <p>Consulta el estado de tus cultivos y decide con información contextual.</p>
      </header>

      <form className="auth-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <label>
          <span>Correo electrónico</span>
          <input
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <small role="alert">{form.formState.errors.email.message}</small>
          )}
        </label>
        <label>
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <small role="alert">{form.formState.errors.password.message}</small>
          )}
        </label>

        {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}

        <button className="form-submit" type="submit" disabled={login.isPending}>
          {login.isPending ? "Ingresando…" : "Ingresar al panel"}
        </button>
      </form>

      <p className="auth-demo-note">
        Modo demostración: usa los datos sugeridos o cualquier contraseña no vacía.
      </p>
      <p className="auth-switch">
        ¿Aún no tienes una cuenta? <Link href="/register">Crear cuenta</Link>
      </p>
    </div>
  );
}
