import {
  CdkVirtualScrollViewport,
  VirtualScrollStrategy,
} from '@angular/cdk/scrolling';
import { Observable, Subject } from 'rxjs';

export class VariableSizeVirtualScrollStrategy implements VirtualScrollStrategy {
  private viewport?: CdkVirtualScrollViewport;
  private resizeObserver?: ResizeObserver;
  private sizes: number[] = [];
  private offsets: number[] = [];
  private readonly indexChange = new Subject<number>();
  private readonly estimatedItemSize = 88;
  private readonly bufferSize = 500;

  readonly scrolledIndexChange: Observable<number> = this.indexChange.asObservable();

  attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;
    this.resizeObserver = new ResizeObserver(() => this.measureRenderedRows());
    this.resizeObserver.observe(viewport.elementRef.nativeElement);
    this.recalculate(viewport.getDataLength());
  }

  detach(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.viewport = undefined;
    this.indexChange.complete();
  }

  onContentScrolled(): void {
    this.updateRenderedRange();
  }

  onDataLengthChanged(): void {
    const length = this.viewport?.getDataLength() ?? 0;
    this.recalculate(length);
  }

  onContentRendered(): void {
    queueMicrotask(() => this.measureRenderedRows());
  }

  onRenderedOffsetChanged(): void {
    // The strategy owns the rendered offset and does not need a second reaction.
  }

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    this.viewport?.scrollToOffset(this.offsetForIndex(index), behavior);
  }

  private recalculate(length: number): void {
    this.ensureSizes(length);
    this.offsets = new Array(length + 1);
    this.offsets[0] = 0;
    for (let index = 0; index < length; index += 1) {
      this.offsets[index + 1] = this.offsets[index] + this.sizes[index];
    }
    this.viewport?.setTotalContentSize(this.offsets[length] ?? 0);
    this.updateRenderedRange();
  }

  private ensureSizes(length: number): void {
    this.sizes.length = length;
    for (let index = 0; index < length; index += 1) {
      this.sizes[index] ??= this.estimatedItemSize;
    }
  }

  private measureRenderedRows(): void {
    const viewport = this.viewport;
    if (!viewport) return;

    let changed = false;
    viewport.elementRef.nativeElement
      .querySelectorAll<HTMLElement>('[data-menu-row-index]')
      .forEach((row) => {
        const index = Number(row.dataset['menuRowIndex']);
        const measuredSize = row.getBoundingClientRect().height;
        if (Number.isInteger(index) && measuredSize > 0 && this.sizes[index] !== measuredSize) {
          this.sizes[index] = measuredSize;
          changed = true;
        }
      });

    if (changed) this.recalculate(this.sizes.length);
  }

  private updateRenderedRange(): void {
    const viewport = this.viewport;
    if (!viewport || this.offsets.length === 0) return;

    const scrollOffset = viewport.measureScrollOffset();
    const viewportSize = viewport.getViewportSize();
    const start = Math.max(0, this.findIndexAtOffset(scrollOffset - this.bufferSize));
    const end = Math.min(
      this.sizes.length,
      this.findIndexAtOffset(scrollOffset + viewportSize + this.bufferSize) + 1,
    );

    viewport.setRenderedRange({ start, end: Math.max(start + 1, end) });
    viewport.setRenderedContentOffset(this.offsetForIndex(start));
    this.indexChange.next(this.findIndexAtOffset(scrollOffset));
  }

  private offsetForIndex(index: number): number {
    return this.offsets[Math.max(0, Math.min(index, this.offsets.length - 1))] ?? 0;
  }

  private findIndexAtOffset(offset: number): number {
    let low = 0;
    let high = Math.max(0, this.offsets.length - 1);
    const target = Math.max(0, offset);

    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (this.offsetForIndex(middle) <= target) low = middle;
      else high = middle - 1;
    }

    return low;
  }
}
