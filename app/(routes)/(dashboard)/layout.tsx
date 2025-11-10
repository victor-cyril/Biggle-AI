import AppSidebar from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import MainContent from "./_components/main-content";
import { Routes } from "@/lib/routes";
import { getServerSession } from "@/lib/auth";
import NoteDialog from "@/components/note-dialog/note-dialog";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    return redirect(Routes.auth.signIn);
  }

  return (
    <NuqsAdapter>
      <SidebarProvider>
        {/* {App Sidebar} */}
        <AppSidebar />
        <SidebarInset className="relative overflow-x-hidden pt-0">
          <MainContent>{children}</MainContent>
          <NoteDialog />
        </SidebarInset>
      </SidebarProvider>
    </NuqsAdapter>
  );
}
