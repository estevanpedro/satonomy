import { ThemeProvider } from "@/app/providers/ThemeProvider"
import { WalletProvider } from "@/app/providers/WalletProvider"
import { StrictMode } from "react"
import { RecoilRoot } from "recoil"

export const MultiProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <StrictMode>
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
    </StrictMode>
  )
}
