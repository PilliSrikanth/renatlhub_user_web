import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HostelPageService } from 'src/app/hostel-page.service';
import { HostelService } from 'src/app/hostel.service';

interface Hostel {
  _id: string;
  name: string;
  type: string;
  area: string;
  lat?: number; // latitude of hostel
  lng?: number; // longitude of hostel
  address?: string;
  image?: string;
  rating?: number;
  [key: string]: any;
    avgRating?: number;
  reviewCount?: number;
}

@Component({
  selector: 'app-favort',
  templateUrl: './favort.component.html',
  styleUrls: ['./favort.component.css']
})
export class FavortComponent implements OnInit, OnDestroy {

  currentPlace: string = "Your Location";
  categories = ["boys", "girls", "room"];
  selectedCategory: string = "boys";

  hostels: Hostel[] = [];
  NearbyHostels: Hostel[] = [];
  topHostels: Hostel[] = [];

  searchText: string = '';

  userLat: number = 0;
  userLng: number = 0;

    ratings: any[] = [];

  constructor(private hostelService: HostelService,
              private hostelpage: HostelPageService,
              private router: Router) {}

  ngOnInit() {
    this.getLocation();
    this.loadAllHostels();
    this.startAutoSlide();
  }

  loadAllHostels() {
    this.hostelService.getAllHostels().subscribe((res: any) => {
      const allHostels = res.data || res;
      this.hostels = allHostels.filter((h: Hostel) => h.type === this.selectedCategory);
    });
  }

  // Calculate distance between two coordinates (Haversine formula)
  getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI/180);
  }

  getNearbyHostels(lat: number, lng: number) {
    this.userLat = lat;
    this.userLng = lng;

    this.hostelService.getNearby(lat, lng).subscribe((res: any) => {
      const nearby = res.data || res;
      // Filter by category + distance <= 5 km
      this.NearbyHostels = nearby.filter((h: Hostel) => 
        h.type === this.selectedCategory &&
        h.lat && h.lng &&
        this.getDistanceKm(lat, lng, h.lat, h.lng) <= 5
      );
    });
  }

getTopRatedHostels() {
  this.hostelService.getTopRated().subscribe((res: any) => {
    this.topHostels = (res.data || res).filter((h: Hostel) =>
      h.type === this.selectedCategory
    );
  });
}


  filterByCategory(type: string) {
    this.selectedCategory = type;
    this.loadAllHostels();
    this.getNearbyHostels(this.userLat, this.userLng);
    this.getTopRatedHostels();
  }

  onSearch() {
    if (!this.searchText) {
      this.loadAllHostels();
      this.getNearbyHostels(this.userLat, this.userLng);
      this.getTopRatedHostels();
      return;
    }

    this.hostelService.searchHostelsByArea(this.searchText, this.selectedCategory).subscribe((res: any) => {
      this.NearbyHostels = [];
      this.topHostels = [];
      this.hostels = res.data || res;
    });
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.userLat = lat;
        this.userLng = lng;

        this.getNearbyHostels(lat, lng);
        this.getTopRatedHostels();

        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
          .then(r => r.json())
          .then(data => {
            this.currentPlace = data.locality || data.city || data.principalSubdivision || "Your Location";
            this.searchText = this.currentPlace;
          })
          .catch(err => console.error("Reverse geocode error:", err));
      },
      (err) => {
        console.error("Geolocation error:", err);
        this.currentPlace = "Your Location";
      },
      { enableHighAccuracy: true }
    );
  }

  openHostel(id: string) {
    this.router.navigate(['/hostel', id]);
  }

  // rating start  ****

    loadReviews(id: string | null): void {
    if (!id) return;
    this.hostelpage.getHostelReviews(id).subscribe((res: any) => {
      this.ratings = res.data || [];
    });
  }


/*cusrsol*/

  bannerImages: string[] = [
    'https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg?s=1024x1024&w=is&k=20&c=NQtm4v1Uzp2luv-6f3qORcq9pDtz2H56p8g9Xix8cY0=',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200'
  ];

  currentIndex = 0;
  intervalId: any;

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change every 3 seconds
  }

  nextSlide(): void {
    this.currentIndex =
      (this.currentIndex + 1) % this.bannerImages.length;
  }

  prevSlide(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.bannerImages.length) % this.bannerImages.length;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  favorites: any[] = JSON.parse(localStorage.getItem('favorites') || '[]');

toggleFavorite(hostel: any) {
  const index = this.favorites.findIndex(h => h._id === hostel._id);

  if (index !== -1) {
    this.favorites.splice(index, 1);
  } else {
    this.favorites.push(hostel);
  }

  localStorage.setItem('favorites', JSON.stringify(this.favorites));
}

isFavorite(id: string): boolean {
  return this.favorites.some(h => h._id === id);
}

}
