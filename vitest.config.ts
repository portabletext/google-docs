import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        plugins: [],
        test: {
          name: 'unit',
          environment: 'node',
        },
      },
    ],
  },
})
