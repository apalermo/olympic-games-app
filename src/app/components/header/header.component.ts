import { Component, Input } from '@angular/core';
import { KPI } from 'src/app/models/KPI';

@Component({
  selector: 'app-header-component',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() title = '';
  @Input() kpis: KPI[] = [];
}
