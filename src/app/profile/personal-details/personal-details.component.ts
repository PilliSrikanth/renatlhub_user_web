import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface User {
  _id?: string;
  name: string;
  mobile: string;
  email: string;
  address?: string;
  profileImage?: string;
}

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit {

  // ================= API =================

  private apiUrl = 'http://localhost:3200/api/users';

  // Backend URL
  private backendUrl = 'http://localhost:3200';


  // ================= USER =================

  user: User = {
    name: '',
    mobile: '',
    email: '',
    address: '',
    profileImage: ''
  };


  defaultImage =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCl4k0hAnse_DpI5XU8zm7Xh5Q_NYijb6848-IGLTIJw&s=10';


  // ================= PROFILE =================

  loading = false;

  saving = false;

  uploadingImage = false;


  // ================= PASSWORD =================

  passwordData = {

    currentPassword: '',

    newPassword: '',

    confirmPassword: ''

  };


  changingPassword = false;


  showCurrentPassword = false;

  showNewPassword = false;

  showConfirmPassword = false;


  // ================= CONSTRUCTOR =================

  constructor(
    private http: HttpClient
  ) {}


  // ================= INIT =================

  ngOnInit(): void {

    this.loadUser();

  }


  // =====================================================
  // GET USER
  // =====================================================

  loadUser(): void {

    const userId =
      localStorage.getItem('userId');


    if (!userId) {

      console.error(
        'User ID not found'
      );

      return;

    }


    this.loading = true;


    this.http.get<any>(
      `${this.apiUrl}/${userId}`
    )
    .subscribe({

      next: (response) => {

        console.log(
          'User:',
          response
        );


        if (response.user) {

          let profileImage =
            response.user.profileImage || '';


          // Convert relative image path
          // to full backend URL
          profileImage =
            this.getImageUrl(
              profileImage
            );


          this.user = {

            _id:
              response.user._id,

            name:
              response.user.name || '',

            mobile:
              response.user.mobile || '',

            email:
              response.user.email || '',

            address:
              response.user.address || '',

            profileImage:
              profileImage

          };

        }


        this.loading = false;

      },


      error: (error) => {

        console.error(
          'Error loading user:',
          error
        );


        this.loading = false;

      }

    });

  }


  // =====================================================
  // IMAGE URL
  // =====================================================

  getImageUrl(
    image: string
  ): string {

    if (!image) {

      return '';

    }


    // Already full URL
    if (
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('data:')
    ) {

      return image;

    }


    // Relative backend path
    if (
      image.startsWith('/')
    ) {

      return this.apiUrl + image;

    }


    return image;

  }


  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  updateProfile(): void {

    if (!this.user._id) {

      alert(
        'User ID not found'
      );

      return;

    }


    // Name validation
    if (
      !this.user.name.trim()
    ) {

      alert(
        'Please enter your name'
      );

      return;

    }


    // Mobile validation
    if (
      !this.user.mobile.trim()
    ) {

      alert(
        'Please enter mobile number'
      );

      return;

    }


    // Email validation
    if (
      !this.user.email.trim()
    ) {

      alert(
        'Please enter email'
      );

      return;

    }


    const updateData = {

      name:
        this.user.name.trim(),

      mobile:
        this.user.mobile.trim(),

      email:
        this.user.email.trim(),

      address:
        this.user.address?.trim() || ''

    };


    this.saving = true;


    this.http.put<any>(
      `${this.apiUrl}/${this.user._id}`,
      updateData
    )
    .subscribe({

      next: (response) => {

        console.log(
          'Profile updated:',
          response
        );


        if (response.user) {

          this.user = {

            ...this.user,

            ...response.user,

            profileImage:
              this.getImageUrl(
                response.user.profileImage ||
                this.user.profileImage ||
                ''
              )

          };

        }


        // Update local storage
        this.updateLocalStorage();


        this.saving = false;


        alert(
          response.message ||
          'Profile updated successfully'
        );

      },


      error: (error) => {

        console.error(
          'Update profile error:',
          error
        );


        this.saving = false;


        alert(
          error?.error?.message ||
          'Failed to update profile'
        );

      }

    });

  }


  // =====================================================
  // PROFILE IMAGE SELECT
  // =====================================================

  onImageSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const file =
      input.files[0];


    // ==========================================
    // Check image type
    // ==========================================

    if (
      !file.type.startsWith('image/')
    ) {

      alert(
        'Please select an image file'
      );

      input.value = '';

      return;

    }


    // ==========================================
    // Check image size
    // Maximum 5 MB
    // ==========================================

    if (
      file.size > 5 * 1024 * 1024
    ) {

      alert(
        'Image size must be less than 5 MB'
      );

      input.value = '';

      return;

    }


    // ==========================================
    // Preview image
    // ==========================================

    const reader =
      new FileReader();


    reader.onload = () => {

      this.user.profileImage =
        reader.result as string;

    };


    reader.readAsDataURL(file);


    // ==========================================
    // Upload image
    // ==========================================

    this.uploadProfileImage(file);

  }


  // =====================================================
  // UPLOAD PROFILE IMAGE
  // =====================================================

  uploadProfileImage(
    file: File
  ): void {

    if (!this.user._id) {

      alert(
        'User ID not found'
      );

      return;

    }


    const formData =
      new FormData();


    // IMPORTANT:
    // This name must match:
    // upload.single('profileImage')
    formData.append(
      'profileImage',
      file
    );


    this.uploadingImage = true;


    this.http.put<any>(
      `${this.apiUrl}/${this.user._id}/profile-image`,
      formData
    )
    .subscribe({

      next: (response) => {

        console.log(
          'Profile image uploaded:',
          response
        );


        if (
          response.user &&
          response.user.profileImage
        ) {

          this.user.profileImage =
            this.getImageUrl(
              response.user.profileImage
            );

        }


        // Update localStorage
        this.updateLocalStorage();


        this.uploadingImage = false;


        alert(
          response.message ||
          'Profile image updated successfully'
        );

      },


      error: (error) => {

        console.error(
          'Profile image upload error:',
          error
        );


        this.uploadingImage = false;


        alert(
          error?.error?.message ||
          'Failed to upload profile image'
        );


        // Reload old image
        this.loadUser();

      }

    });

  }


  // =====================================================
  // UPDATE LOCAL STORAGE
  // =====================================================

  updateLocalStorage(): void {

    const storedUser =
      localStorage.getItem('user');


    if (!storedUser) {

      return;

    }


    try {

      const parsedUser =
        JSON.parse(
          storedUser
        );


      parsedUser._id =
        this.user._id;

      parsedUser.name =
        this.user.name;

      parsedUser.email =
        this.user.email;

      parsedUser.mobile =
        this.user.mobile;

      parsedUser.address =
        this.user.address;

      parsedUser.profileImage =
        this.user.profileImage;


      localStorage.setItem(
        'user',
        JSON.stringify(
          parsedUser
        )
      );


    } catch (error) {

      console.error(
        'LocalStorage update error:',
        error
      );

    }

  }


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  changePassword(): void {

    if (!this.user._id) {

      alert(
        'User ID not found'
      );

      return;

    }


    const currentPassword =
      this.passwordData.currentPassword.trim();


    const newPassword =
      this.passwordData.newPassword.trim();


    const confirmPassword =
      this.passwordData.confirmPassword.trim();


    // Current password
    if (!currentPassword) {

      alert(
        'Please enter your current password'
      );

      return;

    }


    // New password
    if (!newPassword) {

      alert(
        'Please enter a new password'
      );

      return;

    }


    // Minimum length
    if (
      newPassword.length < 6
    ) {

      alert(
        'New password must be at least 6 characters'
      );

      return;

    }


    // Confirm password
    if (!confirmPassword) {

      alert(
        'Please confirm your new password'
      );

      return;

    }


    // Compare
    if (
      newPassword !==
      confirmPassword
    ) {

      alert(
        'New password and confirm password do not match'
      );

      return;

    }


    // Same password
    if (
      currentPassword ===
      newPassword
    ) {

      alert(
        'New password must be different from current password'
      );

      return;

    }


    const passwordData = {

      currentPassword:
        currentPassword,

      newPassword:
        newPassword

    };


    this.changingPassword =
      true;


    this.http.put<any>(
      `${this.apiUrl}/${this.user._id}/password`,
      passwordData
    )
    .subscribe({

      next: (response) => {

        console.log(
          'Password changed:',
          response
        );


        this.changingPassword =
          false;


        // Clear fields
        this.passwordData = {

          currentPassword: '',

          newPassword: '',

          confirmPassword: ''

        };


        // Hide passwords
        this.showCurrentPassword =
          false;

        this.showNewPassword =
          false;

        this.showConfirmPassword =
          false;


        alert(
          response.message ||
          'Password changed successfully'
        );

      },


      error: (error) => {

        console.error(
          'Change password error:',
          error
        );


        this.changingPassword =
          false;


        alert(
          error?.error?.message ||
          'Failed to change password'
        );

      }

    });

  }

}