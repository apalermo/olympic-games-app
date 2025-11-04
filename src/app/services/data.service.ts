import { inject, Injectable } from '@angular/core';
import { Olympic } from '../models/Olympic';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private http = inject(HttpClient);
  private olympicUrl = './assets/mock/olympic.json';

  getOlympic(): Observable<Olympic[]> {
    return this.http.get<Olympic[]>(this.olympicUrl);
  }
}
