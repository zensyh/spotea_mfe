import type { PlopTypes } from '@turbo/gen';

const ZONES = [
  { name: 'shell', port: 3000, basePath: '/' },
  { name: 'merchant', port: 3001, basePath: '/merchant' },
  { name: 'admin', port: 3002, basePath: '/admin' },
  { name: 'consumer', port: 3003, basePath: '/consumer' },
  { name: 'account', port: 3004, basePath: '/account' },
] as const;

const UTILITIES = [
  {
    name: 'handle-api.ts',
    value: 'handle-api',
    description: 'Route handler error wrapper (HttpError → NextResponse)',
    needs: 'Server routes with @repo/auth HttpError',
  },
  {
    name: 'body-utils.ts',
    value: 'body-utils',
    description: 'Request body parser (JSON + FormData)',
    needs: 'Server routes accepting POST/PATCH/PUT',
  },
  {
    name: 'fetcher.ts',
    value: 'fetcher',
    description: 'Client-side fetch wrapper (JSON + ApiError)',
    needs: 'Client components calling /api routes',
  },
  {
    name: 'form-guard.tsx',
    value: 'form-guard',
    description: 'Form wrapper preventing double-submit via ref guard',
    needs: 'Server components with native <form action="POST">',
  },
] as const;

const TEMPLATE_DIR = 'templates/plumbing';

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('plumbing', {
    description:
      'Scaffold shared plumbing utilities into a zone (handle-api, body-utils, fetcher, form-guard)',
    prompts: [
      {
        type: 'list',
        name: 'zone',
        message: 'Select target zone:',
        choices: ZONES.map((z) => ({
          name: `${z.name} (port ${z.port}, ${z.basePath})`,
          value: z.name,
        })),
      },
      {
        type: 'checkbox',
        name: 'utilities',
        message: 'Select utilities to scaffold:',
        choices: UTILITIES.map((u) => ({
          name: `${u.name} — ${u.description}`,
          value: u.value,
        })),
      },
    ],
    actions: (answers) => {
      const zone = (answers as { zone: string }).zone;
      const selected: string[] = (answers as { utilities: string[] }).utilities;

      if (!zone) {
        throw new Error('No zone selected');
      }

      const actions: PlopTypes.ActionType[] = [];

      if (selected.includes('handle-api')) {
        actions.push({
          type: 'add',
          path: `{{ turbo.paths.root }}/apps/${zone}/src/shared/lib/handle-api.ts`,
          templateFile: `${TEMPLATE_DIR}/handle-api.ts.hbs`,
        });
      }

      if (selected.includes('body-utils')) {
        actions.push({
          type: 'add',
          path: `{{ turbo.paths.root }}/apps/${zone}/src/shared/lib/body-utils.ts`,
          templateFile: `${TEMPLATE_DIR}/body-utils.ts.hbs`,
        });
      }

      if (selected.includes('fetcher')) {
        actions.push({
          type: 'add',
          path: `{{ turbo.paths.root }}/apps/${zone}/src/shared/lib/fetcher.ts`,
          templateFile: `${TEMPLATE_DIR}/fetcher.ts.hbs`,
        });
      }

      if (selected.includes('form-guard')) {
        actions.push({
          type: 'add',
          path: `{{ turbo.paths.root }}/apps/${zone}/src/shared/lib/form-guard.tsx`,
          templateFile: `${TEMPLATE_DIR}/form-guard.tsx.hbs`,
        });
      }

      return actions;
    },
  });
}
