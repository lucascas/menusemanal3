// Este archivo simula una base de datos de usuarios de prueba
export const testUsers = [
  { id: "1", email: "usuario1@test.com", name: "Usuario 1" },
  { id: "2", email: "usuario2@test.com", name: "Usuario 2" },
  { id: "3", email: "usuario3@test.com", name: "Usuario 3" },
  // Puedes agregar más usuarios de prueba aquí
]

export const findTestUser = (email: string) => {
  return testUsers.find((user) => user.email === email)
}

