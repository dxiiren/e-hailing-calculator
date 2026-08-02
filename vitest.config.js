import { defineConfig } from "vitest/config";

// The app itself has no build step — index.html pulls Vue, vue-i18n and jsPDF
// from CDNs. This config exists only so the Vitest harness can render that same
// markup offline:
//
//  * `vue` is aliased to the esm-bundler build, which ships the runtime template
//    compiler. index.html uses an in-DOM template, so the runtime-only build
//    (the bundler default) cannot render it.
//  * `vue-i18n` is aliased to its full build for the same reason — the message
//    compiler is needed for the `{n} row | {n} rows` plural strings.
//  * The pinned devDependency majors (vue 3, vue-i18n 9) match the CDN tags in
//    index.html, so the harness exercises the same engines the browser does.
//
// Environment stays `node` by default; the DOM specs opt in with a
// `@vitest-environment jsdom` docblock.
export default defineConfig({
  resolve: {
    alias: {
      vue: "vue/dist/vue.esm-bundler.js",
      "vue-i18n": "vue-i18n/dist/vue-i18n.esm-bundler.js",
    },
  },
  define: {
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "false",
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
    __VUE_I18N_FULL_INSTALL__: "true",
    __VUE_I18N_LEGACY_API__: "true",
    __INTLIFY_PROD_DEVTOOLS__: "false",
    __INTLIFY_DROP_MESSAGE_COMPILER__: "false",
  },
  test: {
    environment: "node",
  },
});
