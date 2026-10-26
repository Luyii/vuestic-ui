import { Ref, ref, watch } from 'vue'
import { useResizeObserver } from '../../../composables'

const getContentWidth = (textarea: HTMLTextAreaElement) => {
  const style = window.getComputedStyle(textarea)
  const paddingLeft = parseFloat(style.paddingLeft) || 0
  const paddingRight = parseFloat(style.paddingRight) || 0

  return Math.max(0, textarea.clientWidth - paddingLeft - paddingRight)
}

const makeTextElement = (textarea: HTMLTextAreaElement) => {
  const div = document.createElement('div')
  const style = window.getComputedStyle(textarea)

  div.style.position = 'absolute'
  div.style.top = '0'
  div.style.left = '0'
  div.style.width = `${getContentWidth(textarea)}px`
  div.style.boxSizing = 'content-box'
  div.style.font = style.font
  div.style.lineHeight = style.lineHeight
  div.style.letterSpacing = style.letterSpacing
  div.style.whiteSpace = 'pre-wrap'
  div.style.overflowWrap = 'anywhere'
  div.style.wordBreak = style.wordBreak
  div.style.padding = '0'
  div.style.margin = '0'
  div.style.zIndex = '-1'
  div.style.pointerEvents = 'none'
  div.style.opacity = '0'
  div.ariaHidden = 'true'
  div.textContent = textarea.value

  return div
}

/**
 * Used to get textarea textHeight. Uses resizeObserver and fake div, because
 * font family may be loaded after the component is mounted.
 */
export const useTextHeight = (textarea: Ref<HTMLTextAreaElement | undefined>, text: Ref<string | number>) => {
  const textElement = ref<HTMLElement>()
  const textHeight = ref<number>()

  watch(textarea, (el) => {
    if (el) {
      textElement.value = makeTextElement(el)
      textarea.value?.parentElement?.appendChild(textElement.value)
    }
  })

  useResizeObserver([textElement, textarea], (entries) => {
    for (const entry of entries) {
      if (entry.target === textElement.value) {
        textHeight.value = entry.contentRect.height
      }

      if (entry.target === textarea.value && textElement.value) {
        textElement.value.style.width = `${getContentWidth(textarea.value)}px`
      }
    }
  })

  watch(text, (newText) => {
    if (!textElement.value) { return }
    textElement.value.innerText = String(newText)
    // Add space to correctly handle new lines with br
    textElement.value.innerHTML += '&nbsp;;'
  })

  return textHeight
}
