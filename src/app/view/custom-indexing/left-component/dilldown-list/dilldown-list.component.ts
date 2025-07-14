import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
export const slideLeftAnimation = trigger('slideLeft', [
  transition(':enter', [
    style({ transform: 'translateX(50%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' })),
  ]),
]);
export const newListAnimation = trigger('newList', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('500ms ease-out', style({ opacity: 1 })),
  ]),
]);
@Component({
  selector: 'app-dilldown-list',
  templateUrl: './dilldown-list.component.html',
  styleUrl: './dilldown-list.component.scss',
  animations: [slideLeftAnimation, newListAnimation]
})
export class DilldownListComponent {
  
}
