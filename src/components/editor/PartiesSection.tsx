import { useRef, useState } from 'react';
import type { StudioDoc } from '../../types';
import { fileToLogoDataUrl } from '../../lib/image';
import type { StudioActions } from '../../state/studio';
import { IconImage, IconTrash } from '../Icons';
import { TextArea, TextField } from './fields';
import { Section } from './Section';

interface Props {
  doc: StudioDoc;
  actions: StudioActions;
}

export function SenderSection({ doc, actions }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { sender } = doc;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setError(null);
      actions.patchSender({ logo: await fileToLogoDataUrl(file) });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The image could not be used.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Section title="From" summary={sender.name || 'Your business'}>
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-hairline bg-canvas">
          {sender.logo ? (
            <img src={sender.logo} alt="Business logo" className="max-h-full max-w-full object-contain" />
          ) : (
            <IconImage width={20} height={20} className="text-ink-faint" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-hairline bg-white px-2.5 py-1 text-[12px] font-medium text-ink hover:border-slate-300"
            >
              {sender.logo ? 'Replace logo' : 'Upload logo'}
            </button>
            {sender.logo && (
              <button
                type="button"
                onClick={() => actions.patchSender({ logo: null })}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-ink-soft hover:text-red-700"
              >
                <IconTrash width={14} height={14} /> Remove
              </button>
            )}
          </div>
          <p className={`mt-1 text-[11px] ${error ? 'text-red-700' : 'text-ink-faint'}`}>
            {error ?? 'PNG, JPG or SVG. Stored only in this browser.'}
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Business name"
          value={sender.name}
          onChange={(name) => actions.patchSender({ name })}
          wrapperClassName="sm:col-span-2"
          placeholder="Your business name"
        />
        <TextArea
          label="Address"
          rows={2}
          value={sender.address}
          onChange={(address) => actions.patchSender({ address })}
          wrapperClassName="sm:col-span-2"
        />
        <TextField label="Email" type="email" value={sender.email} onChange={(email) => actions.patchSender({ email })} />
        <TextField label="Phone" type="tel" value={sender.phone} onChange={(phone) => actions.patchSender({ phone })} />
      </div>
    </Section>
  );
}

export function ClientSection({ doc, actions }: Props) {
  const { client } = doc;
  return (
    <Section title="Client" summary={client.name || 'Not set'}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Client name"
          value={client.name}
          onChange={(name) => actions.patchClient({ name })}
          placeholder="Company or person"
        />
        <TextField
          label="Email"
          type="email"
          value={client.email}
          onChange={(email) => actions.patchClient({ email })}
          placeholder="accounts@client.com"
        />
        <TextArea
          label="Address"
          rows={2}
          value={client.address}
          onChange={(address) => actions.patchClient({ address })}
          wrapperClassName="sm:col-span-2"
        />
      </div>
    </Section>
  );
}
