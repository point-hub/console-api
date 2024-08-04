import { copyrightYear, Handlebars, renderInlineCss } from '@point-hub/express-utils'

import emailServiceConfig from '@/config/email-service'

// Partials
const header = await Bun.file('./src/utils/email/header.hbs').text()
Handlebars.registerPartial('header', Handlebars.compile(header))
const footer = await Bun.file('./src/utils/email/footer.hbs').text()
Handlebars.registerPartial('footer', Handlebars.compile(footer))

// Helpers
Handlebars.registerHelper('appName', () => {
  return 'Pointhub'
})
Handlebars.registerHelper('copyrightYear', copyrightYear)

// Render
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderHbsTemplate = async (path: string, context?: Record<string, any>) => {
  const html = Handlebars.render(await Bun.file(`./src/modules/${path}`).text(), context ?? {})

  return renderInlineCss(html, await Bun.file('./src/utils/email/style.css').text())
}

// Sending Mail
export const sendMail = async (html: string, to: string, subject: string) => {
  fetch(emailServiceConfig.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html: html,
      to: to,
      subject: subject,
    }),
  })
}
