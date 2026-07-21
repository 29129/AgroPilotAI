"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRegister } from "@/hooks/use-auth";

const registerSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre completo."),
  email: z.string().email("Ingresa un correo válido."),
  password: z.string().min(6, "Usa al menos 6 caracteres."),
  role: z.enum(["PRODUCER", "TECHNICIAN"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerAccount = useRegister();
  const form = useForm<RegisterForm>({
    defaultValues: { role: "PRODUCER" },
    resolver: zodResolver(registerSchema),
  });
  const errorMessage =
    registerAccount.error instanceof Error ? registerAccount.error.message : null;

  async function onSubmit(values: RegisterForm) {
    await registerAccount.mutateAsync(values);
    router.push("/dashboard");
  }

  return (
    <div className="auth-form-card">
      <header>
        <p className="eyebrow">Crear cuenta</p>
        <h2>Empieza a organizar tu producción</h2>
        <p>Registra tu perfil para comenzar a gestionar fincas, parcelas y cultivos.</p>
      </header>

      <form className="auth-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <label>
          <span>Nombre completo</span>
          <input
            autoComplete="name"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <small role="alert">{form.formState.errors.name.message}</small>
          )}
        </label>
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
          <span>Tipo de perfil</span>
          <select {...form.register("role")}>
            <option value="PRODUCER">Productor/a</option>
            <option value="TECHNICIAN">Técnico/a</option>
          </select>
        </label>
        <label>
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <small role="alert">{form.formState.errors.password.message}</small>
          )}
        </label>

        {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}

        <button className="form-submit" type="submit" disabled={registerAccount.isPending}>
          {registerAccount.isPending ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes una cuenta? <Link href="/login">Iniciar sesión</Link>
      </p>
    </div>
  );
}
