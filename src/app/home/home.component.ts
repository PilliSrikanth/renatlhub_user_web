
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HostelService } from '../hostel.service';
import { HostelPageService } from '../hostel-page.service';
import { Router } from '@angular/router';

interface Hostel {
  _id: string;
  name: string;
  type: string;
  area?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  image?: string;
  images?: string[];
  rating?: number;
  avgRating?: number;
  reviewCount?: number;
  location?: {
    coordinates?: number[];
    type?: string;
  };
  [key: string]: any;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  // Only show properties within this distance.
  private readonly SEARCH_RADIUS_KM = 10;

  currentPlace = 'Detecting location...';
  locationLoading = false;
  locationError = '';

  userLat = 0;
  userLng = 0;
  locationDetected = false;

  categories: string[] = ['boys', 'girls', 'room'];
  selectedCategory = 'boys';

  hostels: Hostel[] = [];
  NearbyHostels: Hostel[] = [];
  topHostels: Hostel[] = [];

  searchText = '';
  ratings: any[] = [];

  private allHostels: Hostel[] = [];
  private searchResults: Hostel[] | null = null;

  bannerImages: string[] = [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200'
  ];

  currentIndex = 0;
  intervalId: ReturnType<typeof setInterval> | null = null;

  favorites: Hostel[] = this.loadFavorites();

  constructor(
    private hostelService: HostelService,
    private hostelpage: HostelPageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.startAutoSlide();
    this.getLocation();
  }

  // Safely read favorites from localStorage.
  private loadFavorites(): Hostel[] {
    try {
      const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  // Detect the user's current location.
  getLocation(): void {
    if (this.locationLoading) {
      return;
    }

    if (!navigator.geolocation) {
      this.currentPlace = 'Location unavailable';
      this.locationError = 'Your browser does not support location.';
      this.clearProperties();
      return;
    }

    this.locationLoading = true;
    this.locationError = '';

    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        this.userLat = position.coords.latitude;
        this.userLng = position.coords.longitude;
        this.locationDetected = true;

        // Load and filter properties using the detected coordinates.
        this.loadAllHostels();
        this.getTopRatedHostels();

        try {
          const params = new URLSearchParams({
            latitude: String(this.userLat),
            longitude: String(this.userLng),
            localityLanguage: 'en'
          });

          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`
          );

          if (!response.ok) {
            throw new Error('Unable to look up your address.');
          }

          const data = await response.json();

          const locality =
            data.locality ||
            data.localityInfo?.administrative?.find(
              (item: any) =>
                /city|town|village|suburb|neighborhood/i.test(
                  item.description || item.name || ''
                )
            )?.name;

          const city =
            data.city ||
            data.principalSubdivision ||
            data.localityInfo?.administrative?.[0]?.name;

          const parts = [locality, city]
            .filter((value: any) => value && String(value).trim())
            .map((value: any) => String(value).trim());

          const uniqueParts = parts.filter(
            (value: string, index: number) =>
              parts.findIndex(
                (part: string) =>
                  part.toLowerCase() === value.toLowerCase()
              ) === index
          );

          this.currentPlace = uniqueParts.length
            ? uniqueParts.join(', ')
            : 'Current location detected';
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          this.currentPlace = 'Location detected';
          this.locationError =
            'Could not get the area name. Nearby properties can still be shown.';
        } finally {
          this.locationLoading = false;
        }
      },
      (error: GeolocationPositionError) => {
        console.error('Geolocation error:', error);
        this.locationLoading = false;
        this.locationDetected = false;
        this.clearProperties();

        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.currentPlace = 'Location permission needed';
            this.locationError =
              'Allow location access in your browser settings, then refresh location.';
            break;

          case error.POSITION_UNAVAILABLE:
            this.currentPlace = 'Location unavailable';
            this.locationError =
              'Your device could not determine your location.';
            break;

          case error.TIMEOUT:
            this.currentPlace = 'Location timed out';
            this.locationError =
              'The location request timed out. Please try again.';
            break;

          default:
            this.currentPlace = 'Your Location';
            this.locationError = 'Unable to detect your location.';
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  }

  // Clear lists when the user's location is unavailable.
  private clearProperties(): void {
    this.allHostels = [];
    this.hostels = [];
    this.NearbyHostels = [];
    this.topHostels = [];
  }

  // Get coordinates from supported hostel data formats.
  private getHostelCoordinates(
    hostel: Hostel
  ): { lat: number; lng: number } | null {
    const geoCoordinates = hostel.location?.coordinates;

    // GeoJSON coordinates are [longitude, latitude].
    if (
      Array.isArray(geoCoordinates) &&
      geoCoordinates.length >= 2
    ) {
      const lng = Number(geoCoordinates[0]);
      const lat = Number(geoCoordinates[1]);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        return { lat, lng };
      }
    }

    const lat = Number(hostel.lat ?? hostel.latitude);
    const lng = Number(hostel.lng ?? hostel.longitude);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      (hostel.lat != null ||
        hostel.latitude != null) &&
      (hostel.lng != null ||
        hostel.longitude != null) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      return { lat, lng };
    }

    return null;
  }

  // Calculate distance between two coordinates in kilometres.
  getDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const earthRadiusKm = 6371;

    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) ** 2;

    const safeA = Math.min(1, Math.max(0, a));

    return earthRadiusKm *
      2 *
      Math.atan2(Math.sqrt(safeA), Math.sqrt(1 - safeA));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Check category, distance and search text.
  private filterProperties(list: Hostel[]): Hostel[] {
    if (!this.locationDetected) {
      return [];
    }

    const query = this.searchText.trim().toLowerCase();

    return list.filter((hostel: Hostel) => {
      if (
        String(hostel.type || '').toLowerCase() !==
        this.selectedCategory.toLowerCase()
      ) {
        return false;
      }

      const coordinates = this.getHostelCoordinates(hostel);

      // Do not display listings without valid coordinates.
      if (!coordinates) {
        return false;
      }

      const distance = this.getDistanceKm(
        this.userLat,
        this.userLng,
        coordinates.lat,
        coordinates.lng
      );

      if (distance > this.SEARCH_RADIUS_KM) {
        return false;
      }

      if (query) {
        const searchableText = [
          hostel.name,
          hostel.area,
          hostel.address,
          hostel.type
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  // Load property records, then show only listings near the user.
  loadAllHostels(): void {
    if (!this.locationDetected) {
      this.hostels = [];
      this.NearbyHostels = [];
      return;
    }

    this.hostelService.getAllHostels().subscribe({
      next: (res: any) => {
        const list: Hostel[] = Array.isArray(res)
          ? res
          : (res?.data || res?.hostels || []);

        this.allHostels = list;

        this.updatePropertyLists();
      },
      error: (error: any) => {
        console.error('Error loading hostels:', error);
        this.allHostels = [];
        this.hostels = [];
        this.NearbyHostels = [];
      }
    });
  }

  // Load top-rated listings and apply the same distance limit.
  getTopRatedHostels(): void {
    if (!this.locationDetected) {
      this.topHostels = [];
      return;
    }

    this.hostelService.getTopRated().subscribe({
      next: (res: any) => {
        const list: Hostel[] = Array.isArray(res)
          ? res
          : (res?.data || res?.hostels || []);

        const nearby = this.filterProperties(list);

        this.topHostels = nearby
          .sort(
            (a, b) =>
              Number(b.avgRating ?? b.rating ?? 0) -
              Number(a.avgRating ?? a.rating ?? 0)
          )
          .slice(0, 6);
      },
      error: (error: any) => {
        console.error('Error loading top-rated hostels:', error);
        this.topHostels = [];
      }
    });
  }

  // Update nearby and main property lists.
  private updatePropertyLists(): void {
    const source = this.searchResults ?? this.allHostels;
    const filtered = this.filterProperties(source);

    // Main property grid: nearby properties only.
    this.hostels = filtered;

    // Nearby section: show the closest six properties.
    this.NearbyHostels = [...filtered]
      .sort((a, b) => this.distanceFromUser(a) - this.distanceFromUser(b))
      .slice(0, 6);

    // Keep top-rated results restricted to the selected category
    // and current location.
    if (this.searchText.trim()) {
      this.topHostels = this.topHostels.filter(item =>
        filtered.some(match => match._id === item._id)
      );
    }
  }

  private distanceFromUser(hostel: Hostel): number {
    const coordinates = this.getHostelCoordinates(hostel);

    if (!coordinates) {
      return Number.POSITIVE_INFINITY;
    }

    return this.getDistanceKm(
      this.userLat,
      this.userLng,
      coordinates.lat,
      coordinates.lng
    );
  }

  // Category selection.
  filterByCategory(type: string): void {
    this.selectedCategory = type;
    this.searchResults = null;

    if (!this.locationDetected) {
      this.getLocation();
      return;
    }

    this.updatePropertyLists();
    this.getTopRatedHostels();
  }

  // Search within the selected category and 10 km radius.
  onSearch(): void {
    this.searchResults = null;

    if (!this.locationDetected) {
      this.clearProperties();
      this.locationError =
        'Enable location access to search properties near you.';
      return;
    }

    // Filter the available property records immediately.
    this.updatePropertyLists();

    // If the user typed a query, also use the existing search endpoint
    // to find matching records not present in the initial property list.
    const query = this.searchText.trim();

    if (!query) {
      this.getTopRatedHostels();
      return;
    }

    this.hostelService
      .searchHostelsByArea(query, this.selectedCategory)
      .subscribe({
        next: (res: any) => {
          const results: Hostel[] = Array.isArray(res)
            ? res
            : (res?.data || res?.hostels || []);

          this.searchResults = results;
          this.updatePropertyLists();

          this.topHostels = this.topHostels.filter(item =>
            this.hostels.some(match => match._id === item._id)
          );
        },
        error: (error: any) => {
          console.error('Search error:', error);
          // Keep the locally filtered results if the API search fails.
          this.updatePropertyLists();
        }
      });
  }

  // Open property details.
  openHostel(id: string): void {
    if (id) {
      this.router.navigate(['/hostel', id]);
    }
  }

  // Load reviews when needed.
  loadReviews(id: string | null): void {
    if (!id) {
      return;
    }

    this.hostelpage.getHostelReviews(id).subscribe({
      next: (res: any) => {
        this.ratings = res?.data || res?.reviews || [];
      },
      error: (error: any) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  // Banner carousel.
  startAutoSlide(): void {
    this.stopAutoSlide();

    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    if (this.bannerImages.length) {
      this.currentIndex =
        (this.currentIndex + 1) % this.bannerImages.length;
    }
  }

  prevSlide(): void {
    if (this.bannerImages.length) {
      this.currentIndex =
        (this.currentIndex - 1 + this.bannerImages.length) %
        this.bannerImages.length;
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.bannerImages.length) {
      this.currentIndex = index;
    }
  }

  // Favorites.
  toggleFavorite(hostel: Hostel): void {
    const index = this.favorites.findIndex(
      item => item._id === hostel._id
    );

    if (index >= 0) {
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push(hostel);
    }

    try {
      localStorage.setItem(
        'favorites',
        JSON.stringify(this.favorites)
      );
    } catch (error) {
      console.error('Could not save favorites:', error);
    }
  }

  isFavorite(id: string): boolean {
    return this.favorites.some(item => item._id === id);
  }

  private stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }
}
