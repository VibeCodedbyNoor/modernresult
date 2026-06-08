import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Image as ImageIcon, Loader2, Save, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import SignatureCanvas from 'react-signature-canvas';
import type { DMCSettings } from '@/lib/generateDMC';

interface DMCSettingsFormProps {
  schoolId: string;
  initialSettings: DMCSettings;
  onSave: (settings: DMCSettings) => void;
}

export default function DMCSettingsForm({ schoolId, initialSettings, onSave }: DMCSettingsFormProps) {
  const [settings, setSettings] = useState<DMCSettings>({
    watermark: true,
    title: 'Detailed Marks Certificate',
    footer_note: 'This is a computer generated result',
    ...initialSettings
  });
  const [loading, setLoading] = useState(false);
  const [activeDrawType, setActiveDrawType] = useState<'controller' | 'principal' | null>(null);
  const sigPad = useRef<SignatureCanvas>(null);
  const [uploadingController, setUploadingController] = useState(false);
  const [uploadingPrincipal, setUploadingPrincipal] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('schools')
      .update({ dmc_settings: settings as any })
      .eq('id', schoolId);

    setLoading(false);
    if (error) {
      toast.error('Failed to save settings: ' + error.message);
    } else {
      toast.success('DMC settings saved successfully!');
      onSave(settings);
    }
  };

  const uploadSignature = async (file: File, type: 'controller' | 'principal') => {
    const isController = type === 'controller';
    isController ? setUploadingController(true) : setUploadingPrincipal(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${schoolId}/${type}_sig_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('school-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('school-assets')
        .getPublicUrl(fileName);

      setSettings(prev => ({
        ...prev,
        [isController ? 'controller_signature_url' : 'principal_signature_url']: publicUrl
      }));
      toast.success(`${isController ? 'Controller' : 'Principal'} signature uploaded!`);
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      isController ? setUploadingController(false) : setUploadingPrincipal(false);
    }
  };

  const handleDrawSave = async () => {
    if (!sigPad.current || !activeDrawType) return;
    
    // getTrimmedCanvas removes the empty whitespace around the signature
    const canvas = sigPad.current.getTrimmedCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    
    // Convert dataUrl to File
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `${activeDrawType}_signature.png`, { type: 'image/png' });
    
    await uploadSignature(file, activeDrawType);
    setActiveDrawType(null);
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Marksheet (DMC) Settings
          </CardTitle>
          <Badge variant="secondary" className="text-xs shrink-0">
            Free for all plans
          </Badge>
        </div>
        <CardDescription>
          Customize the appearance of the downloadable PDF Marksheets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="dmc-title">DMC Title</Label>
            <Input
              id="dmc-title"
              value={settings.title}
              onChange={e => setSettings({ ...settings, title: e.target.value })}
              placeholder="Detailed Marks Certificate"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dmc-address">School Address</Label>
              <Input
                id="dmc-address"
                value={settings.address || ''}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                placeholder="Address Line"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dmc-phone">Phone</Label>
              <Input
                id="dmc-phone"
                value={settings.phone || ''}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                placeholder="Phone Number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dmc-email">Email</Label>
              <Input
                id="dmc-email"
                value={settings.email || ''}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                placeholder="school@example.com"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="footer-note">Footer Note</Label>
            <Input
              id="footer-note"
              value={settings.footer_note}
              onChange={e => setSettings({ ...settings, footer_note: e.target.value })}
              placeholder="This is a computer generated result"
            />
          </div>

          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="watermark"
              checked={settings.watermark !== false}
              onCheckedChange={(checked) => setSettings({ ...settings, watermark: checked === true })}
            />
            <Label htmlFor="watermark" className="text-sm font-medium leading-none cursor-pointer">
              Show school name watermark in background
            </Label>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t">
          {/* Controller Signature Section */}
          <div className="space-y-3">
            <Label className="flex justify-between items-center">
              Controller Signature
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs gap-1"
                onClick={() => setActiveDrawType('controller')}
              >
                <Pencil className="h-3 w-3" /> Draw
              </Button>
            </Label>
            <div className="flex flex-col gap-3">
              {settings.controller_signature_url && (
                <div className="relative aspect-[3/1] rounded-md border bg-white flex items-center justify-center overflow-hidden">
                  <img src={settings.controller_signature_url} alt="Controller Sig" className="max-h-full object-contain" />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => setSettings({ ...settings, controller_signature_url: null })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  className="text-xs h-9 cursor-pointer"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) uploadSignature(file, 'controller');
                  }}
                  disabled={uploadingController}
                />
                {uploadingController && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </div>
          </div>

          {/* Principal Signature Section */}
          <div className="space-y-3">
            <Label className="flex justify-between items-center">
              Principal Signature
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs gap-1"
                onClick={() => setActiveDrawType('principal')}
              >
                <Pencil className="h-3 w-3" /> Draw
              </Button>
            </Label>
            <div className="flex flex-col gap-3">
              {settings.principal_signature_url && (
                <div className="relative aspect-[3/1] rounded-md border bg-white flex items-center justify-center overflow-hidden">
                  <img src={settings.principal_signature_url} alt="Principal Sig" className="max-h-full object-contain" />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => setSettings({ ...settings, principal_signature_url: null })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  className="text-xs h-9 cursor-pointer"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) uploadSignature(file, 'principal');
                  }}
                  disabled={uploadingPrincipal}
                />
                {uploadingPrincipal && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </div>
          </div>
        </div>

        {/* Signature Drawing Modal/Overlay */}
        {activeDrawType && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Draw Signature</CardTitle>
                  <CardDescription>Draw your signature for {activeDrawType === 'controller' ? 'Controller' : 'Principal'}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setActiveDrawType(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg bg-white overflow-hidden">
                  <SignatureCanvas 
                    ref={sigPad}
                    penColor="black"
                    canvasProps={{
                      className: "w-full h-48 cursor-crosshair",
                    }}
                  />
                </div>
                <div className="flex justify-between gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => sigPad.current?.clear()}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button 
                    onClick={handleDrawSave}
                    className="flex-1 gap-2"
                    disabled={uploadingController || uploadingPrincipal}
                  >
                    {(uploadingController || uploadingPrincipal) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Apply Signature
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save DMC Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}