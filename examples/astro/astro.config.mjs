import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server' // Middleware support requires server or hybrid output
});
