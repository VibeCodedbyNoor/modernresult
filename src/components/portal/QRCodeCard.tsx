import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeCardProps {
  schoolName: string;
  slug: string;
}

export default function QRCodeCard({ schoolName, slug }: QRCodeCardProps) {
  const portalUrl = `https://resultportal.online/results/${slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(portalUrl)}&size=300x300&margin=10`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-qr-code.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('QR code downloaded!');
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${schoolName} - Result Portal`,
          text: `Check your results at ${schoolName}`,
          url: portalUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(portalUrl);
      toast.success('Portal link copied to clipboard!');
    }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" /> Portal QR Code
        </CardTitle>
        <CardDescription>
          Print or share this QR code — it links directly to your result portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border bg-white">
          <img
            src={qrUrl}
            alt={`QR code for ${schoolName} result portal`}
            className="w-48 h-48"
            loading="lazy"
          />
          <p className="text-sm font-semibold text-gray-800 text-center">{schoolName}</p>
          <p className="text-xs text-gray-500 text-center break-all">resultportal.online/results/{slug}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" /> Download QR
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
