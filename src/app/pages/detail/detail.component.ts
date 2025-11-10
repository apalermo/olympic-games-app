import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CountryCardComponent } from 'src/app/components/country-card/country-card.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { KPI } from 'src/app/models/KPI';
import { Olympic } from 'src/app/models/Olympic';
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
    const countryId = Number(this.route.snapshot.params['id']);
    this.dataService.getOlympicById(countryId).subscribe({
      next: (country: Olympic) => {
        this.isLoading = false;
        const detailData = this.formatDetail(country);
        this.titlePage = detailData.title;
        this.kpis = detailData.kpis;
        this.chartYearsData = detailData.chartData.years;
        this.chartMedalsData = detailData.chartData.medals;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['not-found']);
      },
    });
  }

  /**
   * formatte les données pour le detail
   */
  private formatDetail(selectedCountry: Olympic) {
    const participations = selectedCountry.participations;
    const totalEntries = participations.length;
    const totalMedals = participations.reduce(
      (acc, p) => acc + p.medalsCount,
      0
    );
    const totalAthletes = participations.reduce(
      (acc, p) => acc + p.athleteCount,
      0
    );

    const kpis = [
      { label: 'Number of entries', value: totalEntries },
      { label: 'Total Number of medals', value: totalMedals },
      { label: 'Total Number of athletes', value: totalAthletes },
    ];

    const years = participations.map((i) => i.year);
    const medals = participations.map((i) => i.medalsCount);

    return {
      title: selectedCountry.country,
      kpis: kpis,
      chartData: {
        years: years,
        medals: medals,
      },
    };
  }
}
