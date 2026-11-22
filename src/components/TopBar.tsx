import type { AccentKey, CurrencyCode } from '../types';
import { ACCENT_ORDER, ACCENTS, CURRENCIES, CURRENCY_ORDER } from '../lib/constants';
import type { SaveStatus } from '../state/studio';
import { Segmented } from './editor/fields';
import { IconCheck, IconHistory, IconPrinter, IconReset } from './Icons';

export type View = 'edit' | 'preview';

interface Props {
  currency: CurrencyCode;
  onCurrency: (c: CurrencyCode) => void;
  accent: AccentKey;
  onAccent: (a: AccentKey) => void;
  docCount: number;
  onHistory: () => void;
  onReset: () => void;
  onPrint: () => void;
  saveStatus: SaveStatus;
  view: View;
  onView: (v: View) => void;
}

function AccentDots({ accent, onAccent }: Pick<Props, 'accent' | 'onAccent'>) {
  return (
    <div role="radiogroup" aria-label="Brand accent" className="flex items-center gap-1.5">
      {ACCENT_ORDER.map((key) => {
        const selected = key === accent;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={ACCENTS[key].label}
            title={ACCENTS[key].label}
            onClick={() => onAccent(key)}
            className={`h-[18px] w-[18px] rounded-full transition-shadow ${
              selected ? 'shadow-[0_0_0_2px_#fff,0_0_0_3.5px_#0F172A]' : 'hover:shadow-[0_0_0_2px_#fff,0_0_0_3.5px_#CBD5E1]'
            }`}
            style={{ backgroundColor: ACCENTS[key].hex }}
          />
        );
      })}
    </div>
  );
}

function CurrencyToggle({ currency, onCurrency }: Pick<Props, 'currency' | 'onCurrency'>) {
  return (
    <Segmented<CurrencyCode>
      ariaLabel="Currency"
      size="sm"
      value={currency}
      onChange={onCurrency}
      options={CURRENCY_ORDER.map((code) => ({
        value: code,
        label: (
          <span className="font-mono">
            {code} {CURRENCIES[code].symbol}
          </span>
        ),
      }))}
    />
  );
}

const ghostButton =
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink';

export function TopBar(props: Props) {
  const { docCount, onHistory, onReset, onPrint, saveStatus, view, onView } = props;
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink">
            <span className="absolute inset-x-[7px] top-[6px] h-[2px] bg-accent" />
            <span className="h-[14px] w-[12px] rounded-[1.5px] border-[1.5px] border-white" />
          </span>
          <span className="truncate font-serif text-[21px] leading-none text-ink">PaperLedger</span>
          <span className="hidden truncate border-l border-hairline pl-2.5 text-[12px] text-ink-soft xl:inline">
            Quote, Invoice &amp; Receipt Studio
          </span>
        </div>

        <button type="button" onClick={onHistory} className={`${ghostButton} ml-1 border border-hairline`}>
          <IconHistory />
          <span className="hidden sm:inline">History</span>
          <span className="rounded bg-canvas px-1 font-mono text-[10px] tabular-nums text-ink-soft">{docCount}</span>
        </button>

        <div className="ml-auto flex items-center gap-2 lg:gap-4">
          <div className="hidden lg:block">
            <CurrencyToggle currency={props.currency} onCurrency={props.onCurrency} />
          </div>
          <div className="hidden sm:block">
            <AccentDots accent={props.accent} onAccent={props.onAccent} />
          </div>
          <span
            className={`hidden items-center gap-1 text-[11px] xl:inline-flex ${saveStatus.ok ? 'text-ink-faint' : 'text-red-700'}`}
            role="status"
          >
            {saveStatus.ok ? (
              <>
                <IconCheck width={13} height={13} /> Saved locally
              </>
            ) : (
              'Browser storage is full — export a backup'
            )}
          </span>
          <button type="button" onClick={onReset} className={ghostButton} title="Restore the demo documents">
            <IconReset />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="hidden items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-slate-800 lg:inline-flex"
          >
            <IconPrinter />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Mobile & tablet controls */}
      <div className="flex items-center gap-2 border-t border-hairline px-4 py-2 sm:px-6 lg:hidden">
        <Segmented<View>
          ariaLabel="View"
          value={view}
          onChange={onView}
          className="flex-1"
          options={[
            { value: 'edit', label: 'Edit' },
            { value: 'preview', label: 'Live Preview' },
          ]}
        />
        <CurrencyToggle currency={props.currency} onCurrency={props.onCurrency} />
      </div>
      <div className="flex items-center justify-between border-t border-hairline px-4 py-2 sm:hidden">
        <span className="text-[11px] text-ink-soft">Accent</span>
        <AccentDots accent={props.accent} onAccent={props.onAccent} />
      </div>
    </header>
  );
}
