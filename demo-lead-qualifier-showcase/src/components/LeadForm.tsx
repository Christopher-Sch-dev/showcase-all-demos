/**
 * LEADFORM — form del prospecto (name, email, phone, topic, budget opcional).
 * Validación inline (email, phone, name, topic). Dispara capture_lead → lead "new" + arranca timer.
 * Consume el core (dispatch, useDemoState) y la config del nicho (DI). NUNCA mailto.
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { UIStrings } from '@/i18n/strings';
import type { Niche } from '@/lib/types';
import type { UseDemoState } from './useDemoState';

export interface LeadFormProps {
  t: UIStrings;
  /** Nicho del lead (config, DI). */
  niche: Niche;
  demo: Pick<UseDemoState, 'dispatch'>;
  /** Callback al capturar un lead (para scroll/focus del QualifyCard). */
  onCaptured?: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]{6,}$/;

// rol: validar email inline.
function validEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

// rol: validar teléfono (6+ dígitos con separadores opcionales).
function validPhone(v: string): boolean {
  return PHONE_RE.test(v.trim());
}

export default function LeadForm({ t, niche, demo, onCaptured }: LeadFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('');
  const [budget, setBudget] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'phone' | 'topic', string>>>({});

  // rol: validar en vivo cada campo al escribir (validación inline, §6B#5).
  function validateField(
    field: 'name' | 'email' | 'phone' | 'topic',
    value: string,
  ): string | undefined {
    switch (field) {
      case 'name':
        return value.trim() ? undefined : t.errName;
      case 'email':
        return value.trim() ? (validEmail(value) ? undefined : t.errEmail) : undefined;
      case 'phone':
        return value.trim() ? (validPhone(value) ? undefined : t.errPhone) : undefined;
      case 'topic':
        return value.trim() ? undefined : t.errTopic;
      default:
        return undefined;
    }
  }

  function handleBlur(field: 'name' | 'email' | 'phone' | 'topic') {
    const value = field === 'name' ? name : field === 'email' ? email : field === 'phone' ? phone : topic;
    const err = validateField(field, value);
    setErrors((prev) => (err ? { ...prev, [field]: err } : { ...prev, [field]: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // validar todos los campos; si hay error, no capturar.
    const nextErrors: typeof errors = {
      name: validateField('name', name),
      email: validateField('email', email),
      phone: validateField('phone', phone),
      topic: validateField('topic', topic),
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.phone || nextErrors.topic) return;

    const budgetNum = budget.trim() ? Number(budget) : undefined;
    const capturedAt = Date.now();
    demo.dispatch({
      type: 'capture_lead',
      intent: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        topic: topic.trim(),
        budget: budgetNum && budgetNum > 0 ? budgetNum : undefined,
        niche,
        capturedAt,
      },
    });
    onCaptured?.();
  }

  return (
    <form
      data-testid="lead-form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      noValidate
      aria-label="lead form"
    >
      <div>
        <label htmlFor="lf-name" className="mb-1 block text-sm font-medium">
          {t.nameLabel}
        </label>
        <input
          id="lf-name"
          data-testid="lf-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder={t.namePlaceholder}
          aria-invalid={!!errors.name}
          className="min-h-[44px] w-full rounded-lg border px-3 text-base"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lf-email" className="mb-1 block text-sm font-medium">
            {t.emailLabel}
          </label>
          <input
            id="lf-email"
            data-testid="lf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder={t.emailPlaceholder}
            aria-invalid={!!errors.email}
            className="min-h-[44px] w-full rounded-lg border px-3 py-2"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="lf-phone" className="mb-1 block text-sm font-medium">
            {t.phoneLabel}
          </label>
          <input
            id="lf-phone"
            data-testid="lf-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder={t.phonePlaceholder}
            aria-invalid={!!errors.phone}
            className="min-h-[44px] w-full rounded-lg border px-3 text-base"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="lf-topic" className="mb-1 block text-sm font-medium">
          {t.topicLabel}
        </label>
        <input
          id="lf-topic"
          data-testid="lf-topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onBlur={() => handleBlur('topic')}
          placeholder={t.topicPlaceholder}
          aria-invalid={!!errors.topic}
          className="min-h-[44px] w-full rounded-lg border px-3 text-base"
        />
        {errors.topic && <p className="mt-1 text-sm text-red-600">{errors.topic}</p>}
      </div>

      <div>
        <label htmlFor="lf-budget" className="mb-1 block text-sm font-medium">
          {t.budgetLabel}
        </label>
        <input
          id="lf-budget"
          data-testid="lf-budget"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder={t.budgetPlaceholder}
          min={0}
          className="min-h-[44px] w-full rounded-lg border px-3 text-base"
        />
      </div>

      <button
        type="submit"
        data-testid="lf-submit"
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-6 py-3 font-semibold transition"
        style={{ backgroundColor: '#C9A24B', color: '#ffffff' }}
      >
        {t.submit}
      </button>
    </form>
  );
}
