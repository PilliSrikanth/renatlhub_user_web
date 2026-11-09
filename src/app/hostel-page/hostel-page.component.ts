import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { HostelService } from '../hostel.service';
import { HostelPageService } from '../hostel-page.service';

interface SharingType {
  label: string;
  mediaKey: string;
  dataKey: string;
}

interface HostelCoordinates {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-hostel-page',
  templateUrl: './hostel-page.component.html',
  styleUrls: ['./hostel-page.component.css']
})
export class HostelPageComponent implements OnInit, OnDestroy {

  readonly BASE_URL = 'http://localhost:3200';
  readonly FALLBACK_IMAGE = 'data:image/jpeg;base64,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';

  hostel: any = null;
  ratings: any[] = [];

  bannerImages: string[] = [
    '',
    'assets',
    'assets'
  ];

  bannerIndex = 0;
  private bannerInterval: ReturnType<typeof setInterval> | null = null;

  currentImages: string[] = [];
  currentIndex = 0;
  mainImage = this.FALLBACK_IMAGE;
  showCarousel = false;

  sharingTypes: SharingType[] = [
    { label: 'Two', mediaKey: 'twoSharing', dataKey: 'twoSharing' },
    { label: 'Three', mediaKey: 'threeSharing', dataKey: 'threeSharing' },
    { label: 'Four', mediaKey: 'fourSharing', dataKey: 'fourSharing' },
    { label: 'Five', mediaKey: 'fiveSharing', dataKey: 'fiveSharing' },
    { label: 'Six', mediaKey: 'sixSharing', dataKey: 'sixSharing' }
  ];

  selectedSharing = '';

  reviewRating = 5;
  reviewText = '';
  showAllComments = false;
  expandedComment: number | null = null;

  isLoading = false;
  isSubmittingReview = false;
  isSendingRequest = false;

  hostelId = '';
  userId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private sanitizer: DomSanitizer,
    private hostelService: HostelService,
    private hostelpage: HostelPageService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.hostelId = id;
        this.loadHostel(id);
        this.loadReviews(id);
      }
    });

    this.startAutoSlide();
  }

  // --------------------------------------------------
  // PROPERTY TYPE
  // --------------------------------------------------

  get propertyType(): string {
    const value =
      this.hostel?.type ||
      this.hostel?.propertyType ||
      this.hostel?.category ||
      '';

    return String(value).trim().toLowerCase().replace(/[\s-]+/g, '_');
  }

  get isRentalProperty(): boolean {
    return [
      'room',
      'rental',
      'rental_room',
      'rentalroom',
      'rental_property'
    ].includes(this.propertyType);
  }

  get isHostelProperty(): boolean {
    return !this.isRentalProperty;
  }

  get hasSharingOptions(): boolean {
    if (!this.hostel) {
      return false;
    }

    return this.sharingTypes.some(item =>
      this.hasAvailableSharing(item.dataKey)
    );
  }

  get rentalRent(): number | null {
    const value =
      this.hostel?.rent ??
      this.hostel?.pricePerMonth ??
      this.hostel?.monthlyRent ??
      this.hostel?.price;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    const amount = Number(value);
    return Number.isFinite(amount) ? amount : null;
  }

  get rentalFeatures(): string[] {
    const features =
      this.hostel?.features ??
      this.hostel?.amenities ??
      [];

    if (Array.isArray(features)) {
      return features
        .map(item => String(item).trim())
        .filter(Boolean);
    }

    if (typeof features === 'string' && features.trim()) {
      return features
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  get ownerName(): string {
    const owner = this.hostel?.ownerId || this.hostel?.owner;
    return owner?.name || owner?.fullName || 'Property owner';
  }

  get ownerEmail(): string {
    const owner = this.hostel?.ownerId || this.hostel?.owner;
    return owner?.email || 'Not provided';
  }

  get ownerMobile(): string {
    const owner = this.hostel?.ownerId || this.hostel?.owner;
    return owner?.mobile || owner?.phone || owner?.phoneNumber || 'Not provided';
  }

  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return 'Not specified';
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }

  // --------------------------------------------------
  // LOAD PROPERTY
  // --------------------------------------------------

  loadHostel(id: string): void {
    this.isLoading = true;

    this.hostelService.getHostelById(id).subscribe({
      next: (response: any) => {
        const property =
          response?.data ||
          response?.hostel ||
          response?.property ||
          response;

        this.hostel = property;
        this.isLoading = false;

        this.preparePropertyImages();
        this.prepareSharingSelection();
      },
      error: (error: any) => {
        console.error('Unable to load property:', error);
        this.isLoading = false;
      }
    });
  }

  // --------------------------------------------------
  // PROPERTY IMAGES
  // --------------------------------------------------

  private preparePropertyImages(): void {
    if (!this.hostel) {
      this.currentImages = [this.FALLBACK_IMAGE];
      this.mainImage = this.FALLBACK_IMAGE;
      return;
    }

    const images =
      this.hostel.images ||
      this.hostel.photos ||
      this.hostel.propertyImages ||
      [];

    this.currentImages = this.normalizeImages(images);

    if (!this.currentImages.length) {
      this.currentImages = [this.FALLBACK_IMAGE];
    }

    this.currentIndex = 0;
    this.mainImage = this.currentImages[0];
  }

  private normalizeImages(images: any): string[] {
    if (!images) {
      return [];
    }

    const imageArray = Array.isArray(images) ? images : [images];

    return imageArray
      .map((image: any) => {
        const value =
          typeof image === 'string'
            ? image
            : image?.url || image?.path || image?.filename || '';

        return this.getImageUrl(value);
      })
      .filter((url: string) => !!url);
  }

  private getImageUrl(path: string): string {
    if (!path) {
      return '';
    }

    if (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('data:') ||
      path.startsWith('assets/')
    ) {
      return path;
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.BASE_URL}${cleanPath}`;
  }

  setFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image && image.src !== this.FALLBACK_IMAGE) {
      image.src = this.FALLBACK_IMAGE;
    }
  }

  // --------------------------------------------------
  // HOSTEL SHARING
  // --------------------------------------------------

  hasAvailableSharing(dataKey: string): boolean {
    const vacancy = Number(this.hostel?.vacancy?.[dataKey] || 0);
    return vacancy > 0;
  }

  getSharingImage(mediaKey: string): string {
    const media = this.hostel?.sharingMedia?.[mediaKey];

    if (!media) {
      return this.currentImages[0] || this.FALLBACK_IMAGE;
    }

    const images = Array.isArray(media) ? media : media.images || [];
    const normalized = this.normalizeImages(images);

    return normalized[0] || this.currentImages[0] || this.FALLBACK_IMAGE;
  }

  selectSharing(mediaKey: string): void {
    if (!this.hostel) {
      return;
    }

    const sharing = this.sharingTypes.find(
      item => item.mediaKey === mediaKey
    );

    if (!sharing || !this.hasAvailableSharing(sharing.dataKey)) {
      return;
    }

    this.selectedSharing = mediaKey;

    const media = this.hostel?.sharingMedia?.[mediaKey];
    const images = Array.isArray(media) ? media : media?.images || [];

    const normalized = this.normalizeImages(images);

    if (normalized.length) {
      this.currentImages = normalized;
      this.currentIndex = 0;
      this.mainImage = normalized[0];
    }
  }

  private prepareSharingSelection(): void {
    if (!this.isHostelProperty) {
      this.selectedSharing = '';
      return;
    }

    const firstAvailable = this.sharingTypes.find(item =>
      this.hasAvailableSharing(item.dataKey)
    );

    if (firstAvailable) {
      this.selectSharing(firstAvailable.mediaKey);
    } else {
      this.selectedSharing = '';
    }
  }

  // --------------------------------------------------
  // PHOTO GALLERY
  // --------------------------------------------------

  updateMainImage(index: number): void {
    if (!this.currentImages.length) {
      return;
    }

    this.currentIndex =
      (index + this.currentImages.length) % this.currentImages.length;

    this.mainImage = this.currentImages[this.currentIndex];
  }

  nextImage(): void {
    this.updateMainImage(this.currentIndex + 1);
  }

  prevImage(): void {
    this.updateMainImage(this.currentIndex - 1);
  }

  openCarousel(): void {
    if (this.currentImages.length) {
      this.showCarousel = true;
    }
  }

  closeCarousel(): void {
    this.showCarousel = false;
  }

  // --------------------------------------------------
  // ADDRESS AND MAP
  // --------------------------------------------------

  getHostelAddress(): string {
    const address = this.hostel?.address;

    if (typeof address === 'string') {
      return address.trim();
    }

    if (address && typeof address === 'object') {
      return [
        address.houseNo,
        address.street,
        address.area,
        address.landmark,
        address.city,
        address.state,
        address.pincode
      ]
        .filter(Boolean)
        .join(', ');
    }

    return [
      this.hostel?.area,
      this.hostel?.city,
      this.hostel?.state,
      this.hostel?.pincode
    ]
      .filter(Boolean)
      .join(', ');
  }

  getHostelCoordinates(): HostelCoordinates | null {
    const location = this.hostel?.location;

    // GeoJSON format: [longitude, latitude]
    if (
      location?.coordinates &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length >= 2
    ) {
      const lng = Number(location.coordinates[0]);
      const lat = Number(location.coordinates[1]);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }

    const lat = Number(
      this.hostel?.latitude ??
      this.hostel?.lat ??
      location?.lat
    );

    const lng = Number(
      this.hostel?.longitude ??
      this.hostel?.lng ??
      location?.lng
    );

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      (lat !== 0 || lng !== 0)
    ) {
      return { lat, lng };
    }

    return null;
  }

  getMapUrl(): SafeResourceUrl {
    const coords = this.getHostelCoordinates();

    const query = coords
      ? `${coords.lat},${coords.lng}`
      : this.getHostelAddress();

    const url =
      `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getGoogleMapsUrl(): string {
    const coords = this.getHostelCoordinates();

    const destination = coords
      ? `${coords.lat},${coords.lng}`
      : this.getHostelAddress();

    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  }

  // --------------------------------------------------
  // REVIEWS
  // --------------------------------------------------

  loadReviews(id: string): void {
    this.hostelpage.getHostelReviews(id).subscribe({
      next: (response: any) => {
        this.ratings =
          response?.reviews ||
          response?.data ||
          response ||
          [];

        if (!Array.isArray(this.ratings)) {
          this.ratings = [];
        }
      },
      error: (error: any) => {
        console.error('Unable to load reviews:', error);
        this.ratings = [];
      }
    });
  }

  submitReview(): void {
    if (!this.userId) {
      alert('Please login to submit a review.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.reviewText.trim()) {
      alert('Please enter your review.');
      return;
    }

    if (!this.hostel?._id) {
      alert('Property information is not available.');
      return;
    }

    const reviewData = {
      hostelId: this.hostel._id,
      userId: this.userId,
      rating: this.reviewRating,
      comment: this.reviewText.trim()
    };

    this.isSubmittingReview = true;

    this.hostelpage.addReview(reviewData).subscribe({
      next: () => {
        this.reviewText = '';
        this.reviewRating = 5;
        this.isSubmittingReview = false;
        this.loadReviews(this.hostel._id);
        alert('Your review has been submitted successfully.');
      },
      error: (error: any) => {
        console.error('Review submission failed:', error);
        this.isSubmittingReview = false;
        alert(error?.error?.message || 'Unable to submit your review.');
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

  // --------------------------------------------------
  // CONTACT OWNER
  // --------------------------------------------------

  contactAdmin(): void {
    if (!this.userId) {
      alert('Please login to message the property owner.');
      this.router.navigate(['/login']);
      return;
    }

    const owner = this.hostel?.ownerId || this.hostel?.owner;
    const ownerId =
      typeof owner === 'object'
        ? owner?._id || owner?.id
        : owner;

    if (!ownerId) {
      alert('Owner information is not available.');
      return;
    }

    this.router.navigate(['/admin-user-chat', ownerId]);
  }

  // --------------------------------------------------
  // SEND PROPERTY REQUEST
  // --------------------------------------------------

  sendRequest(): void {
    if (!this.userId) {
      alert('Please login to send a request.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.hostel?._id) {
      alert('Property information is not available.');
      return;
    }

    const owner = this.hostel?.ownerId || this.hostel?.owner;
    const ownerId =
      typeof owner === 'object'
        ? owner?._id || owner?.id
        : owner;

    if (!ownerId) {
      alert('Owner information is not available.');
      return;
    }

    if (this.isHostelProperty && !this.selectedSharing) {
      alert('Please select a sharing option first.');
      return;
    }

    const requestData: any = {
      ownerId,
      userId: this.userId,
      hostelId: this.hostel._id,
      senderType: 'user',
      propertyType: this.isRentalProperty ? 'rental' : 'hostel',
      requestType: this.isRentalProperty ? 'rental' : 'hostel'
    };

    if (this.isHostelProperty) {
      requestData.sharingType = this.selectedSharing;
    }

    this.isSendingRequest = true;

    this.hostelpage.sendRequest(requestData).subscribe({
      next: (response: any) => {
        this.isSendingRequest = false;
        alert(response?.message || 'Your request has been sent successfully.');
      },
      error: (error: any) => {
        console.error('Request failed:', error);
        this.isSendingRequest = false;
        alert(
          error?.error?.message ||
          'Unable to send your request. Please try again.'
        );
      }
    });
  }

  // --------------------------------------------------
  // BANNER SLIDER
  // --------------------------------------------------

  startAutoSlide(): void {
    this.stopAutoSlide();

    this.bannerInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
      this.bannerInterval = null;
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
      (this.bannerIndex - 1 + this.bannerImages.length) %
      this.bannerImages.length;
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.bannerImages.length) {
      this.bannerIndex = index;
    }
  }

  // --------------------------------------------------
  // NAVIGATION AND CLEANUP
  // --------------------------------------------------

goBack(): void {
  this.location.back();
}

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }
}