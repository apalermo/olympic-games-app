import { Component, effect, input } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-country-card',
  standalone: true,
  templateUrl: './country-card.component.html',
  styleUrl: './country-card.component.scss',
})
export class CountryCardComponent {
  public years = input<number[]>();
  public medals = input<number[]>();
  public lineChart!: Chart<'line', number[], number>;
  constructor() {
    effect(() => {
      const currentYears: number[] = this.years() || [];
      const currentMedals: number[] = this.medals() || [];

      if (this.lineChart && currentYears && currentMedals) {
        this.lineChart.data.labels = currentYears;
        this.lineChart.data.datasets[0].data = currentMedals;
        this.lineChart.update();
      } else if (currentYears && currentMedals && currentYears.length > 0) {
        this.buildChart(currentYears, currentMedals);
      }
    });
  }

  buildChart(years: number[], medals: number[]) {
    const lineChart = new Chart('countryChart', {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'medals',
            data: medals,
            backgroundColor: '#0b868f',
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
    this.lineChart = lineChart;
  }
}
