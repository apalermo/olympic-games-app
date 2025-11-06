import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink, Router } from '@angular/router';
import { of } from 'rxjs/internal/observable/of';
import { catchError, switchMap, map } from 'rxjs/operators';
import { CountryCardComponent } from 'src/app/components/country-card/country-card.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { KPI } from 'src/app/models/KPI';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  standalone: true,
  imports: [HeaderComponent, CountryCardComponent, RouterLink],
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  // gestion des états
  public isLoading = true;
  public errorMsg: string | null = null;

  public titlePage = '';
  public kpis: KPI[] = [];

  public chartYearsData: number[] = [];
  public chartMedalsData: number[] = [];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((params: ParamMap) => {
          const countryId = params.get('id');
          if (!countryId) {
            throw new Error('Country ID missing or invalid');
          }
          return Number(countryId);
        }),

        switchMap((countryId: number) => {
          return this.dataService.getDetailData(countryId);
        }),
        catchError((err) => {
          this.errorMsg = err.message;
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          if (data) {
            this.titlePage = data.title;
            this.kpis = data.kpis;
            this.chartYearsData = data.chartData.years;
            this.chartMedalsData = data.chartData.medals;
          } else {
            this.router.navigate(['not-found']);
          }
        },
      });
  }
}
