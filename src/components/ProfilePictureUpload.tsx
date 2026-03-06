import { useState, useCallback, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Upload, Trash2, ZoomIn, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfilePictureUploadProps {
  currentImage: string | null;
  fallbackInitials: string;
  onImageChange: (croppedImage: string | null) => void;
  disabled?: boolean;
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const size = 512; // Output 512x512
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

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
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 5MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRawImage(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setIsCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropConfirm = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const cropped = await getCroppedImg(rawImage, croppedAreaPixels);
      onImageChange(cropped);
      setIsCropDialogOpen(false);
      setRawImage(null);
      toast({ title: "Profile picture updated", description: "Your photo has been cropped and saved." });
    } catch {
      toast({ title: "Crop failed", description: "Could not process the image.", variant: "destructive" });
    } finally {
      setIsCropping(false);
    }
  };

  const handleRemove = () => {
    onImageChange(null);
    toast({ title: "Profile picture removed" });
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar className="w-20 h-20 border-2 border-border">
            {currentImage && <AvatarImage src={currentImage} alt="Profile" />}
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
        <div className="flex flex-col gap-1.5">
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
            className="h-7 text-xs px-2.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Upload className="w-3 h-3 mr-1.5" />
            {currentImage ? "Change" : "Upload"}
          </Button>
          {currentImage && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleRemove}
              disabled={disabled}
            >
              <Trash2 className="w-3 h-3 mr-1.5" />
              Remove
            </Button>
          )}
          <p className="text-xs text-muted-foreground">Square crop • Max 5MB</p>
        </div>
      </div>

      <Dialog open={isCropDialogOpen} onOpenChange={(open) => { if (!open) { setIsCropDialogOpen(false); setRawImage(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
            {rawImage && (
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex items-center gap-3 px-1">
            <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={(v) => setZoom(v[0])}
              className="flex-1"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setIsCropDialogOpen(false); setRawImage(null); }}>
              Cancel
            </Button>
            <Button onClick={handleCropConfirm} disabled={isCropping}>
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
