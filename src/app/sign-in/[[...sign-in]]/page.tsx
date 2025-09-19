// "use client";

// import { LoginForm } from "@/components/login-form";

// export default function Page() {
//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="w-full max-w-md px-4">
//         <LoginForm />
//       </div>
//     </div>
//   );
// }

"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="grid w-full grow items-center px-4 sm:justify-center">
          <SignUp.Root>
            <Clerk.Loading>
              {(isGlobalLoading) => (
                <>
                  <SignUp.Step name="start">
                    <Card className="w-full sm:w-96">
                      <CardHeader>
                        <CardTitle>Create your account</CardTitle>
                        <CardDescription>
                          Welcome! Please fill in the details to get started.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-y-4">
                        <div className="grid grid-cols-2 gap-x-4">
                          <Clerk.Connection name="microsoft" asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              disabled={isGlobalLoading}
                            >
                              <Clerk.Loading scope="provider:microsoft">
                                {(isLoading) =>
                                  isLoading ? (
                                    <Icons.spinner className="size-4 animate-spin" />
                                  ) : (
                                    <>
                                      <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          fill="#f25022"
                                          d="M1 1h10v10H1z"
                                        />
                                        <path
                                          fill="#00a4ef"
                                          d="M13 1h10v10H13z"
                                        />
                                        <path
                                          fill="#7fba00"
                                          d="M1 13h10v10H1z"
                                        />
                                        <path
                                          fill="#ffb900"
                                          d="M13 13h10v10H13z"
                                        />
                                      </svg>
                                      Microsoft
                                    </>
                                  )
                                }
                              </Clerk.Loading>
                            </Button>
                          </Clerk.Connection>
                          <Clerk.Connection name="google" asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              disabled={isGlobalLoading}
                            >
                              <Clerk.Loading scope="provider:google">
                                {(isLoading) =>
                                  isLoading ? (
                                    <Icons.spinner className="size-4 animate-spin" />
                                  ) : (
                                    <>
                                      <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                          fill="#4285F4"
                                        />
                                        <path
                                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                          fill="#34A853"
                                        />
                                        <path
                                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                          fill="#FBBC05"
                                        />
                                        <path
                                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                          fill="#EA4335"
                                        />
                                      </svg>{" "}
                                      Google
                                    </>
                                  )
                                }
                              </Clerk.Loading>
                            </Button>
                          </Clerk.Connection>
                        </div>
                        <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                          or
                        </p>
                        <Clerk.Field name="emailAddress" className="space-y-2">
                          <Clerk.Label asChild>
                            <Label>Email address</Label>
                          </Clerk.Label>
                          <Clerk.Input type="email" required asChild>
                            <Input />
                          </Clerk.Input>
                          <Clerk.FieldError className="block text-sm text-destructive" />
                        </Clerk.Field>
                        <Clerk.Field name="password" className="space-y-2">
                          <Clerk.Label asChild>
                            <Label>Password</Label>
                          </Clerk.Label>
                          <Clerk.Input type="password" required asChild>
                            <Input />
                          </Clerk.Input>
                          <Clerk.FieldError className="block text-sm text-destructive" />
                        </Clerk.Field>
                      </CardContent>
                      <CardFooter>
                        <div className="grid w-full gap-y-4">
                          <SignUp.Captcha className="empty:hidden" />
                          <SignUp.Action submit asChild>
                            <Button disabled={isGlobalLoading}>
                              <Clerk.Loading>
                                {(isLoading) => {
                                  return isLoading ? (
                                    <Icons.spinner className="size-4 animate-spin" />
                                  ) : (
                                    "Continue"
                                  );
                                }}
                              </Clerk.Loading>
                            </Button>
                          </SignUp.Action>
                          <Button variant="link" size="sm" asChild>
                            <Clerk.Link navigate="sign-in">
                              Already have an account? Sign in
                            </Clerk.Link>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </SignUp.Step>

                  <SignUp.Step name="continue">
                    <Card className="w-full sm:w-96">
                      <CardHeader>
                        <CardTitle>Continue registration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Clerk.Field name="username" className="space-y-2">
                          <Clerk.Label>
                            <Label>Username</Label>
                          </Clerk.Label>
                          <Clerk.Input type="text" required asChild>
                            <Input />
                          </Clerk.Input>
                          <Clerk.FieldError className="block text-sm text-destructive" />
                        </Clerk.Field>
                      </CardContent>
                      <CardFooter>
                        <div className="grid w-full gap-y-4">
                          <SignUp.Action submit asChild>
                            <Button disabled={isGlobalLoading}>
                              <Clerk.Loading>
                                {(isLoading) => {
                                  return isLoading ? (
                                    <Icons.spinner className="size-4 animate-spin" />
                                  ) : (
                                    "Continue"
                                  );
                                }}
                              </Clerk.Loading>
                            </Button>
                          </SignUp.Action>
                        </div>
                      </CardFooter>
                    </Card>
                  </SignUp.Step>

                  <SignUp.Step name="verifications">
                    <SignUp.Strategy name="email_code">
                      <Card className="w-full sm:w-96">
                        <CardHeader>
                          <CardTitle>Verify your email</CardTitle>
                          <CardDescription>
                            Use the verification link sent to your email address
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-y-4">
                          <div className="grid items-center justify-center gap-y-2">
                            <Clerk.Field name="code" className="space-y-2">
                              <Clerk.Label className="sr-only">
                                Email address
                              </Clerk.Label>
                              <div className="flex justify-center text-center">
                                <Clerk.Input
                                  type="otp"
                                  className="flex justify-center has-[:disabled]:opacity-50"
                                  autoSubmit
                                  render={({ value, status }) => {
                                    return (
                                      <div
                                        data-status={status}
                                        className={cn(
                                          "relative flex size-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
                                          {
                                            "z-10 ring-2 ring-ring ring-offset-background":
                                              status === "cursor" ||
                                              status === "selected",
                                          }
                                        )}
                                      >
                                        {value}
                                        {status === "cursor" && (
                                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }}
                                />
                              </div>
                              <Clerk.FieldError className="block text-center text-sm text-destructive" />
                            </Clerk.Field>
                            <SignUp.Action
                              asChild
                              resend
                              className="text-muted-foreground"
                              fallback={({ resendableAfter }) => (
                                <Button variant="link" size="sm" disabled>
                                  Didn&apos;t receive a code? Resend (
                                  <span className="tabular-nums">
                                    {resendableAfter}
                                  </span>
                                  )
                                </Button>
                              )}
                            >
                              <Button type="button" variant="link" size="sm">
                                Didn&apos;t receive a code? Resend
                              </Button>
                            </SignUp.Action>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="grid w-full gap-y-4">
                            <SignUp.Action submit asChild>
                              <Button disabled={isGlobalLoading}>
                                <Clerk.Loading>
                                  {(isLoading) => {
                                    return isLoading ? (
                                      <Icons.spinner className="size-4 animate-spin" />
                                    ) : (
                                      "Continue"
                                    );
                                  }}
                                </Clerk.Loading>
                              </Button>
                            </SignUp.Action>
                          </div>
                        </CardFooter>
                      </Card>
                    </SignUp.Strategy>
                  </SignUp.Step>
                </>
              )}
            </Clerk.Loading>
          </SignUp.Root>
        </div>
      </div>
    </div>
  );
}
