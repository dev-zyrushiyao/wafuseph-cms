import React from "react";

type ButtonType = "submit" | "button";

type PrimaryButtonProp = {
  buttonType: ButtonType;
  label?: string;
  onClick?: () => void;
};

export default function PrimaryButton({
  buttonType,
  label = "button1",
  onClick,
}: PrimaryButtonProp) {
  return buttonType === "submit" ? (
    <input
      type={buttonType}
      value={label}
      className="border p-3 bg-amber-300 text-black cursor-pointer"
    />
  ) : (
    <button
      type={buttonType}
      className="border p-3 bg-amber-300 text-black cursor-pointer"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
