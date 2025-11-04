import { AfterViewInit, Component, effect, input } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-country-card',
  standalone: true,
  imports: [],
  templateUrl: './country-card.component.html',
  styleUrl: './country-card.component.scss',
})
export class CountryCardComponent implements AfterViewInit {
  public years = input<number[]>();
  public medals = input<string[]>();
  public lineChart!: Chart<'line', string[], number>;
  constructor() {
    effect(() => {
      const currentYears = this.years();
      const currentMedals = this.medals();

      if (this.lineChart && currentYears && currentMedals) {
        this.lineChart.data.labels = currentYears;
        this.lineChart.data.datasets[0].data = currentMedals;
        this.lineChart.update();
      }
    });
  }

  ngAfterViewInit(): void {
    const currentYears = this.years();
    const currentMedals = this.medals();

    if (currentYears && currentMedals && currentYears.length > 0) {
      this.buildChart(currentYears, currentMedals);
    }
  }
  buildChart(years: number[], medals: string[]) {
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
