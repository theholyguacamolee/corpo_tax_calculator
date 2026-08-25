import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, FileText } from 'lucide-react';
import { StaggerChild } from './AnimatedSection';
import { formatCurrency, getAutoCWTRate } from '@/lib/taxComputations';

export default function LandForm({ data, onChange, mode = 'sale', showClassification = true }) {
  const update = (field, value) => {
    const newData = { ...data, [field]: value };
    const numValue = parseFloat(value) || 0;

    // Sync Hectares -> Area (sqm)
    if (field === 'hectares') {
      newData.area = numValue * 10000;
    }
    
    // Sync Area (sqm) -> Hectares
    if (field === 'area') {
      if (newData.landClassification === 'agricultural') {
        newData.hectares = numValue / 10000;
      }
    }

    onChange(newData);
  };

  const isLand = showClassification;

  // Numeric parsing
  const sellingPrice = parseFloat(data?.sellingPrice) || 0;
  const fmv = parseFloat(data?.fairMarketValue) || 0;
  const area = parseFloat(data?.area) || 0;
  const zonalValue = parseFloat(data?.zonalValue) || 0;
  const areaZonal = area * zonalValue;
  const hasImprovement = Boolean(data?.hasImprovement);
  const improvementAmount = hasImprovement ? (parseFloat(data?.improvementAmount) || 0) : 0;
  const locationType = data?.locationType || 'city';
  const cwtType = data?.cwtType || 'auto';

  const baseHigher = mode === 'sale' ? Math.max(sellingPrice, fmv, areaZonal) : Math.max(fmv, areaZonal);
  const taxBase = baseHigher + improvementAmount;
  const cwtInfo = (mode === 'sale' && data?.isTradeOrBusiness) ? getAutoCWTRate(taxBase, cwtType) : null;

  return (
    <div className="space-y-4">
      {/* Land Classification Card */}
      <StaggerChild>
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              {showClassification ? 'Land Classification & Classification Type' : 'Property Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showClassification && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Land Classification</Label>
                <Select value={data?.landClassification || ''} onValueChange={(v) => update('landClassification', v)}>
                  <SelectTrigger><SelectValue placeholder="Select classification" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="agricultural">Agricultural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Location / Jurisdiction for Transfer Tax</Label>
              <Select value={locationType} onValueChange={(v) => update('locationType', v)}>
                <SelectTrigger><SelectValue placeholder="Select location type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="city">City / Municipality (0.75% Transfer Tax)</SelectItem>
                  <SelectItem value="province">Province (0.50% Transfer Tax)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-background border-border">
                <Checkbox
                  id="trade-business"
                  checked={data?.isTradeOrBusiness || false}
                  onCheckedChange={(v) => update('isTradeOrBusiness', Boolean(v))}
                />
                <Label htmlFor="trade-business" className="text-sm cursor-pointer font-medium text-foreground">
                  Used in Trade or Business (Subject to CWT / Income Tax & VAT)
                </Label>
              </div>

              {data?.isTradeOrBusiness && (
                <div className="space-y-3 pl-4 border-l-2 border-amber-300 ml-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">CWT Classification / Seller Type</Label>
                    <Select value={cwtType} onValueChange={(v) => update('cwtType', v)}>
                      <SelectTrigger className="bg-amber-50/50"><SelectValue placeholder="Select CWT rate rule" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Tiered by Value (1.5% ≤₱500k | 3.0% ≤₱2M | 5.0% &gt;₱2M)</SelectItem>
                        <SelectItem value="habitual_6">Habitual Real Estate Developer (6.0% Flat)</SelectItem>
                        <SelectItem value="socialized_0">Socialized Housing (HUDCC/HLURB Certified - 0.0%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50/60">
                    <Checkbox
                      id="vat-registered"
                      checked={data?.isVATRegistered || false}
                      onCheckedChange={(v) => update('isVATRegistered', Boolean(v))}
                    />
                    <Label htmlFor="vat-registered" className="text-sm cursor-pointer text-amber-900 font-medium">
                      VAT Registered (gross sales/receipts ≥ ₱3M) — Apply 12% VAT
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </StaggerChild>

      {/* Property Identification Card */}
      <StaggerChild>
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              Property Identification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Title No.</Label>
                <Input placeholder="Enter title number" value={data?.titleNo || ''} onChange={(e) => update('titleNo', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tax Declaration No.</Label>
                <Input placeholder="Enter tax declaration" value={data?.taxDecNo || ''} onChange={(e) => update('taxDecNo', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cadastral No.</Label>
                <Input placeholder="Enter cadastral number" value={data?.cadastralNo || ''} onChange={(e) => update('cadastralNo', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Survey No.</Label>
                <Input placeholder="Enter survey number" value={data?.surveyNo || ''} onChange={(e) => update('surveyNo', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </StaggerChild>

      {/* Valuation Details Card */}
      <StaggerChild>
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              Valuation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mode === 'sale' && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">Gross Selling Price (₱)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={data?.sellingPrice ?? ''}
                    onChange={(e) => update('sellingPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold">Fair Market Value (Tax Dec) (₱)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={data?.fairMarketValue ?? ''}
                  onChange={(e) => update('fairMarketValue', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold">Area (sq.m.)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={data?.area ?? ''}
                  onChange={(e) => update('area', parseFloat(e.target.value) || 0)}
                />
              </div>
              {data?.landClassification === 'agricultural' && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">Hectares (auto-converted to sq.m.)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data?.hectares ?? ''}
                    onChange={(e) => update('hectares', parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold">Zonal Value (₱/sq.m.)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={data?.zonalValue ?? ''}
                  onChange={(e) => update('zonalValue', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Land Improvement Checkbox & Amount Field */}
            {isLand && (
              <div className="pt-3 border-t space-y-3">
                <div className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-lg border border-border">
                  <Checkbox
                    id="has-improvement"
                    checked={data?.hasImprovement || false}
                    onCheckedChange={(v) => {
                      const isChecked = Boolean(v);
                      const updated = { ...data, hasImprovement: isChecked };
                      if (!isChecked) {
                        updated.improvementAmount = 0;
                      }
                      onChange(updated);
                    }}
                  />
                  <Label htmlFor="has-improvement" className="text-sm font-medium cursor-pointer text-foreground">
                    🏗️ There is an improvement / building structure on the land
                  </Label>
                </div>
                {data?.hasImprovement && (
                  <div className="space-y-1.5 pl-6 border-l-2 border-secondary/50 ml-2">
                    <Label className="text-xs font-semibold text-primary">Value of Improvement (₱) — added to Tax Base</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={data?.improvementAmount ?? ''}
                      onChange={(e) => update('improvementAmount', parseFloat(e.target.value) || 0)}
                      className="border-secondary/40"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      The amount of improvement will be added to the higher of Gross Selling Price, FMV, or Area × Zonal Value.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Computed Tax Base Display */}
            {taxBase > 0 && (
              <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-lg text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-primary text-sm">
                  <span>Computed Tax Base:</span>
                  <span className="text-secondary">{formatCurrency(taxBase)}</span>
                </div>
                <div className="text-muted-foreground text-[11px] leading-relaxed">
                  Formula: Highest of [{mode === 'sale' ? `SP: ${formatCurrency(sellingPrice)}, ` : ''}FMV: {formatCurrency(fmv)}, Area×Zonal: {formatCurrency(areaZonal)}]
                  {hasImprovement && improvementAmount > 0 ? ` + Improvement: ${formatCurrency(improvementAmount)}` : ''}
                </div>
              </div>
            )}

            {mode === 'sale' && data?.isTradeOrBusiness && taxBase > 0 && cwtInfo && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                <div className="text-xs font-semibold text-amber-900">📋 Creditable Withholding Tax (CWT)</div>
                <div className="text-xs text-amber-800">Rate: <strong>{cwtInfo.label}</strong> ({cwtInfo.desc})</div>
                <div className="text-xs text-amber-800">CWT Amount: <strong>{formatCurrency(taxBase * cwtInfo.rate)}</strong></div>
              </div>
            )}
          </CardContent>
        </Card>
      </StaggerChild>
    </div>
  );
}