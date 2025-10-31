import { Component, OnChanges, OnInit, SimpleChanges, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { DefaultFilter } from './default-filter';

@Component({
  selector: 'input-filter',
  template: `
    <input
      [ngClass]="inputClass"
      [formControl]="inputControl"
      class="form-control"
      type="text"
      [placeholder]="column.title"/>
  `,
})
export class InputFilterComponent extends DefaultFilter implements OnInit, OnChanges {
  inputControl = new FormControl<string>('');

  constructor(elRef: ElementRef) { super(elRef); }

  private isFocused(): boolean {
    const el: HTMLInputElement | null = this.elRef.nativeElement.querySelector('input');
    return !!el && document.activeElement === el;
  }

  ngOnInit(): void {
    // seed iniziale senza generare eventi
    if (this.query != null) {
      this.inputControl.setValue(this.query, { emitEvent: false });
    }

    // ORDINE: debounce → distinct
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
    if (changes['query']) {
      const incoming = (changes['query'].currentValue ?? '') as string;
      const current = this.inputControl.value ?? '';
      // Evita di sovrascrivere durante la digitazione
      if (incoming !== current && !this.isFocused()) {
        this.inputControl.setValue(incoming, { emitEvent: false });
      }
    }
  }
}
