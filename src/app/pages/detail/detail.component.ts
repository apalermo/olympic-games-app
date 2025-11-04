import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CountryCardComponent } from 'src/app/components/country-card/country-card.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Olympic } from 'src/app/models/Olympic';
import { Participation } from 'src/app/models/Participation';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  standalone: true,
  imports: [HeaderComponent, CountryCardComponent],
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  public titlePage = '';
  public totalEntries = 0;
  public totalMedals = 0;
  public totalAthletes = 0;
  public error!: string;
  public chartYearsData: number[] = [];
  public chartMedalsData: number[] = [];

  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  ngOnInit() {
    let countryName: string | null = null;
    this.route.paramMap.subscribe(
      (param: ParamMap) => (countryName = param.get('countryName'))
    );
    this.dataService
      .getOlympic()
      .pipe()
      .subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            const selectedCountry = data.find(
              (i: Olympic) => i.country === countryName
            );
            this.titlePage = selectedCountry?.country || '';
            const participations = selectedCountry?.participations.map(
              (i: Participation) => i
            );
            this.totalEntries = participations?.length ?? 0;
            const years =
              selectedCountry?.participations.map(
                (i: Participation) => i.year
              ) ?? [];
            const medals =
              selectedCountry?.participations.map(
                (i: Participation) => i.medalsCount
              ) ?? [];
            this.totalMedals = medals.reduce(
              (accumulator: number, item: number) => accumulator + item,
              0
            );
            const nbAthletes =
              selectedCountry?.participations.map(
                (i: Participation) => i.athleteCount
              ) ?? [];
            this.totalAthletes = nbAthletes.reduce(
              (accumulator: number, item: number) => accumulator + item,
              0
            );
            this.chartYearsData = years;
            this.chartMedalsData = medals;
          }
        },
        error: (error) => {
          this.error = error.message;
        },
      });
  }
}
