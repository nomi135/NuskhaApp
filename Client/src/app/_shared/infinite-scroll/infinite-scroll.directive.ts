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

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.scrolled.emit();
        }
      },
      { rootMargin: `0px 0px ${this.scrollThreshold}px 0px` }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

}
