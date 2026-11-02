import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import { HostelService } from '../hostel.service';
import { HostelPageService } from '../hostel-page.service';

@Component({
  selector: 'app-hostel-page',
  templateUrl: './hostel-page.component.html',
  styleUrls: ['./hostel-page.component.css']
})
export class HostelPageComponent implements OnInit, OnDestroy {

  hostel: any = null;
  ratings: any[] = [];

  ownerId = '';
  userId = localStorage.getItem('userId') || '';

  selectedSharing = '';

  sharingTypes = [
    { label: '2', mediaKey: '2', dataKey: 'twoSharing' },
    { label: '3', mediaKey: '3', dataKey: 'threeSharing' },
    { label: '4', mediaKey: '4', dataKey: 'fourSharing' },
    { label: '5', mediaKey: '5', dataKey: 'fiveSharing' },
    { label: '6', mediaKey: '6', dataKey: 'sixSharing' }
  ];

  BASE_URL = 'http://localhost:3200';

  mainImage = 'assets/no-image.png';
  currentImages: string[] = [];
  currentIndex = 0;
  showCarousel = false;

  reviewText = '';
  reviewRating = 5;
  showAllComments = false;
  expandedComment: number | null = null;

  bannerImages: string[] = [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200'
  ];

  bannerIndex = 0;
  intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    private hostelService: HostelService,
    private hostelpage: HostelPageService,
    private router: Router,
    private location: Location,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';

    const hostelId = this.route.snapshot.paramMap.get('id');

    if (!hostelId) {
      console.error('Hostel ID not found in route');
      return;
    }

    this.loadHostel(hostelId);
    this.loadReviews(hostelId);
    this.startAutoSlide();
  }

  // GET VALID HOSTEL GPS COORDINATES
  getHostelCoordinates(): { lat: number; lng: number } | null {
    const h = this.hostel;

    if (!h) {
      return null;
    }

    // GeoJSON coordinates are stored as [longitude, latitude].
    const coordinates = h.location?.coordinates;

    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      const lng = Number(coordinates[0]);
      const lat = Number(coordinates[1]);

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

    const rawLat =
      h.lat ??
      h.latitude ??
      h.location?.lat ??
      h.location?.latitude;

    const rawLng =
      h.lng ??
      h.longitude ??
      h.location?.lng ??
      h.location?.longitude;

    if (
      rawLat === null ||
      rawLat === undefined ||
      rawLng === null ||
      rawLng === undefined ||
      rawLat === '' ||
      rawLng === ''
    ) {
      return null;
    }

    const lat = Number(rawLat);
    const lng = Number(rawLng);

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

    return null;
  }

  // GET FULL HOSTEL ADDRESS
  getHostelAddress(): string {
    const h = this.hostel;
    const address = h?.address;

    if (typeof address === 'string' && address.trim()) {
      return address.trim();
    }

    if (address && typeof address === 'object') {
      const parts = [
        address.addressLine,
        address.street,
        address.area,
        address.city,
        address.district,
        address.state,
        address.pincode,
        address.zipCode
      ];

      const result = parts
        .filter(
          (part: any) =>
            part !== null &&
            part !== undefined &&
            String(part).trim()
        )
        .map((part: any) => String(part).trim())
        .join(', ');

      if (result) {
        return result;
      }
    }

    const locationText =
      typeof h?.location === 'string' ? h.location : '';

    return [
      locationText,
      h?.area,
      h?.city,
      h?.district,
      h?.state,
      h?.pincode
    ]
      .filter(
        (part: any) =>
          part !== null &&
          part !== undefined &&
          String(part).trim()
      )
      .map((part: any) => String(part).trim())
      .join(', ');
  }

  // GOOGLE MAP EMBED URL
  getMapUrl(): SafeResourceUrl {
    const coords = this.getHostelCoordinates();

    const query = coords
      ? `${coords.lat},${coords.lng}`
      : this.getHostelAddress();

    const mapUrl =
      'https://maps.google.com/maps?q=' +
      encodeURIComponent(query) +
      '&z=17&output=embed';

    return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  // GOOGLE MAPS DIRECTIONS
  getGoogleMapsUrl(): string {
    const coords = this.getHostelCoordinates();

    const destination = coords
      ? `${coords.lat},${coords.lng}`
      : this.getHostelAddress();

    return (
      'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent(destination)
    );
  }

  // LOAD HOSTEL DATA
  loadHostel(id: string | null): void {
    if (!id) {
      console.error('Hostel ID missing');
      return;
    }

    this.hostelService.getHostelById(id).subscribe({
      next: (res: any) => {
        this.hostel = res?.data || res?.hostel || res;

        console.log('Loaded hostel:', this.hostel);
        console.log('Hostel address:', this.getHostelAddress());
        console.log('Hostel coordinates:', this.getHostelCoordinates());

        const rawOwner = this.hostel?.ownerId;

        if (typeof rawOwner === 'string') {
          this.ownerId = rawOwner.trim();
        } else if (rawOwner && typeof rawOwner === 'object') {
          this.ownerId = String(
            rawOwner._id || rawOwner.id || ''
          ).trim();
        } else {
          this.ownerId = '';
        }

        const keys = Object.keys(
          this.hostel?.sharingMedia || {}
        );

        if (keys.length) {
          const firstAvailable = keys.find(
            key => this.hasAvailableSharing(key)
          );

          this.selectSharing(firstAvailable || keys[0]);
        } else {
          this.currentImages = [];
          this.currentIndex = 0;
          this.mainImage = 'assets/no-image.png';
        }
      },
      error: error => {
        console.error('Error loading hostel:', error);
      }
    });
  }

  hasAvailableSharing(mediaKey: string): boolean {
    const item = this.sharingTypes.find(
      x => x.mediaKey === mediaKey
    );

    if (!item) {
      return false;
    }

    return Number(
      this.hostel?.vacancy?.[item.dataKey] || 0
    ) > 0;
  }

  getSharingImage(mediaKey: string): string {
    const images =
      this.hostel?.sharingMedia?.[mediaKey]?.images || [];

    if (!images.length) {
      return 'assets/no-image.png';
    }

    const image = images[0];

    if (typeof image !== 'string' || !image) {
      return 'assets/no-image.png';
    }

    if (
      image.startsWith('http://') ||
      image.startsWith('https://')
    ) {
      return image;
    }

    return `${this.BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
  }

  setFallbackImage(event: Event): void {
    const img = event.target as HTMLImageElement;

    if (img && !img.src.endsWith('/assets/no-image.png')) {
      img.src = 'assets/no-image.png';
    }
  }

  // REVIEWS
  loadReviews(id: string | null): void {
    if (!id) {
      return;
    }

    this.hostelpage.getHostelReviews(id).subscribe({
      next: (res: any) => {
        this.ratings = res?.data || res?.reviews || [];
      },
      error: error => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  submitReview(): void {
    if (!this.userId) {
      alert('Please login first');
      return;
    }

    if (!this.hostel || !this.reviewText.trim()) {
      alert('Please enter your review.');
      return;
    }

    const reviewData = {
      hostelId: this.hostel._id,
      userId: this.userId,
      rating: this.reviewRating,
      comment: this.reviewText.trim()
    };

    this.hostelpage.addReview(reviewData).subscribe({
      next: () => {
        this.reviewText = '';
        this.reviewRating = 5;
        this.loadReviews(this.hostel._id);
        alert('Review submitted successfully');
      },
      error: error => {
        console.error('Review error:', error);
        alert(
          error?.error?.message ||
          'Unable to submit review'
        );
      }
    });
  }

  toggleComment(index: number): void {
    this.expandedComment =
      this.expandedComment === index ? null : index;
  }

  toggleComments(): void {
    this.showAllComments = !this.showAllComments;
  }

  // ROOM SHARING AND GALLERY
  selectSharing(mediaKey: string): void {
    this.selectedSharing = mediaKey;

    const images =
      this.hostel?.sharingMedia?.[mediaKey]?.images || [];

    this.currentImages = images
      .filter(
        (img: any) =>
          typeof img === 'string' && img.length > 0
      )
      .map((img: string) => {
        if (
          img.startsWith('http://') ||
          img.startsWith('https://')
        ) {
          return img;
        }

        return `${this.BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
      });

    this.currentIndex = 0;
    this.updateMainImage();
  }

  updateMainImage(): void {
    this.mainImage =
      this.currentImages[this.currentIndex] ||
      'assets/no-image.png';
  }

  nextImage(): void {
    if (!this.currentImages.length) {
      return;
    }

    this.currentIndex =
      (this.currentIndex + 1) % this.currentImages.length;

    this.updateMainImage();
  }

  prevImage(): void {
    if (!this.currentImages.length) {
      return;
    }

    this.currentIndex =
      (
        this.currentIndex -
        1 +
        this.currentImages.length
      ) % this.currentImages.length;

    this.updateMainImage();
  }

  openCarousel(): void {
    if (this.currentImages.length) {
      this.showCarousel = true;
    }
  }

  closeCarousel(): void {
    this.showCarousel = false;
  }

  // CHAT WITH OWNER
  contactAdmin(): void {
    const userId = localStorage.getItem('userId') || '';

    if (!userId) {
      alert('Please login first.');
      return;
    }

    if (!this.ownerId) {
      alert('Owner ID is missing. Check the hostel API response.');
      console.error('Hostel data:', this.hostel);
      return;
    }

    this.router.navigate([
      '/admin-user-chat',
      this.ownerId
    ]);
  }

  // SEND HOSTEL REQUEST
  sendRequest(): void {
    this.userId = localStorage.getItem('userId') || '';

    if (!this.userId) {
      alert('Please login first');
      return;
    }

    if (!this.hostel) {
      alert('Hostel details not loaded');
      return;
    }

    if (!this.selectedSharing) {
      alert('Select a sharing option');
      return;
    }

    const rawOwner = this.hostel.ownerId;

    const ownerId =
      typeof rawOwner === 'object' && rawOwner !== null
        ? String(rawOwner._id || rawOwner.id || '')
        : String(rawOwner || '');

    if (!ownerId) {
      alert('Owner ID not available');
      return;
    }

    const requestData = {
      ownerId,
      userId: this.userId,
      hostelId: this.hostel._id,
      senderType: 'user',
      sharingType: this.selectedSharing
    };

    this.hostelpage.sendRequest(requestData).subscribe({
      next: (response: any) => {
        console.log('Request sent:', response);
        alert('Request sent successfully');
      },
      error: error => {
        console.error('Request error:', error);
        alert(
          error?.error?.message ||
          'Unable to send request'
        );
      }
    });
  }

  // BANNER SLIDER
  startAutoSlide(): void {
    this.stopAutoSlide();

    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  nextSlide(): void {
    if (!this.bannerImages.length) {
      return;
    }

    this.bannerIndex =
      (this.bannerIndex + 1) % this.bannerImages.length;
  }

  prevSlide(): void {
    if (!this.bannerImages.length) {
      return;
    }

    this.bannerIndex =
      (
        this.bannerIndex -
        1 +
        this.bannerImages.length
      ) % this.bannerImages.length;
  }

  goToSlide(index: number): void {
    if (
      index >= 0 &&
      index < this.bannerImages.length
    ) {
      this.bannerIndex = index;
    }
  }

  // NAVIGATION AND CLEANUP
  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }
}