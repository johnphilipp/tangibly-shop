import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { DataProvider } from "~/contexts/DataContext";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <DataProvider>
        <Component {...pageProps} />
      </DataProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
