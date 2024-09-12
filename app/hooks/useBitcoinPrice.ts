import { btcPriceAtom } from "@/app/recoil/btcPriceAtom"
import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"

export const useBitcoinPrice = () => {
  const [btcUsdPrice, setBtcUsdPrice] = useRecoilState(btcPriceAtom)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        setIsLoading(true)
        const url = `/api/btc`
        const response = await fetch(url, {
          next: { revalidate: 3600 },
        })

        const data = await response.json()

        if (data) {
          setBtcUsdPrice(data)
          setIsLoading(false)
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (!btcUsdPrice && !isLoading) fetchBitcoinPrice()
  }, [btcUsdPrice, isLoading, setBtcUsdPrice])

  return { btcUsdPrice }
}
