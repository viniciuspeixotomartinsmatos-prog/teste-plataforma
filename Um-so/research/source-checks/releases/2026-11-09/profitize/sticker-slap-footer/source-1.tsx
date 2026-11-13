"use client"

import StickerSlapFooter, { type StickerSlapFooterProps } from "./ui/sticker-slap-footer"

/**
 * O rodapé sozinho, na largura toda e com a altura da tela, para o roteiro inteiro aparecer de uma vez. As props passam
 * para o rodapé: <StickerSlapFooterDemo wordmark="estudio" panel="#3a2bd6" />, por exemplo.
 */
export default function StickerSlapFooterDemo(props: StickerSlapFooterProps) {
  return (
    <div style={{ width: "100%" }}>
      <StickerSlapFooter {...props} />
    </div>
  )
}
