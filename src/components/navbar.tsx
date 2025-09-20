"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";

export const Navbar = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background border-b">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href={"/"}>
            <span className="text-xl text-foreground font-semibold tracking-wide">
              openbrain
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/tasks"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Tasks
          </Link>
          <Link
            href="/classroom"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Classroom
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Link 3
          </Link>
        </nav>

        <div>
          <Authenticated>
            <UserButton />
          </Authenticated>
          <Unauthenticated>
            <Link href={"/sign-in"}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6">
                Sign In
              </Button>
            </Link>
          </Unauthenticated>
        </div>
      </div>
    </header>
  );
};
