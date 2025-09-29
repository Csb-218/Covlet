import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifestVersion:3,
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest:()=>({
    permissions: ['storage', 'activeTab', 'scripting', 'tabs', 'webNavigation', 'identity'],
    host_permissions: ['*://*.wellfound.com/*', '*://*.internshala.com/*'],
    version: "1.0.0",
    key:import.meta.env.WXT_MANIFEST_KEY,
    oauth2: {
      client_id: import.meta.env.WXT_GOOGLE_CLIENT_ID,
      scopes: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    },
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval' http://localhost:3000 http://localhost:3001; object-src 'self'"
    }
  })
});
