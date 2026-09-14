import { QuartzTransformerPlugin } from "../types"
import { Root, Element } from "hast"
import { visit } from "unist-util-visit"

export const BlockReferences: QuartzTransformerPlugin = () => {
  return {
    name: "BlockReferences",
    htmlPass({ tree }) {
      // Store blocks by ID for transclusion support
      const blocks: Record<string, Element> = {}

      visit(tree, "element", (node: Element, index: number | undefined, parent) => {
        if (!node.children || node.children.length === 0) return

        // Look for text nodes containing ^block-id syntax
        for (let i = node.children.length - 1; i >= 0; i--) {
          const child = node.children[i]

          if (child.type === "text") {
            const text = child.value as string
            // Match ^block-id at the end of text (Obsidian syntax)
            const match = text.match(/\s+\^([a-zA-Z0-9\-]+)\s*$/)

            if (match) {
              const blockId = match[1]
              // Remove the block-id syntax from the text
              child.value = text.replace(/\s+\^\w+\s*$/, "").trimEnd()

              // Add ID to the parent block element
              if (!node.properties) node.properties = {}
              node.properties.id = blockId

              // Store block reference for transclusion
              blocks[blockId] = node

              // For compatibility, also add data attributes
              if (!node.properties.className) node.properties.className = []
              if (!Array.isArray(node.properties.className)) {
                node.properties.className = [node.properties.className as string]
              }
              ;(node.properties.className as string[]).push("block-reference")
              node.properties.dataBlockId = blockId
            }
          }
        }
      })

      // Attach blocks metadata to tree for transclusion support
      ;(tree as any).blocks = blocks

      return tree
    },
  }
}
