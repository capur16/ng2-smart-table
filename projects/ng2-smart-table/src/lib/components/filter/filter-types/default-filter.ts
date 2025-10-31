import { Input, Output, EventEmitter, OnDestroy, Component, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Column } from '../../../lib/data-set/column';

@Component({ template: '' })
export class DefaultFilter implements Filter, OnDestroy, OnChanges {
  delay = 300;
  changesSubscription: Subscription | undefined;

  @Input() query: string = '';
  @Input() inputClass: string;
  @Input() column: Column;
  @Output() filter = new EventEmitter<string>();

  // ATTENZIONE: questo deve esistere nel figlio
  inputControl: FormControl<string>;

  constructor(protected elRef: ElementRef) { }

  protected bindControl(): void {
    if (!this.inputControl) return;

    // seed iniziale senza eventi
    if (this.query != null) {
      this.inputControl.setValue(this.query, { emitEvent: false });
    }

    // evita doppie subscribe
    this.changesSubscription?.unsubscribe();

    this.changesSubscription = this.inputControl.valueChanges
      .pipe(
        debounceTime(this.delay),
        distinctUntilChanged(),
      )
      .subscribe((value: string | null) => {
        this.query = value ?? '';
        this.setFilter();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.inputControl) return;

    if (changes['query']) {
      const incoming = (changes['query'].currentValue ?? '') as string;
      const current = this.inputControl.value ?? '';
      const el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null =
        this.elRef.nativeElement.querySelector('input,select,textarea');
      const focused = !!el && document.activeElement === el;

      if (incoming !== current && !focused) {
        this.inputControl.setValue(incoming, { emitEvent: false });
      }
    }
  }

  ngOnDestroy(): void {
    this.changesSubscription?.unsubscribe();
  }

  protected setFilter(): void {
    this.filter.emit(this.query);
  }
}


export interface Filter {

  delay?: number;
  changesSubscription?: Subscription;
  query: string;
  inputClass: string;
  column: Column;
  filter: EventEmitter<string>;
}
