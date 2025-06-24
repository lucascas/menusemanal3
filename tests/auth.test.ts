import { test, expect } from "@playwright/test"

test.describe("Sistema de autenticación", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
  })

  test("muestra el formulario de inicio de sesión", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Planneat" })).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Contraseña")).toBeVisible()
    await expect(page.getByRole("button", { name: "Iniciar Sesión" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Iniciar sesión con Google" })).toBeVisible()
  })

  test("valida el formato del email", async ({ page }) => {
    await page.getByLabel("Email").fill("emailinvalido")
    await page.getByLabel("Contraseña").fill("password123")
    await page.getByRole("button", { name: "Iniciar Sesión" }).click()

    await expect(page.getByText("Por favor, introduce un email válido")).toBeVisible()
  })

  test("muestra error con credenciales inválidas", async ({ page }) => {
    await page.getByLabel("Email").fill("usuario@test.com")
    await page.getByLabel("Contraseña").fill("contraseñaincorrecta")
    await page.getByRole("button", { name: "Iniciar Sesión" }).click()

    await expect(page.getByText("Email o contraseña incorrectos")).toBeVisible()
  })

  test("redirige después de inicio de sesión exitoso", async ({ page }) => {
    await page.getByLabel("Email").fill("usuario@test.com")
    await page.getByLabel("Contraseña").fill("contraseñacorrecta")
    await page.getByRole("button", { name: "Iniciar Sesión" }).click()

    await expect(page).toHaveURL("/?tab=planner")
  })

  test("mantiene la sesión después de recargar", async ({ page }) => {
    // Iniciar sesión
    await page.getByLabel("Email").fill("usuario@test.com")
    await page.getByLabel("Contraseña").fill("contraseñacorrecta")
    await page.getByRole("button", { name: "Iniciar Sesión" }).click()

    // Recargar la página
    await page.reload()

    // Verificar que sigue en la página principal
    await expect(page).toHaveURL("/?tab=planner")
  })

  test("cierra sesión correctamente", async ({ page }) => {
    // Iniciar sesión
    await page.getByLabel("Email").fill("usuario@test.com")
    await page.getByLabel("Contraseña").fill("contraseñacorrecta")
    await page.getByRole("button", { name: "Iniciar Sesión" }).click()

    // Cerrar sesión
    await page.getByRole("button", { name: "Cerrar sesión" }).click()

    // Verificar redirección a login
    await expect(page).toHaveURL("/login")
  })
})

