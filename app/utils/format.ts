export function formatAddress(address: string): string {
  return `${address.slice(0, 5)}...${address.slice(-5)}`
}

export function formatNumber(
  num: number = 0,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2,
  enforceTwoDecimals: boolean = false,
  handleZeros: boolean = false
): string {
  if (enforceTwoDecimals && num >= 1) {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  if (handleZeros) {
    if (num === 0) {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    const numStr = num.toString()
    const decimalIndex = numStr.indexOf(".")
    if (decimalIndex === -1) {
      return num.toLocaleString("en-US")
    }

    const fractionalPart = numStr.slice(decimalIndex + 1)

    let firstNonZeroIndex = -1
    for (let i = 0; i < fractionalPart.length; i++) {
      if (fractionalPart[i] !== "0") {
        firstNonZeroIndex = i
        break
      }
    }

    if (firstNonZeroIndex === -1) {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    const maxDigits = Math.max(firstNonZeroIndex + 3, minimumFractionDigits)

    return num.toLocaleString("en-US", {
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: Math.min(maxDigits, maximumFractionDigits),
    })
  }

  return num.toLocaleString("en-US", {
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits,
  })
}
