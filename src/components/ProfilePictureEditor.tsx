import React, { useRef, useEffect, useState } from 'react';
import { Canvas as FabricCanvas, FabricImage } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, Crop, ZoomIn, ZoomOut, Save, X, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePictureEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
  currentImageUrl?: string;
  userId: string;
}

export const ProfilePictureEditor: React.FC<ProfilePictureEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  currentImageUrl,
  userId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [currentImage, setCurrentImage] = useState<FabricImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 300,
      height: 300,
      backgroundColor: '#f8f9fa',
    });

    setFabricCanvas(canvas);

    // Load current image if exists
    if (currentImageUrl) {
      loadImageToCanvas(canvas, currentImageUrl);
    }

    return () => {
      canvas.dispose();
    };
  }, [isOpen, currentImageUrl]);

  const loadImageToCanvas = async (canvas: FabricCanvas, imageUrl: string) => {
    try {
      const img = await FabricImage.fromURL(imageUrl);
      
      // Scale image to fit canvas while maintaining aspect ratio
      const canvasSize = 300;
      const scale = Math.min(canvasSize / img.width!, canvasSize / img.height!);
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: canvasSize / 2,
        top: canvasSize / 2,
        originX: 'center',
        originY: 'center',
      });

      canvas.clear();
      canvas.add(img);
      canvas.setActiveObject(img);
      setCurrentImage(img);
      canvas.renderAll();
    } catch (error) {
      console.error('Error loading image:', error);
      toast({
        title: "Error",
        description: "Failed to load image",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      loadImageToCanvas(fabricCanvas, imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleZoomIn = () => {
    if (!currentImage) return;
    const newScale = Math.min((currentImage.scaleX || 1) * 1.2, 3);
    currentImage.set({ scaleX: newScale, scaleY: newScale });
    fabricCanvas?.renderAll();
  };

  const handleZoomOut = () => {
    if (!currentImage) return;
    const newScale = Math.max((currentImage.scaleX || 1) * 0.8, 0.1);
    currentImage.set({ scaleX: newScale, scaleY: newScale });
    fabricCanvas?.renderAll();
  };

  const handleSave = async () => {
    if (!fabricCanvas || !currentImage) {
      toast({
        title: "No image",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a new canvas for cropping
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = 200;
      cropCanvas.height = 200;
      const cropCtx = cropCanvas.getContext('2d');

      if (!cropCtx) {
        throw new Error('Could not get canvas context');
      }

      // Calculate the crop area (center crop)
      const canvasSize = 300;
      const cropSize = 200;
      const cropX = (canvasSize - cropSize) / 2;
      const cropY = (canvasSize - cropSize) / 2;

      // Get the main canvas as image data
      const mainCanvasDataUrl = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
        left: cropX,
        top: cropY,
        width: cropSize,
        height: cropSize,
      });

      // Convert to blob
      const response = await fetch(mainCanvasDataUrl);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileName = `profile_${userId}_${Date.now()}.png`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      onSave(publicUrl);
      onClose();

      toast({
        title: "Success",
        description: "Profile picture saved successfully",
      });

    } catch (error) {
      console.error('Error saving profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to save profile picture",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Edit Profile Picture
              </CardTitle>
              <CardDescription>
                Upload, crop, and adjust your profile picture
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Canvas */}
          <div className="flex justify-center">
            <div className="border-2 border-dashed border-border rounded-lg overflow-hidden">
              <canvas ref={canvasRef} className="block" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={!currentImage}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={!currentImage}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Drag to reposition • Use zoom controls to resize</p>
            <p>Image will be cropped to a square (200x200)</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!currentImage || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};