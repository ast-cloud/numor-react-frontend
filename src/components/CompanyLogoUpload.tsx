import { useState, useRef } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Upload, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadOrganizationLogo, deleteOrganizationLogo } from "@/lib/api/user";

interface CompanyLogoUploadProps {
  currentLogo: string | null;
  onLogoChange: (croppedImage: string | null) => void;
  disabled?: boolean;
}

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const srcW = Math.max(1, Math.round(crop.width * scaleX));
  const srcH = Math.max(1, Math.round(crop.height * scaleY));
  const srcX = Math.round(crop.x * scaleX);
  const srcY = Math.round(crop.y * scaleY);

  const MAX = 1024;
  const scale = Math.min(1, MAX / Math.max(srcW, srcH));
  const outW = Math.max(1, Math.round(srcW * scale));
  const outH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

  return canvas.toDataURL("image/png", 0.95);
}

const CompanyLogoUpload = ({ currentLogo, onLogoChange, disabled = false }: CompanyLogoUploadProps) => {
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
    const w = width * 0.8;
    const h = height * 0.8;
    const initial: PixelCrop = {
      unit: "px",
      x: (width - w) / 2,
      y: (height - h) / 2,
      width: w,
      height: h,
    };
    setCrop(initial);
    setCompletedCrop(initial);
  };

  const handleCropConfirm = async () => {
    if (!imgRef.current || !completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0) return;
    setIsCropping(true);
    try {
      const cropped = getCroppedImg(imgRef.current, completedCrop);
      const logoUrl = await uploadOrganizationLogo(cropped);
      onLogoChange(logoUrl);
      setIsCropDialogOpen(false);
      setRawImage(null);
      toast({ title: "Logo updated", description: "Your company logo has been uploaded successfully." });
    } catch {
      toast({ title: "Crop failed", description: "Could not process the image.", variant: "destructive" });
    } finally {
      setIsCropping(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const success = await deleteOrganizationLogo();
      if (success) {
        onLogoChange(null);
        toast({ title: "Logo removed" });
      } else {
        toast({ title: "Failed to remove", description: "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to remove", description: "Could not delete the logo.", variant: "destructive" });
    } finally {
      setIsRemoving(false);
    }
  };

  const canApply = !!completedCrop && completedCrop.width > 0 && completedCrop.height > 0;

  return (
    <>
      <div className="flex items-center gap-4 py-3">
        <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
          {currentLogo ? (
            <img src={currentLogo} alt="Company logo" className="w-full h-full object-contain" />
          ) : (
            <Building2 className="w-10 h-10 text-muted-foreground/50" />
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
            {currentLogo ? "Change" : "Upload"}
          </Button>
          {currentLogo && (
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
            <DialogTitle>Crop Company Logo</DialogTitle>
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

export default CompanyLogoUpload;
