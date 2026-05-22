import { useState, useCallback, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Building2, Upload, Trash2, ZoomIn, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadOrganizationLogo, deleteOrganizationLogo } from "@/lib/api/user";

interface CompanyLogoUploadProps {
  currentLogo: string | null;
  onLogoChange: (croppedImage: string | null) => void;
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

  // Preserve aspect ratio; fit longest side within MAX.
  const MAX = 1024;
  const srcW = Math.max(1, Math.round(pixelCrop.width));
  const srcH = Math.max(1, Math.round(pixelCrop.height));
  const scale = Math.min(1, MAX / Math.max(srcW, srcH));
  const outW = Math.max(1, Math.round(srcW * scale));
  const outH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, srcW, srcH,
    0, 0, outW, outH
  );

  return canvas.toDataURL("image/png", 0.95);
}

type AspectPreset = "free" | "square" | "wide" | "tall";
const ASPECT_VALUES: Record<Exclude<AspectPreset, "free">, number> = {
  square: 1,
  wide: 3,      // 3:1 banner
  tall: 3 / 4,  // 3:4 portrait
};

const CompanyLogoUpload = ({ currentLogo, onLogoChange, disabled = false }: CompanyLogoUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>("square");
  const aspectValue = aspectPreset === "free" ? undefined : ASPECT_VALUES[aspectPreset];

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
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 2MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRawImage(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setAspectPreset("square");
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

  const [isRemoving, setIsRemoving] = useState(false);

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Company Logo</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
            {rawImage && (
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid
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

export default CompanyLogoUpload;
