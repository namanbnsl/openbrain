"use client";

import { useUser } from "@clerk/nextjs";

export default function Badge() {
    const { user } = useUser();
  
    return <span>Logged in as {user?.fullName ?? "Unknown user"}</span>;
  }