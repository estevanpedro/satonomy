import { InscriptionData, ordAtom } from "@/app/recoil/ordAtom"
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { useAccounts } from "@particle-network/btc-connectkit"
import { useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"

export const useOrd = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [ord, setOrd] = useRecoilState(ordAtom)
  const ordinals = useRecoilValue(ordinalsAtom)

  const { accounts } = useAccounts()
  const account = accounts?.[0]

  const previousWallet = useRef<string | undefined>(undefined)

  useEffect(() => {
    const fetchOrdinals = async () => {
      try {
        // Adjust this part based on how ordinals are structured now
        // Assuming ordinals is an array and each element has an inscriptions array inside
        const allInscriptions = ordinals?.flatMap(
          (ordinal) => ordinal.inscription || []
        )

        if (!allInscriptions?.length) return

        setIsLoading(true)

        const responsesPromises = allInscriptions.map(async (inscription) => {
          const url = `/api/ord?inscriptionId=${inscription.inscriptionId}`
          const response = await fetch(url)
          return await response.json()
        })

        const data: InscriptionData[] = await Promise.all(responsesPromises)

        if (data) {
          setOrd(data)
          setIsLoading(false)
        }
      } catch (error) {
        setOrd(null)
        console.error(error)
      }
    }

    if (!isLoading && account && previousWallet.current !== account) {
      fetchOrdinals()
      previousWallet.current = account
    }

    if (!account) {
      previousWallet.current = undefined
      setOrd(null)
    }
  }, [ord, isLoading, setOrd, account, ordinals])

  return { ord }
}
