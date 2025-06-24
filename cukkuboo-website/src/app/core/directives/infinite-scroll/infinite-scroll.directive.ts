import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Directive({
  selector: '[infiniteScroll]'
})
export class InfiniteScrollDirective {

  @Output() scrolled = new EventEmitter<void>();

  @Input() threshold: number = 0.8;  // Trigger when 80% visible

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    const options = {
      root: null,
      threshold: this.threshold
    };

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.scrolled.emit();
      }
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

}
