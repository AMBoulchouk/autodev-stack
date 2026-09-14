import { render, screen } from '@testing-library/react';
import Page from '../src/app/page';

describe('Page', () => {
  it('renders the platform name', async () => {
    render(await Page());
    expect(screen.getByRole('heading', { name: 'Autodev Stack' })).toBeTruthy();
  });
});
