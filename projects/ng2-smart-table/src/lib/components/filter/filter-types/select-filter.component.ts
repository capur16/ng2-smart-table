import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DefaultFilter } from './default-filter';

@Component({
  selector: 'select-filter',
  template: `
    <select
      [ngClass]="inputClass"
      class="form-control"
      [formControl]="inputControl">
      <option value="">{{ column.getFilterConfig().selectText }}</option>
      <option *ngFor="let option of column.getFilterConfig().list" [value]="option.value">
        {{ option.title }}
      </option>
    </select>
  `,
})
export class SelectFilterComponent extends DefaultFilter implements OnInit {

  // Typed Forms: un solo "source of truth" (niente ngModel)
  inputControl = new FormControl<string>('');

  constructor(elRef: ElementRef) {
    // Il nuovo DefaultFilter usa ElementRef per gestire focus e sync sicuri
    super(elRef);
  }

  ngOnInit(): void {
    // seed iniziale senza generare eventi verso valueChanges
    if (this.query != null) {
      this.inputControl.setValue(this.query, { emitEvent: false });
    }

    // delega al base: debounce → distinct, setFilter(), gestione unsubscribe
    this.bindControl();
  }
}
