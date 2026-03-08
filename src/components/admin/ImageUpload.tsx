import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, GripVertical, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload = ({ images, onChange, maxImages = 6 }: ImageUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArr.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast({ title: "Max images reached", description: `You can upload up to ${maxImages} images.` });
      return;
    }

    const toUpload = fileArr.slice(0, remaining);
    setUploading(true);

    const urls: string[] = [];
    for (const file of toUpload) {
      const url = await uploadFile(file);
      if (url) urls.push(url);
    }

    if (urls.length > 0) {
      onChange([...images, ...urls]);
      toast({ title: `${urls.length} image(s) uploaded` });
    }
    setUploading(false);
  }, [images, maxImages, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block">
        Product Images ({images.length}/{maxImages})
      </label>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
        <p className="font-ui text-sm text-foreground">
          {uploading ? "Uploading..." : "Drag & drop images here"}
        </p>
        <p className="font-body text-xs text-muted-foreground mt-1">
          or click to browse • JPG, PNG, WebP
        </p>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {images.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragIndex !== null && dragIndex !== i) {
                  handleReorder(dragIndex, i);
                }
                setDragIndex(null);
              }}
              className={`relative group aspect-square border ${
                i === 0 ? "border-accent ring-1 ring-accent" : "border-border"
              } ${dragIndex === i ? "opacity-50" : ""}`}
            >
              <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-0 left-0 bg-accent text-accent-foreground font-ui text-[8px] tracking-wider px-1.5 py-0.5 uppercase">
                  Main
                </span>
              )}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                    className="p-1 bg-destructive text-white rounded-full"
                  >
                    <X size={12} />
                  </button>
                  <span className="p-1 bg-foreground/70 text-background rounded-full cursor-grab">
                    <GripVertical size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
