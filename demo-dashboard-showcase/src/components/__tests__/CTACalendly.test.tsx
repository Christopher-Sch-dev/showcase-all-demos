/**
 * TESTS CTACalendly — CTA → calendly.com/csch1305, target blank, NUNCA mailto .
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import CTACalendly from '../ui/CTACalendly';
import { strings, renderWith } from './helpers';

const URL = 'https://calendly.com/csch1305';

describe('CTACalendly', () => {
 it('enlaza a Calendly con target blank y rel noopener', () => {
 renderWith(<CTACalendly label="Book demo" url={URL} strings={strings} />);
 const link = screen.getByRole('link', { name: /Book demo/i });
 expect(link).toHaveAttribute('href', URL);
 expect(link).toHaveAttribute('target', '_blank');
 expect(link).toHaveAttribute('rel', 'noopener noreferrer');
 });

 it('NUNCA usa mailto ', () => {
 renderWith(<CTACalendly label="Book demo" url={URL} strings={strings} />);
 const link = screen.getByRole('link', { name: /Book demo/i });
 expect(link.getAttribute('href')).not.toMatch(/^mailto:/);
 });

 it('muestra el micro-trust bajo el CTA', () => {
 renderWith(<CTACalendly label="Book demo" url={URL} strings={strings} microTrust={strings.cta.microTrust} />);
 expect(screen.getByText(strings.cta.microTrust)).toBeInTheDocument();
 });
});
