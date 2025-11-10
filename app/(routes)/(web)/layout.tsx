import { getServerSession } from "@/lib/auth";
import { Routes } from "@/lib/routes";
import { redirect } from "next/navigation";

export default async function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (session) {
    return redirect(Routes.home);
  }

  return <div>{children}</div>;
}
