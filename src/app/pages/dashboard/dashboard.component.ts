import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DashboardData, DataService } from 'src/app/services/data.service';
import { MedalChartComponent } from 'src/app/components/medal-chart/medal-chart.component';
import { KPI } from 'src/app/models/KPI';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';

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
  public isLoading = true;
  public errorMsg = '';
  public isEmpty = false;
  public sumOfAllMedalsYears: number[] = [];
  public titlePage = 'Medals per Country';
  public kpis: KPI[] = [];
  public countries: string[] = [];
  public countryIds: number[] = [];

  ngOnInit() {
    this.data$ = this.dataService.getDashboardData().pipe(
      catchError((err) => {
        // Si le service jette une erreur, on l'attrape
        this.errorMsg = err.message || 'An unknown error occurred';
        return of(null); // On retourne un observable 'null' pour que l'UI réagisse
      })
    );
  }
}
