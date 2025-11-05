import { Component, inject, input, effect } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-medal-chart',
  standalone: true,
  imports: [],
  templateUrl: './medal-chart.component.html',
  styleUrl: './medal-chart.component.scss',
})
export class MedalChartComponent {
  private router = inject(Router);

  countries = input<string[]>([]);
  sumOfAllMedalsYears = input<number[]>([]);
  countryIds = input<number[]>([]);

  public pieChart!: Chart<'pie', number[], string>;

  constructor() {
    effect(() => {
      const countries = this.countries();
      const medals = this.sumOfAllMedalsYears();

      if (countries.length && medals.length) {
        this.buildPieChart(countries, medals);
      }
    });
  }

  buildPieChart(countries: string[], sumOfAllMedalsYears: number[]) {
    const pieChart = new Chart('dashboardPieChart', {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [
          {
            label: 'Medals',
            data: sumOfAllMedalsYears,
            backgroundColor: [
              '#0b868f',
              '#adc3de',
              '#7a3c53',
              '#8f6263',
              'orange',
              '#94819d',
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
        onClick: (e) => {
          if (e.native) {
            const points = pieChart.getElementsAtEventForMode(
              e.native,
              'point',
              { intersect: true },
              true
            );
            if (points.length) {
              const firstPoint = points[0];

              const countryId = this.countryIds()[firstPoint.index];

              if (countryId) {
                this.router.navigate(['country', countryId]);
              }
            }
          }
        },
      },
    });
    this.pieChart = pieChart;
  }
}
