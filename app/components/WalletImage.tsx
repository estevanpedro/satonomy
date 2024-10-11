import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import Image from "next/image"
import { useRecoilValue } from "recoil"

export const WalletImage = ({ wallet }: { wallet: string }) => {
  const walletConfigs = useRecoilValue(walletConfigsAtom)
  const connections = walletConfigs.images?.find((image) => image?.[wallet])

  if (!wallet) return null

  if (connections?.[wallet]?.isMagicEden) {
    return (
      <div className="flex w-5">
        <Image src={"/me.png"} alt="Wallet Image" width={24} height={24} />
      </div>
    )
  }

  if (connections?.[wallet]?.isXVerse) {
    return (
      <div>
        <Image
          src={
            "data:image/webp;base64,UklGRuwEAABXRUJQVlA4WAoAAAAQAAAAbwAAbwAAQUxQSFEBAAARX6CobSM2VQi39+siIkD6Ght3IYBy27aqZeOS3Jp7I7k2Bs3dIZFcq7t7c3ivff69+/OejrOxxIjo/wTAYVrN7O69pinP9fW+4nR4OfWhBO6XerBlKJm1rq6U2NoYZ5dKcJ2jeSU6x0FaVNZhjN2FEl5pU2BIe4y1ulDi8y3SIvIOLSYUYZLphaEBQFqU4RFAq6KMB844UpDm52hAepjjEOkGh4ppU6QJ8yxJ5yypTyzVfpaGAMtwiGUuzLIZYTmMsjwa345i1f+c/l+q8xjfTpTlMfLdHIZYNoMsw36WTh9L9TlL6jxLchtLQrrBoccgzHEI+DkagDOOFKCVIx5AlEEHgCeGBtMEQ5IJEXmHMRbn8vJhmWZI02OtcC6tErZpEVmHMXaYkJUDp5eS6uD8Sk4H3G4J0WvhvutDwkE2vExrX9791DTNG03T7tf6MuEUAFZQOCB0AwAAMBYAnQEqcABwAD6RJqRSJaElpZSQsBIJZQDPwb7Ixti7ta6CH1ZMhAvurDH5ZM+VRz3/vn6yewB+wAdP5Q760ILaJABDKgXJmnvbmw+I4jh8V7zScHyhbHxAiqVRnimhpiD5VZuC/HY/a8bs/U7KIklXO9tGc2HTRoQt03KmfUvlCBi+RBzlG7//m6ob/nN5NX/WhYoZf7XBuiNE3oOP0exxlHHGPFVr+F4+tKImJXx1CmTClffshh6gAP7aCh4pUaUkossUZ83Fquo7W8A2/Mvfeua1RPr0gkkZ7Q+Ahgi9BzJoFPcUn6O4R2qsmaqPHs9BCMj8Ptk4tlvAfEA32+5wAJys1wtb4Cpc/9Db8//7/813f/DX9zwAprFjdl9fmcBS5pghg/fda9bZWY3GB8+jseI8p8ccnO+VpjA6+JdXimMyub4Nx1VrjNGvKx19j2EQZIKOx9m7UnnGWxs+r4GOS6i3iMyxZTo6cB8SU7AcvGMThWyxkavnDa5Qk4IOW54eUyahZ9WqeMubPkrG9RTOGvSlr3FvYkdWrf+cPrle8JPtSMKdeH7jecMa3G+wdyBrF7KAn43bMf8ikE0r22o5pcYdzD5pFxf1PxPc3SChbfgA0n1X3ZBP3AYQIQ6RzM+wfDUT2jtR7EI+/9ymcVmni2ze+NzVZ8n5rHxB/OpgsAkxrPO7zYYI7OeZa1UJbvacOtPOby67/dKfk4nLCjl8yYhTYyWhPVODFUX/PTpJz+mxX8tbNtgmtdRyVOQT3sJ6yCHW+4JokGAZISG2XXA0L9lqFvgjqeGbwkazrd7f/jn/mn/7M6R3+gHwGt6hKVO0HhEai05v0QoBZsRVPA/LDdScUKJfKTS3t8W7YKOwvu5PJ6H3jCY/9mXKr/F+4/qhmbD5HXLjX6Izdi/UqSbHLyIaU/NmmJZSs8o5ydF9sE0XBVY7L2gXWlYoaqBakZzx8CH2JraSrUR1eTwNbnosqGqMv5wv4adU/vyct41y/rFnFUROiNBoZogKpfFYgM3vvRop15mZNNixBvijrjJZYMFXH8/pXfhX61yDC1Cf9y5+UJRcgbGBEEucVQRmnL/j/NszhJXOuRWZHM3ZycAfR8e5ddmooGrfsEM/JtLUBcAt4zkJb8Iiw/O6u/DWGMWxWLRWbaKhWMrQ5ROcYhQAAAA="
          }
          alt="Wallet Image"
          width={24}
          height={24}
        />
      </div>
    )
  }

  if (connections?.[wallet]?.isUnisat) {
    return (
      <div>
        <Image
          src={"https://next-cdn.unisat.io/_/305/logo/color.svg"}
          alt="Wallet Image"
          width={18}
          height={18}
        />
      </div>
    )
  }
  if (connections?.[wallet]?.isOkxWallet) {
    return (
      <div>
        <Image
          src={"https://www.okx.com/cdn/assets/imgs/226/EB771F0EE8994DD5.png"}
          alt="Wallet Image"
          width={18}
          height={18}
        />
      </div>
    )
  }

  return <div>✅</div>
}
