interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
}

export class UploadService {
  private static cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  private static uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  /**
   * Check if Cloudinary environment variables are configured.
   */
  public static isConfigured(): boolean {
    return (
      !!this.cloudName &&
      this.cloudName !== "your_cloudinary_cloud_name" &&
      !!this.uploadPreset &&
      this.uploadPreset !== "your_cloudinary_upload_preset"
    );
  }

  /**
   * Upload an image to Cloudinary using unsigned upload preset.
   * @param file The image file to upload
   * @param onProgress Callback to report upload progress percentage (0-100)
   */
  public static async uploadImage(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<CloudinaryResponse> {
    if (!this.isConfigured()) {
      throw new Error(
        "Cloudinary credentials (VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET) are not configured."
      );
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

      xhr.open("POST", url, true);

      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        });
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              secure_url: response.secure_url,
              public_id: response.public_id,
              format: response.format,
              bytes: response.bytes,
            });
          } catch (err) {
            reject(new Error("Failed to parse Cloudinary response: " + err));
          }
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.error?.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error occurred during upload."));
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", this.uploadPreset!);

      xhr.send(formData);
    });
  }
}

export default UploadService;
