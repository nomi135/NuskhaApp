import { AfterViewInit, Directive, ElementRef, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective implements AfterViewInit, OnDestroy {
  @Input() scrollThreshold = 200; // px before the sentinel reaches the viewport
  @Output() scrolled = new EventEmitter<void>();

  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private recheckTimer?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const latest = entries[entries.length - 1];
        if (!latest.isIntersecting) return;

        this.scrolled.emit();

        // IntersectionObserver only reports *changes* in visibility. If the sentinel is
        // still on screen once the new items have rendered (tall desktop viewport), no
        // further event would fire and loading would stall. Re-observing forces a fresh check.
        this.recheckTimer = setTimeout(() => this.recheck());
      },
      { rootMargin: `0px 0px ${this.scrollThreshold}px 0px` }
    );
    this.observer.observe(this.el.nativeElement);
  }

  private recheck(): void {
    if (!this.observer) return;
    this.observer.unobserve(this.el.nativeElement);
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    clearTimeout(this.recheckTimer);
    this.observer?.disconnect();
    this.observer = undefined;
  }
}