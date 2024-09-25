import LZString from "lz-string"

export const encodeData = (obj: any) => {
  if (!obj) return null
  return LZString.compressToEncodedURIComponent(JSON.stringify(obj))
}

export const decompressFromUrlParam = (compressedParam: string): any => {
  const decompressed =
    LZString.decompressFromEncodedURIComponent(compressedParam)
  return decompressed ? JSON.parse(decompressed) : {}
}
