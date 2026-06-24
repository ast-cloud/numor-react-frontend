import { useState, useRef } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Upload, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteProfilePhoto, uploadProfilePhoto } from "@/lib/api/user";

interface ProfilePictureUploadProps {
  currentImage: string | null;
  fallbackInitials: string;
  onImageChange: (croppedImage: string | null) => void;
  disabled?: boolean;
}

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const srcW = Math.max(1, Math.round(crop.width * scaleX));
  const srcH = Math.max(1, Math.round(crop.height * scaleY));
  const srcX = Math.round(crop.x * scaleX);
  const srcY = Math.round(crop.y * scaleY);

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, size, size);

  return canvas.toDataURL("image/jpeg", 0.9);
}

const ProfilePictureUpload = ({
  currentImage,
  fallbackInitials,
  onImageChange,
  disabled = false,
}: ProfilePictureUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>(undefined);
  const [isCropping, setIsCropping] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 2MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRawImage(reader.result as string);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setIsCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
      width,
      height,
    );
    setCrop(initial);
    const side = Math.min(width, height) * 0.8;
    setCompletedCrop({
      unit: "px",
      x: (width - side) / 2,
      y: (height - side) / 2,
      width: side,
      height: side,
    });
  };

  const handleCropConfirm = async () => {
    if (!imgRef.current || !completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0) return;
    setIsCropping(true);
    try {
      const cropped = getCroppedImg(imgRef.current, completedCrop);
      const photoUrl = await uploadProfilePhoto(cropped);
      onImageChange(photoUrl);
      setIsCropDialogOpen(false);
      setRawImage(null);
      toast({ title: "Profile picture updated", description: "Your photo has been uploaded successfully." });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload the image. Please try again.", variant: "destructive" });
    } finally {
      setIsCropping(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const success = await deleteProfilePhoto();
      if (success) {
        onImageChange(null);
        toast({ title: "Profile picture removed" });
      } else {
        toast({ title: "Failed to remove", description: "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to remove", description: "Could not delete the photo.", variant: "destructive" });
    } finally {
      setIsRemoving(false);
    }
  };

  const canApply = !!completedCrop && completedCrop.width > 0 && completedCrop.height > 0;

  return (
    <>
      <div className="flex items-center gap-4 py-3">
        <div className="relative group">
          <Avatar className="w-20 h-20 border-2 border-border" key={currentImage || 'no-image'}>
            {currentImage && <AvatarImage src={currentImage} alt="Profile" loading="lazy" />}
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {fallbackInitials}
            </AvatarFallback>
          </Avatar>
          {!disabled && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        <div className="flex flex-col items-start gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-5 text-[10px] px-1.5 w-fit"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Upload className="w-2 h-2 mr-0.5" />
            {currentImage ? "Change" : "Upload"}
          </Button>
          {currentImage && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-[10px] px-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleRemove}
              disabled={disabled || isRemoving}
            >
              {isRemoving ? <Loader2 className="w-2 h-2 mr-0.5 animate-spin" /> : <Trash2 className="w-2 h-2 mr-0.5" />}
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          )}
          <p className="text-[10px] text-muted-foreground/70">JPG, PNG · Max 2MB</p>
        </div>
      </div>

      <Dialog open={isCropDialogOpen} onOpenChange={(open) => { if (!open) { setIsCropDialogOpen(false); setRawImage(null); } }}>
        <DialogContent className="sm:max-w-sm max-w-[92vw] max-h-[90vh] overflow-y-auto p-4 gap-3">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">Drag the handles to crop freely at any size.</p>
          <div className="w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {rawImage && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                keepSelection
              >
                <img
                  ref={imgRef}
                  src={rawImage}
                  alt="Crop preview"
                  onLoad={handleImageLoad}
                  className="max-h-[60vh] max-w-full object-contain"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setIsCropDialogOpen(false); setRawImage(null); }}>
              Cancel
            </Button>
            <Button onClick={handleCropConfirm} disabled={isCropping || !canApply}>
              {isCropping ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              {isCropping ? "Cropping..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePictureUpload;
