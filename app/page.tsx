"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { Gender } from "./constants/gender";
import { useState } from "react";

type RegistrationFormData = {
  email: string;
  password: string;
  name: string;
  gender: Gender;
};

//partial as optional fields
type Validation = Partial<Record<keyof RegistrationFormData, string>>;
type RegistrationStatus = { registrationStatus: string };

export default function Home() {
  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitSuccessful },
  } = useForm<RegistrationFormData>();

  return (
    <div className="h-dvh w-full flex flex-col justify-center items-center">
      <form
        id="registration-form"
        onSubmit={handleSubmit(async (payload) => {
          const res = await fetch("http://localhost:8080/api/users/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (res.status === 409) {
            const body = (await res.json()) as RegistrationStatus;
            setError("email", {
              type: "server",
              message: body.registrationStatus ?? "Account already exist",
            });
            return;
          }

          if (!res.ok) {
            const body = (await res.json()) as Validation;
            Object.entries(body).forEach(([field, message]) => {
              setError(field as keyof RegistrationFormData, {
                type: "server",
                message,
              });
            });
            return;
          }

          const body = (await res.json()) as RegistrationStatus;
          const form =
            document.querySelector<HTMLFormElement>("#registration-form");
          if (!form) return;
          form.reset();
          setSuccessMessage(
            body.registrationStatus || "Account Registration Successful",
          );
        })}
        className="flex flex-col gap-3"
      >
        {isSubmitSuccessful && (
          <h3 className="text-2xl text-green-500 font-bold">
            {successMessage}
          </h3>
        )}
        <div className="flex flex-col">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            {...register("email", { required: true })}
            className="border"
          />
          {errors.email && (
            <p className="text-red-500 font-semibold">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            {...register("password", { required: true })}
            className="border"
          />
          {errors.password && (
            <p className="text-red-500 font-semibold">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            {...register("name", { required: true })}
            className="border"
          />
          {errors.name && (
            <p className="text-red-500 font-semibold">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="Gender">Gender:</label>
          <select
            id="gender"
            {...register("gender", { required: true })}
            className="border"
          >
            {Object.values(Gender).map((gender) => {
              return (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              );
            })}
          </select>
          {errors.gender && (
            <p className="text-red-500 font-semibold">
              {errors.gender.message}
            </p>
          )}
        </div>

        <input type="submit" className="border p-3" />
      </form>
    </div>
  );
}
