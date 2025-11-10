import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';
import { KPI } from '../models/KPI';

// "ViewModel" propre que le Dashboard recevra
export interface DashboardData {
  kpis: KPI[];
  chartData: {
    countries: string[];
    sumOfMedals: number[];
    countryIds: number[];
  };
}

// "ViewModel" propre que le Detail recevra
export interface DetailData {
  title: string;
  kpis: KPI[];
  chartData: {
    years: number[];
    medals: number[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private http = inject(HttpClient);
  private olympicUrl = './assets/mock/olympic.json';

  private olympics$ = this.http.get<Olympic[]>(this.olympicUrl).pipe(
    catchError(() => {
      return throwError(
        () => new Error('Failed to load data; please try again later.')
      );
    }),
    shareReplay(1) // mise en cache ( penser à gérer le refresh quand on pointera sur une vraie API )
  );

  /**
   * Retourne les données brutes
   */
  getOlympic(): Observable<Olympic[]> {
    return this.olympics$;
  }

  /**
   * Retourne les données précalculées pour le dashboard
   */
  getDashboardData(): Observable<DashboardData> {
    return this.olympics$.pipe(
      map((data: Olympic[]) => {
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
          i.participations.reduce((acc, p) => acc + p.medalsCount, 0)
        );

        return {
          kpis: kpis,
          chartData: {
            countries: countries,
            sumOfMedals: sumOfMedals,
            countryIds: countryIds,
          },
        };
      })
    );
  }

  /**
   * Retourne les données précalculée pour la page Détail
   */
  getDetailData(countryId: number): Observable<DetailData | null> {
    return this.olympics$.pipe(
      map((data: Olympic[]) => {
        const selectedCountry = data.find((i) => i.id === countryId);

        if (!selectedCountry) {
          return null; // Gère le cas où l'ID est invalide
        }

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
      })
    );
  }
}
