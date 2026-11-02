import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HostelService {

  baseUrl = "http://localhost:3200/api/hostels/";

  constructor(private http: HttpClient) { }

  getAllHostels(): Observable<any> {
    return this.http.get(this.baseUrl + "all");
  }

  getHostelById(id: any): Observable<any> {
    return this.http.get(this.baseUrl + id);
  }

  getTopRated(): Observable<any> {
    return this.http.get(this.baseUrl + "top-rated");
  }

  // Search hostels by area with optional category/type filter
  searchHostelsByArea(area: string, type?: string): Observable<any> {
    let url = `${this.baseUrl}search?area=${area}`;
    if (type) {
      url += `&type=${type}`;
    }
    return this.http.get(url);
  }

  // Nearby hostels with optional category filter
  getNearby(lat: number, lng: number, type?: string): Observable<any> {
    let url = `${this.baseUrl}nearby?lat=${lat}&lng=${lng}`;
    if (type) {
      url += `&type=${type}`;
    }
    return this.http.get(url);
  }

  // Nearby top-rated hostels with optional category filter
  getNearbyTop(lat: number, lng: number, type?: string): Observable<any> {
    let url = `${this.baseUrl}nearby/top-rated?lat=${lat}&lng=${lng}`;
    if (type) {
      url += `&type=${type}`;
    }
    return this.http.get(url);
  }

  // Filter hostels by category/type
  filterHostels(type: string): Observable<any> {
    return this.http.get(`${this.baseUrl}filter?type=${type}`);
  }

}
