import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifestVersion:3,
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    permissions: ['storage', 'activeTab', 'scripting', 'tabs', 'webNavigation', 'identity'],
    host_permissions: ['*://*.wellfound.com/*', '*://*.internshala.com/*'],
    version: "1.0.0",
    key:"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuFXNdKN5BoytbK0GLTGL4o6H/MEx6F9P3L8FfTJRdmfH7FbmzGOOcrcorfSmYBKWuW74dSXQL4aqw+ChzR/so7lZChwoDRAFdvErU64l+Z+xwWVlbra8JjAeaZjjQRUplwh30gf+Y+s2t1i9tCtAaa7qqN5JW8F8u4eVihHDn54kAFMLj4H4Xl3FlNWzQry+WZdX/6GPuWyS5KRolM1ZHNCF2IvrXkDJ1DR8p87NfwI6r98m8fdrnUhIOT5AZH7uFI25QhCjvdZ2sRbIRiu24fQ8yP/1rJICXFTCVT5nOU/qmxRE9WNjUcxpF9nZAwD+XJ1C3JYvNGnEqlZD/YiMUwIDAQAB",
    oauth2: {
      client_id: "113439342527-kliuhrfour83snj76k0fsuch50gu5rta.apps.googleusercontent.com",
      scopes: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    },
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval' http://localhost:3000 http://localhost:3001; object-src 'self'"
    }
  }
});
