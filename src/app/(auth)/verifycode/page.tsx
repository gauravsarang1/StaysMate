"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [code, setCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter otp" />
      <button type="submit">Login</button>
    </form>
  );
}
