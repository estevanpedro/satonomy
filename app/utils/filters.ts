export function filterBitcoinWallets(wallets: string[]): string[] {
  const bitcoinAddressRegex = /^(1|3|bc1|bc1p)/

  return wallets.filter((wallet) => {
    const isBitcoinAddress = bitcoinAddressRegex.test(wallet)
    const lengthValid =
      (wallet.startsWith("3") && wallet.length >= 26 && wallet.length <= 34) ||
      (wallet.startsWith("bc1") && wallet.length >= 42 && wallet.length <= 62)

    return isBitcoinAddress && lengthValid
  })
}
