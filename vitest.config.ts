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
		include: ['tests/**/*.test.ts']
	}
});
