// Este archivo maneja el almacenamiento de correos de prueba
interface TestEmail {
  to: string
  from: string
  subject: string
  html: string
  sentAt: Date
}

let testEmails: TestEmail[] = []

export const saveTestEmail = (email: TestEmail) => {
  testEmails.push({ ...email, sentAt: new Date() })
}

export const getTestEmails = () => {
  return testEmails
}

export const clearTestEmails = () => {
  testEmails = []
}
