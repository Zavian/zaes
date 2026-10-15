// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import GeneratorPage from '../GeneratorPage';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };

it('mounts the generator without looping', async () => {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const root = createRoot(el);
  await act(async () => root.render(<GeneratorPage />));
  expect(el.textContent).toContain('RPG Card Generator');
  expect(el.textContent).toContain('Your deck is empty');
});
