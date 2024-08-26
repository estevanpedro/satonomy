import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { WalletProvider } from "@/app/providers/WalletProvider";
import { RecoilRoot } from "recoil";

export const MultiProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WalletProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <RecoilRoot>{children}</RecoilRoot>
      </ThemeProvider>
    </WalletProvider>
  );
};
