import { Component, input } from '@angular/core';
import { KPI } from 'src/app/models/KPI';

@Component({
  selector: 'app-header-component',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public title = input<string>();
  public kpis = input<KPI[]>([]);
}
