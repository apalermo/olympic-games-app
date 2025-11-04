import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DataService } from 'src/app/services/data.service';
import { MedalChartComponent } from 'src/app/components/medal-chart/medal-chart.component';
import { Olympic } from 'src/app/models/Olympic';
import { Participation } from 'src/app/models/Participation';
import { KPI } from 'src/app/models/KPI';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [HeaderComponent, MedalChartComponent],
})
export class DashboardComponent implements OnInit {
  private dataService = inject(DataService);
  public totalCountries = 0;
  public totalJOs = 0;
  public error!: string;
  public sumOfAllMedalsYears: number[] = [];
  public titlePage = 'Medals per Country';
  public kpis: KPI[] = [];
  public countries: string[] = [];

  ngOnInit() {
    this.dataService
      .getOlympic()
      .pipe()
      .subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.totalJOs = Array.from(
              new Set(
                data
                  .map((i: Olympic) =>
                    i.participations.map((f: Participation) => f.year)
                  )
                  .flat()
              )
            ).length;
            this.kpis.push({
              label: 'Number of JOs',
              value: this.totalJOs,
            });
            this.countries = data.map((i: Olympic) => i.country);
            this.totalCountries = this.countries.length;
            this.kpis.push({
              label: 'Number of Countries',
              value: this.totalCountries,
            });
            const medals = data.map((i: Olympic) =>
              i.participations.map((i: Participation) => i.medalsCount)
            );
            this.sumOfAllMedalsYears = medals.map((i) =>
              i.reduce((acc: number, i: number) => acc + i, 0)
            );
          }
        },
        error: (error) => {
          this.error = error.message;
        },
      });
  }
}
