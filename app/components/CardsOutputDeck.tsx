"use client"

import React, { useRef, useEffect } from "react"
import { useSpring, animated } from "react-spring"
import { useDrag } from "@use-gesture/react"

import { CardOutputOption } from "@/app/components/Card"
import { useRecoilState, useRecoilValue } from "recoil"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { runesAtom } from "@/app/recoil/runesAtom"
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom"

export const OutputDeck = () => {
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom)
  const runes = useRecoilValue(runesAtom)
  const ordinals = useRecoilValue(ordinalsAtom)
  const runeIndex = runes?.findIndex((r) =>
    butterfly.inputs.find((i) =>
      r.utxos?.find((u) => u.location === `${i.txid}:${i.vout}`)
    )
  )

  const rune = runes?.[runeIndex!]
  const allInscriptions = ordinals?.flatMap((o) => o.inscription) || []

  const ordinal = butterfly.inputs.find((input) =>
    allInscriptions?.find(
      (o) => o.utxo.txid === input.txid && o.utxo.vout === input.vout
    )
  )

  return Boolean(rune || ordinal) ? <CardOutputCarousel /> : null
}

export const CardOutputCarousel = () => {
  const [configs, setConfigs] = useRecoilState(configsAtom)
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom)
  const ordinals = useRecoilValue(ordinalsAtom)
  const runes = useRecoilValue(runesAtom)
  const containerRef = useRef<HTMLDivElement>(null)
  const [{ x }, api] = useSpring(() => ({ x: 0 }))
  const bind = useDrag(
    ({ offset: [ox] }) => {
      api.start({ x: ox })
    },
    { axis: "x" }
  )

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      api.start({ x: x.get() - e.deltaY })
    }

    const container = containerRef.current

    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, [api, x])

  const handleMouseEnter = (api: any) => {
    api.start({ scale: 1.05 })
  }

  const handleMouseLeave = (api: any) => {
    api.start({ scale: 1 })
  }

  const runeIndex = runes?.findIndex((r) =>
    butterfly.inputs.find((i) =>
      r.utxos.find((u) => u.location === `${i.txid}:${i.vout}`)
    )
  )

  const rune = runes?.[runeIndex!]

  const allInscriptions = ordinals?.flatMap((o) => o.inscription) || []

  const ordinalFound = allInscriptions?.find((o) =>
    butterfly.inputs.find(
      (input) => o.utxo.txid === input.txid && o.utxo.vout === input.vout
    )
  )

  const options = [
    ...(rune ? [rune] : []),
    ...(ordinalFound ? [ordinalFound] : []),
  ]
  const outputOptions = [...options, null]

  const cardsDeckRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutsideDeck = (event: any) => {
      const cleanElement = document?.getElementById("clean")
      const eventTargetIsInsideClean = cleanElement?.contains(event.target)
      if (eventTargetIsInsideClean) return

      if (
        cardsDeckRef.current &&
        !cardsDeckRef.current.contains(event.target)
      ) {
        setConfigs((prev) => ({
          ...prev,
          isOutputDeckOpen: false,
        }))
      }
    }

    if (configs.isOutputDeckOpen) {
      document.addEventListener("mousedown", handleClickOutsideDeck)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDeck)
    }
  }, [
    configs.isInputFullDeckOpen,
    configs.isInputDeckOpen,
    configs.isOutputDeckOpen,
    setConfigs,
  ])

  return (
    <div
      ref={cardsDeckRef}
      className={`fixed bgshadow bottom-0 w-[100vw] ${
        !configs.isOutputDeckOpen ? "hidden" : "flex"
      }`}
    >
      <div
        ref={containerRef}
        className=" relative w-full h-[350px] overflow-hidden flex justify-center items-center"
        style={{ touchAction: "none" }}
      >
        <animated.div
          {...bind()}
          className="flex space-x-6 cursor-grab"
          style={{ x }}
        >
          {outputOptions!.map((action, index) => {
            return (
              <animated.div
                key={index}
                className="flex items-center justify-center"
                style={{
                  width: "200px",
                  height: "300px",
                }}
                onMouseEnter={() => handleMouseEnter(api)}
                onMouseLeave={() => handleMouseLeave(api)}
              >
                <CardOutputOption action={action} />
              </animated.div>
            )
          })}
        </animated.div>
      </div>
    </div>
  )
}
