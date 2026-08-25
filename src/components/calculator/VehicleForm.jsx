import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Car } from 'lucide-react';
import { StaggerChild } from './AnimatedSection';

export default function VehicleForm({ data, onChange, mode = 'sale' }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <StaggerChild>
      <Card className="border-2 border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
            <Car className="w-5 h-5 text-secondary" />
            Vehicle Details ({mode === 'sale' ? 'Sale Valuation' : 'Donation Valuation'})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Plate Number</Label>
              <Input placeholder="e.g., ABC 1234" value={data?.plateNumber || ''} onChange={(e) => update('plateNumber', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Color of the Vehicle</Label>
              <Input placeholder="e.g., White" value={data?.color || ''} onChange={(e) => update('color', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Name of the Owner</Label>
              <Input placeholder="Enter owner name" value={data?.ownerName || ''} onChange={(e) => update('ownerName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Brand / Make</Label>
              <Input placeholder="e.g., Toyota Vios" value={data?.brand || ''} onChange={(e) => update('brand', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">Book Value / Fair Market Value (₱)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={data?.vehicleValue ?? ''}
                onChange={(e) => update('vehicleValue', parseFloat(e.target.value) || 0)}
              />
            </div>
            {mode === 'sale' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">Total Selling Price (₱)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={data?.sellingPrice ?? ''}
                    onChange={(e) => update('sellingPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">Acquisition Cost (₱)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={data?.acquisitionCost ?? ''}
                    onChange={(e) => update('acquisitionCost', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </>
            )}
          </div>

          {mode === 'sale' && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-background border-border">
                <Checkbox
                  id="veh-trade-business"
                  checked={data?.isTradeOrBusiness || false}
                  onCheckedChange={(v) => update('isTradeOrBusiness', Boolean(v))}
                />
                <Label htmlFor="veh-trade-business" className="text-sm cursor-pointer font-medium text-foreground">
                  Used in Trade or Business
                </Label>
              </div>
              {data?.isTradeOrBusiness && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50/60 ml-2">
                  <Checkbox
                    id="veh-vat-registered"
                    checked={data?.isVATRegistered || false}
                    onCheckedChange={(v) => update('isVATRegistered', Boolean(v))}
                  />
                  <Label htmlFor="veh-vat-registered" className="text-sm cursor-pointer text-amber-900 font-medium">
                    VAT Registered (gross receipts ≥ ₱3M) — Apply 12% VAT
                  </Label>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </StaggerChild>
  );
}