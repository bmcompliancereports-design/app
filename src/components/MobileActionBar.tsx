import { IconArrowRight, IconPrinter } from './Icons';

interface Props {
  convertLabel: string;
  canConvert: boolean;
  onConvert: () => void;
  onPrint: () => void;
}

export function MobileActionBar({ convertLabel, canConvert, onConvert, onPrint }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl gap-2.5">
        <button
          type="button"
          onClick={onConvert}
          disabled={!canConvert}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-hairline bg-white py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-accent/40 disabled:text-ink-faint"
        >
          {convertLabel}
          {canConvert && <IconArrowRight className="text-accent" />}
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink py-2.5 text-[13px] font-medium text-white"
        >
          <IconPrinter /> Export PDF
        </button>
      </div>
    </div>
  );
}
