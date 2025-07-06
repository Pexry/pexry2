"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, FileText, Image as ImageIcon, Check } from "lucide-react";
import Image from "next/image";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  filesize: number;
  alt: string;
  mimeType: string;
  createdAt: string;
}

interface MediaSelectorProps {
  onSelectAction: (media: MediaItem) => void;
  selectedId?: string;
  type: 'image' | 'file' | 'all';
  trigger: React.ReactNode;
}

export function MediaSelector({ onSelectAction, selectedId, type, trigger }: MediaSelectorProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  useEffect(() => {
    filterItems();
  }, [mediaItems, searchTerm, type]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/custom/media');
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      const data = await response.json();
      setMediaItems(data.docs || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = mediaItems;

    // Filter by type
    if (type === 'image') {
      filtered = filtered.filter(item => item.mimeType?.startsWith('image/'));
    } else if (type === 'file') {
      filtered = filtered.filter(item => !item.mimeType?.startsWith('image/'));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleSelect = (media: MediaItem) => {
    onSelectAction(media);
    setOpen(false);
    setSearchTerm(""); // Clear search when closing
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (mimeType: string) => mimeType?.startsWith('image/');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Select {type === 'image' ? 'Image' : type === 'file' ? 'File' : 'Media'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-96">
            {loading ? (
              <div className="text-center py-8">Loading media...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No media found
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedId === item.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                        {isImage(item.mimeType) ? (
                          <Image
                            src={item.url}
                            alt={item.alt}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        {selectedId === item.id && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium truncate" title={item.filename}>
                          {item.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(item.filesize)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
