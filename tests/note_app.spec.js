const { test, describe, expect, beforeEach } = require('@playwright/test')
const { loginWith, createNote } = require('./helper')

describe('Note app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Florencia Martinez',
        username: 'florm92',
        password: 'contraseña1234',
      },
    })

    await page.goto('/')
  })

  test('front page can be opened', async ({ page }) => {
    const locator = await page.getByText('Notes')
    await expect(locator).toBeVisible()
    await expect(
      page.getByText(
        'Note app, Department of Computer Science, University of Helsinki 2024'
      )
    ).toBeVisible()
  })

  test('login fails with wrong password', async ({ page }) => {
    // await page.getByRole('button', { name: 'login' }).click()
    // await page.getByTestId('username').fill('florm92')
    // await page.getByTestId('password').fill('wrongpassword')
    // await page.getByRole('button', { name: 'login' }).click()
    await loginWith(page, 'florm92', 'wrongpassword')

    const errorDiv = await page.locator('.error')
    await expect(errorDiv).toContainText('Wrong credentials')
    await expect(errorDiv).toHaveCSS('border-style', 'solid')
    await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

    await expect(
      page.getByText('Florencia Martinez logged-in')
    ).not.toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await loginWith(page, 'florm92', 'contraseña1234')
    await expect(page.getByText('Florencia Martinez logged-in')).toBeVisible()
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'florm92', 'contraseña1234')
    })

    test('a new note can be created', async ({ page }) => {
      // await page.getByRole('button', { name: 'new note' }).click()
      // await page.getByRole('textbox').fill('a note created by playwright')
      // await page.getByRole('button', { name: 'save' }).click()
      await createNote(page, 'a note created by playwright')
      await expect(page.getByText('a note created by playwright')).toBeVisible()
    })

    describe('and a note exist', () => {
      beforeEach(async ({ page }) => {
        await createNote(page, 'first note', true)
        await createNote(page, 'second note', true)
        await createNote(page, 'third note', true)
      })

      test('one of those can be made nonimportant', async ({ page }) => {
        // La primera línea ahora busca el elemento span que contiene el texto asociado con la primera nota creada. En la segunda línea, se utiliza la función locator y se da .. como argumento, que obtiene el elemento padre del elemento. La función locator es muy flexible, y aprovechamos el hecho de que acepta como argumento no solo selectores CSS sino también selectores XPath.
        const otherNoteText = await page.getByText('first note')
        const otherNoteElement = await otherNoteText.locator('..')

        await otherNoteElement
          .getByRole('button', { name: 'make not important' })
          .click()
        await expect(otherNoteElement.getByText('make important')).toBeVisible()
      })

      test('importance can be changed', async ({ page }) => {
        await page.pause()
        const otherNoteText = await page.getByText('second note')
        const otherNoteElement = await otherNoteText.locator('..')

        await otherNoteElement
          .getByRole('button', { name: 'make not important' })
          .click()
        await expect(otherNoteElement.getByText('make important')).toBeVisible()
      })

      // test('importance can be changed', async ({ page }) => {
      //   await page.getByRole('button', { name: 'make not important' }).click()
      //   await expect(page.getByText('make important')).toBeVisible()
      // })
    })
  })
})

// * si quisiera hacer test de una sola prueba puedo en test hacer test.only. Cuando ejecute la prueba solo esa sera testeada, despues de que la prueba funciona puedo eliminar el .only.
// * otra manera es en la linea de comandos poner npm test -- -g "login fails with wrong password" (poniendo en nombre del test que quiero ejecutar).
