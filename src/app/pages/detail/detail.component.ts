import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
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
  public titlePage = '';
  public kpis: KPI[] = [];
  public error!: string;
  public chartYearsData: number[] = [];
  public chartMedalsData: number[] = [];

  private route = inject(ActivatedRoute);
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
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.titlePage = data.title;
            this.kpis = data.kpis;
            this.chartYearsData = data.chartData.years;
            this.chartMedalsData = data.chartData.medals;
          } else {
            this.error = 'Data not found for this country.';
            // TODO: Gérer la redirection vers /not-found
          }
        },
        error: (err) => {
          this.error = err.message;
          // TODO: Gérer la redirection vers /not-found
        },
      });
  }
}
