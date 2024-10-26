"use client";

import { useEffect, useState } from "react";
import AccountDropdown from "~/app/components/header/AccountDropdown";
import { Explorer, SheetExplorer } from "~/app/components/sidebar/Explorer";
import { ModeToggle } from "~/app/components/header/ModeToggle";
import PaperTabs from "~/app/components/papers/PaperTabs";
import PaperSearch from "./components/header/PaperSearch";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import Title from "./components/sidebar/Title";
import WelcomePopup from "~/app/components/WelcomePopup";
import {
  LibraryProvider,
  type LibraryProps,
} from "./components/providers/LibraryProvider";
import { initUser, fetchUserData } from "~/server/actions";

export default function Page() {
  const [userData, setUserData] = useState<LibraryProps | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      let userId = localStorage.getItem("userId");

      // create user if no id is found
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem("userId", userId);
        await initUser(userId);
      }

      const data = await fetchUserData(userId);
      setUserData(data);
    };

    initializeUser().catch(console.error);
  }, []);

  if (!userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <LibraryProvider {...userData}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <WelcomePopup />
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col">
              <Title />
              <div className="sticky top-[60px] overflow-y-auto">
                <Explorer />
              </div>
            </div>
          </div>
          <div className="flex flex-col overflow-hidden">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-muted/40 px-4 backdrop-blur lg:h-[60px] lg:px-6">
              <SheetExplorer />
              <PaperSearch />
              <ModeToggle />
              <AccountDropdown
                userName={localStorage.getItem("userId") ?? ""}
              />
            </header>
            <main className="grow p-4 lg:p-6">
              <PaperTabs />
            </main>
          </div>
        </div>
      </ThemeProvider>
    </LibraryProvider>
  );
}
