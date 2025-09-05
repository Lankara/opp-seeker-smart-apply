import { useState, useRef, useEffect } from "react";
import { Canvas as FabricCanvas, FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Upload, ZoomIn, ZoomOut, RotateCw, Save, X } from "lucide-react";

interface ProfilePictureEditorProps {
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string) => void;
}

export const ProfilePictureEditor = ({ currentImageUrl, onImageUpdate }: ProfilePictureEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentImage, setCurrentImage] = useState<FabricImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !isEditing) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: "#f8f9fa",
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [isEditing]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imgElement = new Image();
      imgElement.onload = () => {
        if (!fabricCanvas) return;

        FabricImage.fromURL(e.target?.result as string).then((img) => {
          // Clear canvas
          fabricCanvas.clear();
          
          // Scale image to fit canvas while maintaining aspect ratio
          const canvasWidth = fabricCanvas.width || 400;
          const canvasHeight = fabricCanvas.height || 400;
          const scale = Math.min(canvasWidth / img.width!, canvasHeight / img.height!);
          
          img.set({
            scaleX: scale,
            scaleY: scale,
            left: (canvasWidth - img.width! * scale) / 2,
            top: (canvasHeight - img.height! * scale) / 2,
          });

          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          setCurrentImage(img);
          fabricCanvas.renderAll();
        });
      };
      imgElement.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    setIsEditing(true);
  };

  const handleZoomIn = () => {
    if (!currentImage) return;
    const currentScale = currentImage.scaleX || 1;
    currentImage.set({
      scaleX: currentScale * 1.2,
      scaleY: currentScale * 1.2,
    });
    fabricCanvas?.renderAll();
  };

  const handleZoomOut = () => {
    if (!currentImage) return;
    const currentScale = currentImage.scaleX || 1;
    const newScale = Math.max(0.1, currentScale * 0.8);
    currentImage.set({
      scaleX: newScale,
      scaleY: newScale,
    });
    fabricCanvas?.renderAll();
  };

  const handleRotate = () => {
    if (!currentImage) return;
    const currentAngle = currentImage.angle || 0;
    currentImage.set({
      angle: currentAngle + 90,
    });
    fabricCanvas?.renderAll();
  };

  const handleSave = async () => {
    if (!fabricCanvas || !user) return;

    setIsUploading(true);
    try {
      // Create a circular crop
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(150, 150, 150, 0, Math.PI * 2);
      ctx.clip();

      // Get the fabric canvas as image and draw it
      const fabricCanvasElement = fabricCanvas.getElement();
      ctx.drawImage(fabricCanvasElement, 0, 0, 300, 300);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.9);
      });

      // Upload to Supabase storage
      const fileName = `${user.id}/profile-picture-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update personal details with new profile picture URL
      const { error: updateError } = await supabase
        .from('personal_details')
        .upsert({
          user_id: user.id,
          profile_picture_url: publicUrl,
        }, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;

      onImageUpdate(publicUrl);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    } catch (error) {
      console.error('Error saving profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to save profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentImage(null);
    if (fabricCanvas) {
      fabricCanvas.clear();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {currentImageUrl ? (
          <div className="relative">
            <img
              src={currentImageUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
            <Camera className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="profile-picture" className="text-sm font-medium">
            Profile Picture
          </Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {currentImageUrl ? 'Change' : 'Upload'}
            </Button>
            {currentImageUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onImageUpdate('')}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="border border-border rounded-lg shadow-sm"
              />
            </div>
            
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="flex items-center gap-2"
              >
                <ZoomOut className="w-4 h-4" />
                Zoom Out
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="flex items-center gap-2"
              >
                <ZoomIn className="w-4 h-4" />
                Zoom In
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Rotate
              </Button>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUploading || !currentImage}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isUploading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};