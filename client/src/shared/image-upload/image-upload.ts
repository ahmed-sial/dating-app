import { Component, inject, input, OnDestroy, output, signal, Signal } from '@angular/core'
import { MemberService } from '../../core/services/member-service'

@Component({
  selector: 'app-image-upload',
  imports: [],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css',
})
export class ImageUpload implements OnDestroy {
  private _memberService = inject(MemberService)
  private _fileToUpload: File | null = null
  protected imageSrc = signal< string | ArrayBuffer | null | undefined>(null)
  protected isDragging = false
  uploadFile = output<File>()
  loading = input<boolean>(false)

  private previewImage(file: File) {
    const reader = new FileReader()
    reader.onload = e => this.imageSrc.set(e.target?.result)
    reader.readAsDataURL(file)
  }

  onDragOver(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = true
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false
  }

  onDrop(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false
    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0]
      this.previewImage(file)
      this._fileToUpload = file
    }
  }

  onCancel() {
    this._fileToUpload = null
    this.imageSrc.set(null)
  }

  onUploadFile() {
    if (this._fileToUpload) {
      this.uploadFile.emit(this._fileToUpload)
    }
  }


  ngOnDestroy(): void {
    this._memberService.editMode = false  
  }
}
