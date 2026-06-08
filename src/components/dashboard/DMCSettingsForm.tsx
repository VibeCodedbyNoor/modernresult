import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Save, Check } from 'lucide-react';
import { toast } from 'sonner';
import { DMC_TEMPLATES, type DMCSettings, type DMCTemplateId } from '@/lib/generateDMC';
import DMCTemplatePreview from './DMCTemplatePreview';

interface DMCSettingsFormProps {
  schoolId: string;
  initialSettings: DMCSettings;
  onSave: (settings: DMCSettings) => void;
}

export default function DMCSettingsForm({ schoolId, initialSettings, onSave }: DMCSettingsFormProps) {
  const [settings, setSettings] = useState<DMCSettings>({
    template: 'classic',
    watermark: true,
    title: 'Detailed Marks Certificate',
    footer_note: 'This is a computer generated result',
    ...initialSettings,
  });
  const [loading, setLoading] = useState(false);

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

  const selectedTemplate: DMCTemplateId = settings.template || 'classic';

  return (
    <Card className="max-w-3xl">
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
          Pick a design template and customize what appears on the downloadable PDF marksheets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template picker */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Marksheet Template</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {DMC_TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, template: tpl.id })}
                  className={`group relative rounded-lg border-2 overflow-hidden transition-all text-left ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/30 shadow-md'
                      : 'border-border hover:border-muted-foreground/40'
                  }`}
                >
                  <div className="aspect-[3/4] bg-muted/30 overflow-hidden">
                    <DMCTemplatePreview templateId={tpl.id} />
                  </div>
                  <div className="p-2 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold truncate">{tpl.name}</p>
                      {isSelected && <Check className="h-3 w-3 text-primary shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">{tpl.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4 pt-4 border-t">
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
