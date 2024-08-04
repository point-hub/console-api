import { describe, expect, it } from 'bun:test'

import emailServiceConfig from './email-service'

describe('email service config', () => {
  it('endpoint should be typeof string', () => {
    expect(typeof emailServiceConfig.endpoint).toBe('string')
  })
})
