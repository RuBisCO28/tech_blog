# Tech Blog

## Development

Use Node.js 24 (see `.nvmrc`).

```sh
nvm use
npm ci
npm run dev
```

## Validation

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

Dependencies are recorded in `package-lock.json`. Commit it together with
`package.json` after updates.

Tailwind CSS uses the latest 3.x release to preserve the existing styling.
TypeScript uses 6.x and ESLint uses 9.x to match the supported versions of the
lint plugins. Node.js type definitions match the Node.js 24 runtime.

Development and production builds use Webpack. Turbopack required an internal
port that was unavailable in the validation environment.
