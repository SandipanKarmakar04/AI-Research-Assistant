import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {

  selectedFile: any

  constructor(private uploadService: UploadService) { }

  uploadMessage = '';

  uploadedFiles: string[] = [];

  onFileSelected(event: any) {

    const file = event.target.files[0];

    if (!file) return;

    const allowedExtensions = ['pdf', 'txt', 'csv'];

    const extension =
      file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension!)) {

      this.uploadMessage =
        'Only PDF, TXT and CSV files allowed';

      return;
    }

    this.selectedFile = file;

  }

  uploadFile() {

    if (!this.selectedFile) return;

    this.uploadService
      .uploadFile(this.selectedFile)
      .subscribe({

        next: (res) => {
          this.uploadedFiles.push(
            this.selectedFile!.name
          );

          this.uploadMessage = `${this.selectedFile?.name} uploaded successfully`;

        },

        error: (err) => {

          this.uploadMessage = 'Upload failed';

        }

      });

  }



}
