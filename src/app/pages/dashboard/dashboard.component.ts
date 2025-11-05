import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DataService } from 'src/app/services/data.service';
import { MedalChartComponent } from 'src/app/components/medal-chart/medal-chart.component';
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
  public error!: string; // pour gestion des erreurs ( à implémenter )
  public sumOfAllMedalsYears: number[] = [];
  public titlePage = 'Medals per Country';
  public kpis: KPI[] = [];
  public countries: string[] = [];
  public countryIds: number[] = [];

  ngOnInit() {
    this.dataService.getDashboardData().subscribe({
      next: (data) => {
        this.kpis = data.kpis;
        this.countries = data.chartData.countries;
        this.sumOfAllMedalsYears = data.chartData.sumOfMedals;
        this.countryIds = data.chartData.countryIds;
      },
    });
  }
}
