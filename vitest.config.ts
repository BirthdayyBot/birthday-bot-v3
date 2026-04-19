import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	resolve: {
		alias: [
			{ find: /^#lib\/(.*)$/, replacement: fileURLToPath(new URL('./src/lib/$1', import.meta.url)) },
			{ find: /^#root\/(.*)$/, replacement: fileURLToPath(new URL('./src/$1', import.meta.url)) },
			{ find: /^#utils\/(.*)$/, replacement: fileURLToPath(new URL('./src/lib/util/$1', import.meta.url)) }
		]
	},
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text-summary', 'html', 'lcov'],
			reportsDirectory: './coverage',
			all: true,
			include: ['src/lib/**/*.{ts,tsx}'],
			exclude: ['**/*.d.ts', 'src/generated/**', 'src/**/index.ts'],
			thresholds: {
				lines: 18,
				functions: 37,
				branches: 60,
				statements: 18
			}
		}
	}
});
