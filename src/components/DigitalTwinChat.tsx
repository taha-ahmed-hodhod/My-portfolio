import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import type { Locale } from '../types';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const copy = {
  en: {
    open: 'Chat with my Digital Twin',
    close: 'Close chat',
    title: 'Taha’s Digital Twin',
    subtitle: 'AI career assistant · English & Arabic',
    welcome: 'Hi! Ask me about Taha’s experience, projects, skills, or education.',
    prompts: ['Tell me about Taha’s projects', 'What is his tech stack?', 'Ask in Arabic'],
    placeholder: 'Ask about my career…',
    send: 'Send message',
    sending: 'Thinking…',
    powered: 'Messages and CV details are sent to OpenRouter’s free model.',
    failed: 'I couldn’t get an answer. Please try again.',
  },
  ar: {
    open: 'تحدث مع التوأم الرقمي',
    close: 'إغلاق المحادثة',
    title: 'التوأم الرقمي لطه',
    subtitle: 'مساعد مهني بالذكاء الاصطناعي · عربي وإنجليزي',
    welcome: 'أهلًا! اسألني عن خبرة طه أو مشاريعه أو مهاراته أو تعليمه.',
    prompts: ['احكيلي عن مشاريع طه', 'إيه التقنيات اللي بيستخدمها؟', 'ما خبرته في React؟'],
    placeholder: 'اسأل عن مسيرتي المهنية…',
    send: 'إرسال الرسالة',
    sending: 'بفكر…',
    powered: 'تُرسل رسائلك ومعلومات السيرة الذاتية إلى نموذج OpenRouter المجاني.',
    failed: 'ماقدرتش أجيب إجابة. حاول مرة تانية.',
  },
} as const;

export function DigitalTwinChat({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      inputRef.current?.focus();
    }
  }, [open, messages, busy]);

  async function sendMessage(text = draft) {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setDraft('');
    setError('');
    setBusy(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-10) }),
        signal: AbortSignal.timeout(95_000),
      });
      const result = await response.json().catch(() => null);
      if (!result || typeof result !== 'object') {
        throw new Error(locale === 'ar'
          ? 'خدمة الشات غير متصلة بهذا النشر. تأكد من نشر مسار /api/chat على Vercel ثم أعد النشر.'
          : 'The chat API is not connected to this deployment. Make sure /api/chat is deployed on Vercel, then redeploy.');
      }
      if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : t.failed);
      if (typeof result.answer !== 'string') throw new Error(t.failed);
      setMessages((current) => [...current, { role: 'assistant', content: result.answer }]);
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== 'AbortError' ? cause.message : t.failed);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className={'digital-twin' + (open ? ' is-open' : '')} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {open && (
        <section className="digital-twin-panel" id="digital-twin-panel" aria-label={t.title}>
          <header className="digital-twin-header">
            <span className="digital-twin-avatar" aria-hidden="true">✳</span>
            <div className="digital-twin-heading">
              <strong>{t.title}</strong>
              <small><i />{t.subtitle}</small>
            </div>
            <button type="button" className="digital-twin-close" onClick={() => setOpen(false)} aria-label={t.close}>×</button>
          </header>

          <div className="digital-twin-messages" aria-live="polite" aria-relevant="additions text">
            <div className="digital-twin-welcome">{t.welcome}</div>
            {messages.map((message, index) => (
              <div className={'digital-twin-message ' + message.role} key={index}>
                <p>{message.content}</p>
              </div>
            ))}
            {busy && <div className="digital-twin-message assistant is-typing"><span /><span /><span /><em>{t.sending}</em></div>}
            {error && <p className="digital-twin-error" role="alert">{error}</p>}
            <div ref={endRef} />
          </div>

          {messages.length === 0 && (
            <div className="digital-twin-suggestions">
              {t.prompts.map((prompt) => <button type="button" key={prompt} onClick={() => void sendMessage(prompt)}>{prompt}</button>)}
            </div>
          )}

          <form className="digital-twin-form" onSubmit={onSubmit}>
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              maxLength={2_000}
              disabled={busy}
            />
            <button type="submit" disabled={busy || !draft.trim()} aria-label={t.send} title={t.send}><span aria-hidden="true">↑</span></button>
          </form>
          <p className="digital-twin-footnote">{t.powered} · OpenRouter</p>
        </section>
      )}

      <button
        type="button"
        className="digital-twin-launcher"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="digital-twin-panel"
        aria-label={open ? t.close : t.open}
      >
        <span aria-hidden="true">{open ? '×' : '✳'}</span>
        <span>{open ? t.close : t.open}</span>
      </button>
    </div>
  );
}
