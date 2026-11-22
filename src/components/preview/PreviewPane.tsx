import { useLayoutEffect, useRef, useState } from 'react';
import type { StudioDoc } from '../../types';
import { DocumentPaper } from './DocumentPaper';

const A4_WIDTH_PX = (210 / 25.4) * 96;
const A4_HEIGHT_PX = (297 / 25.4) * 96;

/** Scales the true-size A4 sheet to fit its pane while keeping exact proportions. */
export function PreviewPane({ doc, sourceNumber }: { doc: StudioDoc; sourceNumber?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(1);
  const [paperHeight, setPaperHeight] = useState(A4_HEIGHT_PX);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const paper = paperRef.current;
    if (!frame || !paper) return;
    const measure = () => {
      setScale(Math.min(1, frame.clientWidth / A4_WIDTH_PX));
      setPaperHeight(paper.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(paper);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className="mx-auto w-full max-w-[794px]">
      <div className="relative mx-auto" style={{ width: A4_WIDTH_PX * scale, height: paperHeight * scale }}>
        <div
          className="absolute left-0 top-0 origin-top-left rounded-[2px] shadow-paper ring-1 ring-hairline"
          style={{ transform: `scale(${scale})` }}
        >
          <DocumentPaper ref={paperRef} doc={doc} sourceNumber={sourceNumber} />
        </div>
      </div>
    </div>
  );
}
