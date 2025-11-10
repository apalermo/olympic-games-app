import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, shareReplay } from 'rxjs/operators';
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
  getOlympics(): Observable<Olympic[]> {
    return this.olympics$;
  }

  /**
   * Récupèration d'un pays par ID.
   * Retourne le pays si trouvé.
   * Émet une erreur si non trouvé.
   */
  public getOlympicById(countryId: number): Observable<Olympic> {
    return this.olympics$.pipe(
      map((data: Olympic[]) => data.find((i) => i.id === countryId)),

      mergeMap((selectedCountry: Olympic | undefined) => {
        if (selectedCountry) {
          return of(selectedCountry);
        }

        return throwError(() => new Error(`Invalid country ID`));
      })
    );
  }
}
