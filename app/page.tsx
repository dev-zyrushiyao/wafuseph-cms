"use client";

import { useForm } from "react-hook-form";

import { useEffect, useState } from "react";
import PrimaryButton from "./component/PrimaryButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthUser, User } from "./service/authService";

type LoginFormData = {
  email: string;
  password: string;
};

//partial as optional fields
//data validation message return from SpringBoot LoginRequest.class(DTO Folder) GlobalExceptionHandler.class (Exception Folder)
type Validation = Partial<Record<keyof LoginFormData, string>>;

export default function Home() {
  const [loginResult, setLoginResult] = useState<string>("");
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAuthUser() {
      const authUser = await getAuthUser();

      if (authUser) {
        router.replace("/dashboard");
        return;
      }

      setIsChecking(false);
    }

    fetchAuthUser();
  }, [router]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (payload: LoginFormData) => {
    const res = await fetch("http://localhost:8080/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      const { message } = await res.json();
      setLoginResult(message);
      return;
    }

    if (!res.ok) {
      const body = (await res.json()) as Validation;
      Object.entries(body).forEach(([field, message]) => {
        setError(field as keyof LoginFormData, {
          type: "server",
          message,
        });
      });
      return;
    }

    //store the credentials in localStorage
    const data = (await res.json()) as User;
    localStorage.setItem("auth", JSON.stringify(data));
    router.push("/dashboard");
  };

  useEffect(() => {
    //when login success
    const raw = localStorage.getItem("auth");
    if (!raw) return;

    const user = JSON.parse(raw) as { token?: string };
    if (user.token) {
      router.replace("/dashboard");
    }
  }, [router]);

  if (isChecking) {
    return;
  }

  return (
    <div className="h-dvh w-full flex flex-col justify-center items-center gap-10">
      <h1>Wafuseph CMS</h1>
      <main className="w-100">
        <form
          id="registration-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          {loginResult && (
            <h3 className="text-2xl text-red-500 font-bold font-sans">
              {loginResult}
            </h3>
          )}

          <div className="flex flex-col">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="border"
            />
            {errors.email && (
              <p className="text-red-500 font-semibold">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="border"
            />
            {errors.password && (
              <p className="text-red-500 font-semibold">
                {errors.password.message}
              </p>
            )}
          </div>

          <Link href="/register">
            <span className="text-sm underline text-blue-500">
              Register account
            </span>
          </Link>

          <PrimaryButton buttonType="submit" label="Login" />
        </form>
      </main>
    </div>
  );
}
