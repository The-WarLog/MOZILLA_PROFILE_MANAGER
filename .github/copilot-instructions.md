# Firefox Profile Manager - AI Coding Agent Instructions

## Project Overview
This is a **Firefox WebExtension (Manifest V3)** for managing Firefox container profiles. Built with **Vue 3 + TypeScript + Vite**, it uses the browser's `contextualIdentities` API to create/manage isolated browsing contexts (profiles).

## Architecture

### Three-Component Structure
The extension has three independent Vue apps (NOT a traditional single-page app with routing):

1. **Background Service Worker** ([src/background/index.ts](../src/background/index.ts))
   - Entry point: Listens for messages and delegates to [messanging.ts](../src/background/messanging.ts)
   - Handles all browser API calls (contextualIdentities, tabs)
   - Uses typed message passing pattern (see `Message` type in [messanging.ts](../src/background/messanging.ts))

2. **Popup App** ([src/popup/popup.ts](../src/popup/popup.ts) → [popup.vue](../src/popup/popup.vue))
   - Standalone Vue app for extension toolbar icon
   - Lists profiles with color-coded borders
   - Opens profile management options page

3. **Options Page** ([src/Options/options-entry.ts](../src/Options/options-entry.ts) → [options.vue](../src/Options/options.vue))
   - Standalone Vue app for full-page settings
   - Create/delete profiles with custom colors/icons
   - Each app mounts independently (no shared router)

### Communication Pattern
**UI → Background → Browser API** using message passing:
```typescript
// UI components send messages via browser.runtime.sendMessage()
await browser.runtime.sendMessage({ type: 'CREATE_PROFILE', name: 'Work', color: 'blue' })

// Background worker handles in messanging.ts switch statement
case 'CREATE_PROFILE': return await browser.contextualIdentities.create(...)
```

Shared state/functions live in [src/Options/options.ts](../src/Options/options.ts) (imported by both popup and options page).

## Build System

### Multi-Entry Vite Configuration
[vite.config.ts](../vite.config.ts) builds three separate bundles:
- `popup.js` from [src/popup/popup.ts](../src/popup/popup.ts)
- `options.js` from [src/Options/options-entry.ts](../src/Options/options-entry.ts)  
- `background.js` from [src/background/index.ts](../src/background/index.ts)

**Critical:** [manifest.json](../manifest.json) references built `.js` files, NOT `.ts` sources. Output goes to `dist/` with flat file structure.

### Development Workflow
- `bun dev` - Start Vite dev server (but WebExtensions need manual reload in browser)
- `bun build` - Type-check with `vue-tsc` then build all entries
- `bun test:unit` - Run Vitest tests in jsdom environment
- Load `dist/` folder in Firefox via `about:debugging` after building

## Key Conventions

### State Management
No Pinia/Vuex - uses Vue 3 Composition API with exported refs:
```typescript
// src/Options/options.ts
export const profiles = ref<Array<Profiles>>([...])
export const newProfile = ref({ name: '', color: 'blue', ... })
```

### Browser API Access
Always use `webextension-polyfill` for type safety:
```typescript
import browser from 'webextension-polyfill'
await browser.contextualIdentities.query({})
```

### Color Mapping
Firefox profile colors are strings ('blue', 'red', etc.). Both popup and options pages duplicate `getColorValue()` function to map these to hex codes. **Keep mappings in sync** when adding colors.

### Entry Point Pattern
Each UI component has a separate entry file ([popup.ts](../src/popup/popup.ts), [options-entry.ts](../src/Options/options-entry.ts)) that creates a Vue app and mounts the corresponding `.vue` file. Do NOT try to share a single Vue app instance.

## Testing
- Tests in [src/__tests__/](../src/__tests__/) using Vitest + @vue/test-utils
- jsdom environment configured in [vitest.config.ts](../vitest.config.ts)
- Run with `bun test:unit`

## Common Tasks

### Adding a New Message Type
1. Add to `Message` union type in [src/background/messanging.ts](../src/background/messanging.ts)
2. Add case to `sendMessages()` switch statement
3. Add wrapper function in [src/Options/options.ts](../src/Options/options.ts) for UI access

### Adding a Profile Property
1. Update `Profiles` interface in [src/Options/options.ts](../src/Options/options.ts)
2. Modify `browser.contextualIdentities.create()` calls in [messanging.ts](../src/background/messanging.ts)
3. Update form in [options.vue](../src/Options/options.vue) template

### Debugging Extension Issues
- Build first (`bun build`), then load `dist/` in Firefox
- Check browser console for background worker errors
- Use "Inspect" on extension in `about:debugging` for popup/options debugging


### Recommended IDE Setup and User Interaction
- Show the Code in the chat box in Agent mode also.
- Use VS Code with the Vue (Official) extension for best TypeScript and Vue support.
- Before Editing Files Ask User if they have any specific preferences for code style or structure.
