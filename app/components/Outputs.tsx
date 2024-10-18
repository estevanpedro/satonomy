import { useState, useEffect } from "react"
import { CardOutput } from "@/app/components/Card"
import { useOutputs } from "@/app/hooks/useOutputs"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { useRecoilState } from "recoil"

export const ButterflyOutputs = () => {
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom)
  const inputsCount = butterfly.inputs.length
  const outputsCount = butterfly.outputs.length

  const height = 320
  const inputHeight = 320 * inputsCount
  const outputHeight = 320 * outputsCount
  const totalHeight = Math.max(inputHeight, outputHeight)

  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [visibleIndices, setVisibleIndices] = useState<number[]>([])

  useEffect(() => {
    const firstIndices = Array.from(
      { length: Math.min(10, outputsCount) },
      (_, i) => i
    )
    const lastIndices = Array.from(
      { length: Math.min(10, outputsCount) },
      (_, i) => outputsCount - 1 - i
    )

    setVisibleIndices(Array.from(new Set([...firstIndices, ...lastIndices])))
  }, [outputsCount])

  const onRemoveOutput = (index: number) => {
    setButterfly((prev) => ({
      ...prev,
      outputs: prev.outputs.filter((_, key) => key !== index),
    }))
  }

  const handleMouseEnter = (i: number) => {
    setHoverIndex(i)

    // Add the current index and 5 above/below to the visible list
    setVisibleIndices((prev) => {
      const newVisible = []
      for (let j = i - 5; j <= i + 5; j++) {
        if (j >= 0 && j < butterfly.outputs.length && !prev.includes(j)) {
          newVisible.push(j)
        }
      }
      return [...prev, ...newVisible]
    })
  }

  const outputPaths = useOutputs({
    butterfly,
    totalHeight: outputHeight,
    outputsCount,
    height,
    inputHeight,
    inputsCount,
  })

  return (
    <div
      className={`relative ${
        totalHeight ? `h-[${totalHeight + 1}px]` : ""
      } flex flex-col w-full`}
    >
      {outputPaths}

      {butterfly.outputs.map((_, i) => {
        const shouldRender = visibleIndices.includes(i) || hoverIndex === i

        return (
          <div
            key={`output-${i}`}
            className="mb-8 h-80 flex w-full relative z-2 justify-end"
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {shouldRender && <CardOutput index={i} onRemove={onRemoveOutput} />}
          </div>
        )
      })}
    </div>
  )
}
