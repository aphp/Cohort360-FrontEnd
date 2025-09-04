import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// ajoute les méthodes react-testing-library à Vitest pour l'autocompletion
expect.extend(matchers)

afterEach(() => {
  // Après chaque test, on peut executer des fonctions au besoin
  cleanup()
}) // Default on import: runs it after each test.
