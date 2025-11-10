import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DashboardData, DataService } from 'src/app/services/data.service';
import { MedalChartComponent } from 'src/app/components/medal-chart/medal-chart.component';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Olympic } from 'src/app/models/Olympic';
import { Participation } from 'src/app/models/Participation';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [HeaderComponent, MedalChartComponent, AsyncPipe],
})
export class DashboardComponent implements OnInit {
  private dataService = inject(DataService);
  public data$!: Observable<DashboardData | null>;
  public errorMsg = '';
  public titlePage = 'Medals per Country';

  ngOnInit() {
    this.data$ = this.dataService.getOlympics().pipe(
      map((rawData: Olympic[]) => {
        return this.formatDashboard(rawData);
      }),

      catchError((err) => {
        this.errorMsg = err.message || 'An unknown error occurred';
        return of(null);
      })
    );
  }

  /**
   * formatte les données pour le dashboard
   */
  private formatDashboard(data: Olympic[]): DashboardData {
    const totalJOs = Array.from(
      new Set(data.map((i) => i.participations.map((f) => f.year)).flat())
    ).length;
    const totalCountries = data.length;
    const kpis = [
      { label: 'Number of JOs', value: totalJOs },
      { label: 'Number of Countries', value: totalCountries },
    ];

    const countries = data.map((i) => i.country);
    const countryIds = data.map((i) => i.id);
    const sumOfMedals = data.map((i) =>
      i.participations.reduce(
        (acc: number, p: Participation) => acc + p.medalsCount,
        0
      )
    );

    return {
      kpis: kpis,
      chartData: {
        countries: countries,
        sumOfMedals: sumOfMedals,
        countryIds: countryIds,
      },
    };
  }
}
