import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseIcon from '../BaseIcon.vue'

const samplePath = 'M10 10 H 90 V 90 H 10 L 10 10'

describe('BaseIcon', () => {
  it('renders an SVG with the given path', () => {
    const wrapper = mount(BaseIcon, {
      props: {
        path: samplePath,
        class: 'w-6 h-6',
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.classes()).toContain('fill-current')
    expect(svg.classes()).toContain('w-6')
    expect(svg.classes()).toContain('h-6')

    const path = wrapper.find('path')
    expect(path.attributes('d')).toBe(samplePath)
  })
})
