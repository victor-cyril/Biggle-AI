"use client";
import {
  RiScanLine,
  RiChatAiLine,
  RiBankCard2Line,
  RiSettings3Line,
} from "react-icons/ri";
import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "../ui/sidebar";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Logo from "@/components/common/logo";
import { Routes } from "@/lib/routes";
import NavUser from "./nav-user";
import NavMenu from "./nav-menu";
import NavNotes from "./nav-notes";

const navMenu = [
  {
    title: "Home",
    url: Routes.home,
    icon: RiScanLine,
  },
  {
    title: "AI Chat",
    url: Routes.chat.base,
    icon: RiChatAiLine,
  },
  {
    title: "Billing",
    url: Routes.billing.base,
    icon: RiBankCard2Line,
  },
  {
    title: "Settings",
    url: Routes.settings.base,
    icon: RiSettings3Line,
  },
];

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const { useSession, signOut } = authClient;
  const { data: session, isPending } = useSession();

  const user = session?.user;

  const handleLogout = () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(Routes.auth.signIn);
          setIsSigningOut(false);
        },
        onError: (ctx: any) => {
          setIsSigningOut(false);
          toast.error(ctx.error.message);
        },
      },
    });
  };

  const isLoading = isPending || isSigningOut;

  return (
    <Sidebar {...props} className="z-99">
      <SidebarHeader>
        <div className="w-full flex items-center p-2 justify-between">
          <Logo url={Routes.home} />
          <SidebarTrigger className="-ms-4" />
        </div>
        <hr className="border-border mx-2 -mt-px" />
        {/* {Search Button} */}
      </SidebarHeader>
      <SidebarContent className="px-2 pt-2 overflow-x-hidden">
        <NavMenu items={navMenu} />
        <NavNotes />
      </SidebarContent>
      <SidebarFooter>
        <hr className="border-border mx-2 -mt-px" />
        <NavUser
          user={{
            name: user?.name || "",
            email: user?.email || "",
          }}
          isSigningOut={isLoading}
          onSignOut={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
