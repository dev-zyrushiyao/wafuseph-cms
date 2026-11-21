"use client";

import { useForm } from "react-hook-form";
import { Gender } from "../constants/gender";
import { useState } from "react";
import { BsArrowLeftSquareFill } from "react-icons/bs";
import Link from "next/link";
import PrimaryButton from "../component/PrimaryButton";

type RegistrationFormData = {
  email: string;
  password: string;
  name: string;
  gender: Gender;
};

//partial as optional fields
//data validation message return from SpringBoot RegistrationRequest.class(DTO Folder) GlobalExceptionHandler.class (Exception Folder)
type Validation = Partial<Record<keyof RegistrationFormData, string>>;
//message is from the UserAccountController: /api/users/register
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
    <div className="h-dvh w-full flex flex-col justify-center items-center gap-10 bg-yellow-100 relative">
      <Link href="/" className="cursor-pointer">
        <div className="flex flex-row items-center gap-3 absolute top-10 left-20">
          <BsArrowLeftSquareFill size={48} />
          <span className="text-2xl">Back to login</span>
        </div>
      </Link>

      <div>
        <h1 className="">Wafuseph CMS Registration</h1>
      </div>
      <main className="w-100">
        <form
          id="registration-form"
          onSubmit={handleSubmit(async (payload) => {
            const res = await fetch(
              "http://localhost:8080/api/users/register",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              },
            );

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

          <div className="flex flex-col">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="border"
            />
            {errors.name && (
              <p className="text-red-500 font-semibold">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="Gender">Gender:</label>
            <select id="gender" {...register("gender")} className="border">
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

          <PrimaryButton
            label="submit"
            buttonType="submit"
            onClick={() => {}}
          />
        </form>
      </main>
    </div>
  );
}
