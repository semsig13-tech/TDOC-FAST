import { QuartzTransformerPlugin } from "../types"
import { Root, Paragraph, Element } from "hast"
import { visit, SKIP } from "unist-util-visit"

export const BlockReferences: QuartzTransformerPlugin = () => {
  return {
    name: "BlockReferences",
    htmlPass({ tree }) {
      const blocks: Record<string, Element> = {}

      visit(tree, (node: any, index: number | undefined, parent: any) => {
        if (node.type !== "element") return

        const element = node as Element

        // Process all elements that might contain block references
        if (element.children && element.children.length > 0) {
          let lastChild = element.children[element.children.length - 1]

          // Get text content from last child (could be text node or nested element)
          let textValue = ""
          if (lastChild.type === "text") {
            textValue = lastChild.value as string
          }

          // Match ^block-id at the end
          const blockMatch = textValue.match(/\s+\^([a-zA-Z0-9\-_]+)\s*$/)

          if (blockMatch) {
            const blockId = blockMatch[1]

            // Remove the ^block-id from text
            if (lastChild.type === "text") {
              lastChild.value = textValue
                .slice(0, blockMatch.index)
                .trimEnd()
            }

            // Add ID to current element
            if (!element.properties) element.properties = {}
            element.properties.id = blockId

            // Add CSS class for styling
            if (!element.properties.className) {
              element.properties.className = []
            }
            if (!Array.isArray(element.properties.className)) {
              element.properties.className = [
                element.properties.className as string,
              ]
            }
            ;(element.properties.className as string[]).push("block-reference")

            // Store for transclusion
            blocks[blockId] = element
          }
        }
      })

      // Attach blocks to tree for transclusion support
      ;(tree as any).blocks = blocks

      return tree
    },
  }
}
