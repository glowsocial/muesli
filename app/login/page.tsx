import { connection } from "next/server";
import { isGoogleEnabled } from "@/lib/config";
import LoginForm from "./login-form";

export default async function LoginPage() {
  // Wait for a real request so the Google check reads the live env, not a build-time snapshot.
  await connection();
  return <LoginForm googleEnabled={isGoogleEnabled()} />;
}
