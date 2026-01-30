import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-star-button',
  imports: [NgClass],
  templateUrl: './star-button.html',
  styleUrl: './star-button.css',
})
export class StarButton {
  disabled = input<boolean>()
  selected = input<boolean>()
  clickEvent = output<Event>()

  onClick(event: Event) {
    this.clickEvent.emit(event)
  }
}
