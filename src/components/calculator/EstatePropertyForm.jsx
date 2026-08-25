import React, { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Home, MapPin, Building, Building2, TrendingUp, Car, Coins, Calculator, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/taxComputations';

const PROPERTY_TYPES = [
  { id: 'land', label: 'Land', icon: MapPin },
  { id: 'condo', label: 'Condo', icon: Building },
  { id: 'building', label: 'Building', icon: Building2 },
  { id: 'stocks', label: 'Stocks', icon: TrendingUp },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'securities', label: 'Securities', icon: Coins },
];

// Auto CWT rate based on taxable base value
function getCWTRate(taxBase) {
  if (!taxBase || taxBase <= 0) return null;
  if (taxBase <= 500000) return { rate: 0.015, label: '1.5% (≤ ₱500,000)' };
  if (taxBase <= 2000000) return { rate: 0.03, label: '3.0% (₱500,001 – ₱2,000,000)' };
  return { rate: 0.05, label: '5.0% (> ₱2,000,000)' };
}

export default function EstatePropertyForm({ properties, onChange, hasFamilyHome, dateOfDeath }) {
  const addProperty = () => {
    onChange([...properties, { propertyType: '', isFamilyHome: false }]);
  };

  const removeProperty = (index) => {
    onChange(properties.filter((_, i) => i !== index));
  };

  const updateProperty = (index, field, value) => {
    const updated = [...properties];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'isFamilyHome' && value) {
      updated.forEach((p, i) => { if (i !== index) p.isFamilyHome = false; });
    }
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Home className="w-4 h-4 text-secondary" /> Estate Properties ({properties.length})
        </h3>
      </div>

      <AnimatePresence>
        {properties.map((prop, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-border/50 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Property #{index + 1}
                  {prop.isFamilyHome && (
                    <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Home className="w-3 h-3" /> Family Home
                    </span>
                  )}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeProperty(index)} className="text-destructive hover:text-destructive h-7 w-7">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property Type as Tabs */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Property Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updateProperty(index, 'propertyType', id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          prop.propertyType === id
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {prop.propertyType === 'land' && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <Input placeholder="Property description" value={prop.description || ''} onChange={(e) => updateProperty(index, 'description', e.target.value)} />
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                      <Checkbox
                        id={`family-home-${index}`}
                        checked={prop.isFamilyHome || false}
                        onCheckedChange={(v) => updateProperty(index, 'isFamilyHome', Boolean(v))}
                        disabled={hasFamilyHome && !prop.isFamilyHome}
                      />
                      <Label htmlFor={`family-home-${index}`} className="text-xs cursor-pointer">🏠 Mark as Family Home (deduction up to ₱10M for TRAIN Law / ₱1M pre-TRAIN)</Label>
                    </div>

                    <EstateLandFields prop={prop} index={index} updateProperty={updateProperty} showImprovement={true} showCWT={true} />
                  </>
                )}

                {(prop.propertyType === 'condo' || prop.propertyType === 'building') && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <Input placeholder="Property description" value={prop.description || ''} onChange={(e) => updateProperty(index, 'description', e.target.value)} />
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                      <Checkbox
                        id={`family-home-${index}`}
                        checked={prop.isFamilyHome || false}
                        onCheckedChange={(v) => updateProperty(index, 'isFamilyHome', Boolean(v))}
                        disabled={hasFamilyHome && !prop.isFamilyHome}
                      />
                      <Label htmlFor={`family-home-${index}`} className="text-xs cursor-pointer">🏠 Mark as Family Home (deduction up to ₱10M for TRAIN Law / ₱1M pre-TRAIN)</Label>
                    </div>

                    <EstateLandFields prop={prop} index={index} updateProperty={updateProperty} showImprovement={false} showCWT={true} />
                  </>
                )}

                {prop.propertyType === 'stocks' && (
                  <EstateStockFields prop={prop} index={index} updateProperty={updateProperty} dateOfDeath={dateOfDeath} />
                )}

                {prop.propertyType === 'vehicles' && (
                  <EstateVehicleFields prop={prop} index={index} updateProperty={updateProperty} />
                )}

                {prop.propertyType === 'securities' && (
                  <EstateSecuritiesFields prop={prop} index={index} updateProperty={updateProperty} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        variant="outline"
        className="w-full text-secondary border-secondary/30 hover:bg-secondary/10 border-dashed"
        onClick={addProperty}
      >
        <Plus className="w-4 h-4 mr-2" /> Add Property
      </Button>
    </div>
  );
}

function EstateLandFields({ prop, index, updateProperty, showImprovement, showCWT }) {
  const fmv = parseFloat(prop.fairMarketValue) || 0;
  const area = parseFloat(prop.area) || 0;
  const zonal = parseFloat(prop.zonalValue) || 0;
  const imp = (showImprovement && prop.hasImprovement) ? (parseFloat(prop.improvementAmount) || 0) : 0;
  const areaZonal = area * zonal;
  const fmvHigher = Math.max(fmv, areaZonal);
  const taxBase = fmvHigher + imp;

  const cwtInfo = showCWT ? getCWTRate(taxBase) : null;

  return (
    <div className="space-y-4">
      {prop.propertyType === 'land' && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Land Classification</Label>
          <Select value={prop.landClassification || ''} onValueChange={(v) => updateProperty(index, 'landClassification', v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="agricultural">Agricultural</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Fair Market Value (₱)</Label>
          <Input type="number" placeholder="0.00" value={prop.fairMarketValue ?? ''} onChange={(e) => updateProperty(index, 'fairMarketValue', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Area (sq.m.)</Label>
          <Input type="number" placeholder="0.00" value={prop.area ?? ''} onChange={(e) => updateProperty(index, 'area', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Zonal Value (₱/sq.m.)</Label>
          <Input type="number" placeholder="0.00" value={prop.zonalValue ?? ''} onChange={(e) => updateProperty(index, 'zonalValue', parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      {showImprovement && (
        <div className="space-y-3 pt-1 border-t">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`improvement-${index}`}
              checked={prop.hasImprovement || false}
              onCheckedChange={(v) => {
                const isChecked = Boolean(v);
                updateProperty(index, 'hasImprovement', isChecked);
                if (!isChecked) updateProperty(index, 'improvementAmount', 0);
              }}
            />
            <Label htmlFor={`improvement-${index}`} className="text-xs cursor-pointer">🏗️ Has improvements / structure on property</Label>
          </div>
          {prop.hasImprovement && (
            <div className="pl-6 space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">Value of Improvements (₱) — added to Gross Estate & Family Home</Label>
              <Input type="number" placeholder="0.00" value={prop.improvementAmount ?? ''} onChange={(e) => updateProperty(index, 'improvementAmount', parseFloat(e.target.value) || 0)} />
            </div>
          )}
        </div>
      )}

      <div className="p-2 bg-secondary/5 rounded text-xs text-muted-foreground">
        <strong>Computed FMV = {formatCurrency(taxBase)}</strong> (higher of FMV vs Area × Zonal{showImprovement && prop.hasImprovement ? ' + Improvement' : ''})
      </div>

      {showCWT && taxBase > 0 && cwtInfo && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
          <div className="font-semibold text-amber-900">📋 Creditable Withholding Tax (CWT)</div>
          <div className="text-amber-800">
            Auto-computed rate: <strong>{cwtInfo.label}</strong>
          </div>
          <div className="text-amber-700">
            CWT Amount: <strong>{formatCurrency(taxBase * cwtInfo.rate)}</strong>
          </div>
          <div className="text-amber-600 text-xs mt-1">
            Based on BIR regulations: ≤₱500K → 1.5% | ₱500K–₱2M → 3.0% | &gt;₱2M → 5.0%
          </div>
        </div>
      )}
    </div>
  );
}

function EstateStockFields({ prop, index, updateProperty, dateOfDeath }) {
  const isListed = prop.stockListing === 'listed';
  const isNonListed = prop.stockListing === 'non-listed';
  const [pseError, setPseError] = useState('');
  const [pseLookupLoading, setPseLookupLoading] = useState(false);

  const handlePSELookup = async () => {
    if (!prop.stockTicker) { setPseError('Please enter a stock ticker first.'); return; }
    if (!dateOfDeath) { setPseError('Please enter the date of death first.'); return; }
    setPseLookupLoading(true);
    setPseError('');

    try {
      const prompt = `What was the closing price per share of ${prop.stockTicker} on the Philippine Stock Exchange (PSE) on ${dateOfDeath}? If that exact date was not a trading day, use the last available trading day before that date. Return only a valid JSON object with no markdown formatting, no backticks, no extra text. The JSON must have exactly these fields: price (number, closing price in PHP), date (string, actual trading date used in YYYY-MM-DD format), source (string, brief note about data source).`;

      const response = await fetch('/api/ai/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();

      if (result?.price && result.price > 0) {
        updateProperty(index, 'marketPriceAtDeath', result.price);
        setPseError(`✅ Price retrieved for ${result.date}: ₱${Number(result.price).toFixed(2)} — ${result.source}`);
      } else {
        setPseError('Could not retrieve price. Please enter manually.');
      }
    } catch (err) {
      console.error('AI lookup failed:', err);
      setPseError('Lookup failed. Please enter the price manually.');
    }

    setPseLookupLoading(false);
  };

  let computedValue = 0;
  if (isListed) {
    computedValue = (prop.marketPriceAtDeath || 0) * (prop.numberOfShares || 0);
  } else if (isNonListed) {
    if (prop.shareType === 'common') {
      const bvps = prop.outstandingShares > 0 ? (prop.shareholdersEquity || 0) / prop.outstandingShares : 0;
      computedValue = bvps * (prop.numberOfShares || 0);
    } else if (prop.shareType === 'preferred') {
      computedValue = (prop.parValue || 0) * (prop.numberOfShares || 0);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Company / Description</Label>
        <Input placeholder="Company name or description" value={prop.description || ''} onChange={(e) => updateProperty(index, 'description', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Stock Type</Label>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex-1">
            <Checkbox
              id={`listed-${index}`}
              checked={prop.stockListing === 'listed'}
              onCheckedChange={(v) => updateProperty(index, 'stockListing', v ? 'listed' : '')}
            />
            <Label htmlFor={`listed-${index}`} className="text-sm cursor-pointer text-amber-900">📈 Listed (PSE)</Label>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex-1">
            <Checkbox
              id={`nonlisted-${index}`}
              checked={prop.stockListing === 'non-listed'}
              onCheckedChange={(v) => updateProperty(index, 'stockListing', v ? 'non-listed' : '')}
            />
            <Label htmlFor={`nonlisted-${index}`} className="text-sm cursor-pointer text-amber-900">🏦 Non-Listed</Label>
          </div>
        </div>
      </div>

      {isListed && (
        <div className="space-y-3 p-3 bg-muted/20 rounded-lg border">
          <div className="text-xs font-semibold text-primary">📈 Listed Stock — FMV at Date of Death</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Stock Ticker (PSE Symbol)</Label>
              <Input placeholder="e.g. SM, BDO, ALI" value={prop.stockTicker || ''} onChange={(e) => updateProperty(index, 'stockTicker', e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">No. of Shares</Label>
              <Input type="number" placeholder="0" value={prop.numberOfShares || ''} onChange={(e) => updateProperty(index, 'numberOfShares', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Market Price at Date of Death (per share)</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="0.00" value={prop.marketPriceAtDeath || ''} onChange={(e) => updateProperty(index, 'marketPriceAtDeath', parseFloat(e.target.value) || 0)} />
              <button
                type="button"
                onClick={handlePSELookup}
                disabled={pseLookupLoading}
                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 whitespace-nowrap disabled:opacity-60"
              >
                {pseLookupLoading ? '⏳ Loading...' : '🔍 PSE Lookup'}
              </button>
            </div>
            {pseError && (
              <p className={`text-xs mt-1 ${pseError.startsWith('✅') ? 'text-green-700' : 'text-destructive'}`}>
                {pseError}
              </p>
            )}
          </div>
          <div className="p-2 bg-secondary/10 rounded text-xs">
            <strong>FMV = Market Price × Shares = {formatCurrency(computedValue)}</strong>
          </div>
        </div>
      )}

      {isNonListed && (
        <div className="space-y-3 p-3 bg-muted/20 rounded-lg border">
          <div className="text-xs font-semibold text-primary">🏦 Non-Listed Stock Valuation</div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Share Type</Label>
            <Select value={prop.shareType || ''} onValueChange={(v) => updateProperty(index, 'shareType', v)}>
              <SelectTrigger><SelectValue placeholder="Select share type..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Common Shares — Book Value</SelectItem>
                <SelectItem value="preferred">Preferred Shares — Par Value (AOI)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {prop.shareType === 'common' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Shareholders' Equity / Net Asset</Label>
                  <Input type="number" placeholder="0.00" value={prop.shareholdersEquity || ''} onChange={(e) => updateProperty(index, 'shareholdersEquity', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Total Outstanding Shares</Label>
                  <Input type="number" placeholder="0" value={prop.outstandingShares || ''} onChange={(e) => updateProperty(index, 'outstandingShares', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">No. of Shares (decedent)</Label>
                  <Input type="number" placeholder="0" value={prop.numberOfShares || ''} onChange={(e) => updateProperty(index, 'numberOfShares', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Book Value per Share (auto)</Label>
                  <Input type="number" readOnly value={prop.outstandingShares > 0 ? ((prop.shareholdersEquity || 0) / prop.outstandingShares).toFixed(4) : '0'} className="bg-muted/30" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs text-muted-foreground">Par Value / Share (₱) — for DST</Label>
                  <Input type="number" placeholder="0.00" value={prop.parValue || ''} onChange={(e) => updateProperty(index, 'parValue', parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <div className="p-2 bg-secondary/10 rounded text-xs">
                <strong>FMV = Book Value/Share × Shares = {formatCurrency(computedValue)}</strong>
              </div>
            </div>
          )}

          {prop.shareType === 'preferred' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Par Value per Share (per AOI)</Label>
                  <Input type="number" placeholder="0.00" value={prop.parValue || ''} onChange={(e) => updateProperty(index, 'parValue', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">No. of Shares (decedent)</Label>
                  <Input type="number" placeholder="0" value={prop.numberOfShares || ''} onChange={(e) => updateProperty(index, 'numberOfShares', parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <div className="p-2 bg-secondary/10 rounded text-xs">
                <strong>FMV = Par Value × Shares = {formatCurrency(computedValue)}</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EstateVehicleFields({ prop, index, updateProperty }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Plate Number</Label>
        <Input placeholder="Enter plate number" value={prop.plateNumber || ''} onChange={(e) => updateProperty(index, 'plateNumber', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Brand</Label>
        <Input placeholder="e.g. Toyota" value={prop.brand || ''} onChange={(e) => updateProperty(index, 'brand', e.target.value)} />
      </div>
      <div className="space-y-1.5 col-span-2">
        <Label className="text-xs text-muted-foreground">Vehicle Value</Label>
        <Input type="number" placeholder="0.00" value={prop.vehicleValue || ''} onChange={(e) => updateProperty(index, 'vehicleValue', parseFloat(e.target.value) || 0)} />
      </div>
    </div>
  );
}

function EstateSecuritiesFields({ prop, index, updateProperty }) {
  const [activeSolver, setActiveSolver] = useState(null); // 'gordon', 'bond', 'tvm', 'yields'

  // Gordon state
  const [gordonD1, setGordonD1] = useState(10);
  const [gordonR, setGordonR] = useState(12);
  const [gordonG, setGordonG] = useState(5);

  // Bond state
  const [bondF, setBondF] = useState(1000);
  const [bondC, setBondC] = useState(5); // annual coupon rate %
  const [bondR, setBondR] = useState(6); // annual discount rate %
  const [bondN, setBondN] = useState(5); // years
  const [bondM, setBondM] = useState(1); // frequency (1=annual, 2=semi, 4=quarterly)

  // TVM state
  const [tvmFV, setTvmFV] = useState(10000);
  const [tvmR, setTvmR] = useState(5);
  const [tvmN, setTvmN] = useState(5);

  // Yield state
  const [yieldCoupon, setYieldCoupon] = useState(50);
  const [yieldPrice, setYieldPrice] = useState(950);
  const [yieldFaceValue, setYieldFaceValue] = useState(1000);
  const [yieldYears, setYieldYears] = useState(5);
  const [yieldIncome, setYieldIncome] = useState(150);
  const [yieldBegPrice, setYieldBegPrice] = useState(1000);
  const [yieldEndPrice, setYieldEndPrice] = useState(1200);

  // Computations
  // 1. Gordon Model
  const rDecimal = gordonR / 100;
  const gDecimal = gordonG / 100;
  const gordonValid = rDecimal > gDecimal;
  const computedGordonPrice = gordonValid ? gordonD1 / (rDecimal - gDecimal) : 0;

  // 2. Bond PV Valuation
  const couponPayment = bondF * (bondC / 100);
  const periodCoupon = couponPayment / bondM;
  const periodRate = (bondR / 100) / bondM;
  const totalPeriods = bondN * bondM;
  let computedBondPrice = 0;
  if (periodRate > 0) {
    const pvOfCoupons = periodCoupon * ((1 - Math.pow(1 + periodRate, -totalPeriods)) / periodRate);
    const pvOfFace = bondF * Math.pow(1 + periodRate, -totalPeriods);
    computedBondPrice = pvOfCoupons + pvOfFace;
  } else {
    computedBondPrice = (periodCoupon * totalPeriods) + bondF;
  }

  // 3. TVM PV
  const computedTVMPV = tvmFV / Math.pow(1 + (tvmR / 100), tvmN);

  // 4. Yields
  const computedCurrentYield = yieldPrice > 0 ? (yieldCoupon / yieldPrice) * 100 : 0;
  
  const ytmNumerator = yieldCoupon + ((yieldFaceValue - yieldPrice) / (yieldYears || 1));
  const ytmDenominator = (yieldFaceValue + yieldPrice) / 2;
  const computedYTM = ytmDenominator > 0 ? (ytmNumerator / ytmDenominator) * 100 : 0;

  const priceChange = yieldEndPrice - yieldBegPrice;
  const computedRateOfReturn = yieldBegPrice > 0 ? ((yieldIncome + priceChange) / yieldBegPrice) * 100 : 0;

  React.useEffect(() => {
    if (!prop.securityType) updateProperty(index, 'securityType', 'equity');
    if (prop.securityQuantity === undefined) updateProperty(index, 'securityQuantity', 1);
    if (prop.securityUnitValue === undefined) updateProperty(index, 'securityUnitValue', 100);
    if (prop.securityAccruedInterest === undefined) updateProperty(index, 'securityAccruedInterest', 0);
  }, []);

  const quantity = parseFloat(prop.securityQuantity) || 0;
  const unitValue = parseFloat(prop.securityUnitValue) || 0;
  const accruedInterest = parseFloat(prop.securityAccruedInterest) || 0;
  const totalSecValue = (quantity * unitValue) + accruedInterest;

  return (
    <div className="space-y-4 pt-1">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Security Name / Issuer</Label>
        <Input placeholder="e.g. San Miguel Bonds, AAPL Common Stock" value={prop.description || ''} onChange={(e) => updateProperty(index, 'description', e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Security Category</Label>
        <div className="flex gap-2">
          {[
            { id: 'equity', label: 'Equity Securities', desc: 'Stocks, Shares' },
            { id: 'debt', label: 'Debt Securities', desc: 'Bonds, T-bills, Notes' },
            { id: 'derivative', label: 'Derivative Securities', desc: 'Options, Futures, Swaps' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => updateProperty(index, 'securityType', type.id)}
              className={`flex-1 text-left p-2.5 rounded-lg border text-xs transition-all ${
                prop.securityType === type.id
                  ? 'bg-primary/5 border-primary text-primary font-medium'
                  : 'bg-background border-border hover:border-primary/30 text-muted-foreground'
              }`}
            >
              <div className="font-semibold block">{type.label}</div>
              <div className="text-[10px] text-muted-foreground opacity-90 mt-0.5">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Quantity / Units Owned</Label>
          <Input type="number" placeholder="0" value={prop.securityQuantity || ''} onChange={(e) => updateProperty(index, 'securityQuantity', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Value Per Unit at Date of Death (₱)</Label>
          <Input type="number" placeholder="0.00" value={prop.securityUnitValue || ''} onChange={(e) => updateProperty(index, 'securityUnitValue', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Accrued Interest (optional) (₱)</Label>
          <Input type="number" placeholder="0.00" value={prop.securityAccruedInterest || ''} onChange={(e) => updateProperty(index, 'securityAccruedInterest', parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      <div className="p-3 bg-secondary/10 rounded-lg text-xs space-y-1 flex flex-col justify-center border border-secondary/20">
        <div className="text-muted-foreground font-medium flex items-center justify-between">
          <span>Security Valuation Formula:</span>
          <span>(Quantity × Value per Unit) + Accrued Interest</span>
        </div>
        <div className="text-sm font-bold text-primary flex items-center justify-between mt-1 pt-1 border-t border-secondary/10">
          <span>Total Asset Value:</span>
          <span>({quantity.toLocaleString()} × ₱{unitValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) + ₱{accruedInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = <span className="text-secondary">{formatCurrency(totalSecValue)}</span></span>
        </div>
      </div>

      {/* Interactive Solvers Accordion */}
      <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
        <div className="p-3 bg-muted/40 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Calculator className="w-4 h-4 text-secondary" />
            <span>🧮 Interactive Financial Solvers / Calculators</span>
          </div>
          <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-medium">Use formulas from your study notes</span>
        </div>
        <div className="p-3 space-y-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Need to solve or calculate the Unit Price of your Security using advanced financial models? Select a formula below to compute and automatically apply it to the form above.
          </p>

          <div className="flex flex-wrap gap-2 pb-1 border-b border-border/50">
            {[
              { id: 'gordon', label: 'Gordon Stock Model' },
              { id: 'bond', label: 'Bond Valuation' },
              { id: 'tvm', label: 'TVM (PV) Solver' },
              { id: 'yields', label: 'Yield & Return Solver' },
            ].map((solver) => (
              <button
                key={solver.id}
                type="button"
                onClick={() => setActiveSolver(activeSolver === solver.id ? null : solver.id)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                  activeSolver === solver.id
                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                    : 'bg-background hover:bg-muted text-muted-foreground border border-border'
                }`}
              >
                {solver.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeSolver === 'gordon' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-3 bg-background rounded-lg border border-border text-xs"
              >
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-secondary" />
                  <span>Gordon Growth Stock Valuation Model (Equity)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Valuates a stock assuming stable infinite growth. Formula: <strong>P₀ = D₁ / (r - g)</strong>
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Next Dividend (D₁)</Label>
                    <Input type="number" className="h-8 text-xs" value={gordonD1} onChange={(e) => setGordonD1(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Required Return (r %)</Label>
                    <Input type="number" className="h-8 text-xs" value={gordonR} onChange={(e) => setGordonR(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Growth Rate (g %)</Label>
                    <Input type="number" className="h-8 text-xs" value={gordonG} onChange={(e) => setGordonG(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="p-2.5 bg-secondary/5 rounded border border-secondary/10 space-y-1">
                  <div className="font-semibold text-[11px]">Step-by-Step Solving Process:</div>
                  <div className="font-mono text-[10px] space-y-0.5 text-muted-foreground">
                    <div>1. Convert rates to decimals: r = {gordonR}% = {rDecimal.toFixed(4)}, g = {gordonG}% = {gDecimal.toFixed(4)}</div>
                    <div>2. Compute denominator (r - g) = ({rDecimal.toFixed(4)} - {gDecimal.toFixed(4)}) = {(rDecimal - gDecimal).toFixed(4)}</div>
                    <div>3. Solve Stock Price P₀ = D₁ / (r - g) = {gordonD1} / {(rDecimal - gDecimal).toFixed(4)}</div>
                  </div>

                  {gordonValid ? (
                    <div className="text-xs font-semibold text-primary mt-2">
                      Computed Price per Share (P₀): <span className="text-secondary text-sm">₱{computedGordonPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-destructive mt-2">
                      ⚠️ Invalid parameters: Required Return (r) must be strictly greater than Growth Rate (g) for this model!
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  type="button"
                  className="w-full h-8 text-[11px]"
                  disabled={!gordonValid}
                  onClick={() => {
                    updateProperty(index, 'securityUnitValue', parseFloat(computedGordonPrice.toFixed(2)));
                    updateProperty(index, 'securityType', 'equity');
                  }}
                >
                  Apply ₱{computedGordonPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} to Security Unit Value
                </Button>
              </motion.div>
            )}

            {activeSolver === 'bond' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-3 bg-background rounded-lg border border-border text-xs"
              >
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Coins className="w-3.5 h-3.5 text-secondary" />
                  <span>Bond Valuation (Present Value of Cash Flows)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Bonds have value equal to the present value of all interest coupons + present value of face value principal repayment.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Face Value (F)</Label>
                    <Input type="number" className="h-8 text-xs" value={bondF} onChange={(e) => setBondF(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Coupon Rate (% pa)</Label>
                    <Input type="number" className="h-8 text-xs" value={bondC} onChange={(e) => setBondC(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Market Rate (% pa)</Label>
                    <Input type="number" className="h-8 text-xs" value={bondR} onChange={(e) => setBondR(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Years (n)</Label>
                    <Input type="number" className="h-8 text-xs" value={bondN} onChange={(e) => setBondN(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <Label className="text-[10px]">Frequency</Label>
                    <Select value={bondM.toString()} onValueChange={(v) => setBondM(parseInt(v))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Annual (1/yr)</SelectItem>
                        <SelectItem value="2">Semi-Annual (2/yr)</SelectItem>
                        <SelectItem value="4">Quarterly (4/yr)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-2.5 bg-secondary/5 rounded border border-secondary/10 space-y-1.5">
                  <div className="font-semibold text-[11px]">Step-by-Step Solving Process:</div>
                  <div className="font-mono text-[10px] space-y-0.5 text-muted-foreground leading-relaxed">
                    <div>1. Annual Interest Coupon Payment (C) = ₱{bondF.toLocaleString()} × {bondC}% = ₱{couponPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div>2. Period Coupon Payment = ₱{couponPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })} / {bondM} = ₱{periodCoupon.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div>3. Rate per Period = {bondR}% / {bondM} = {(periodRate * 100).toFixed(4)}% = {periodRate.toFixed(6)}</div>
                    <div>4. Total compounding periods = {bondN} years × {bondM} = {totalPeriods} periods</div>
                    <div>5. PV of Coupons Annuity = ₱{periodCoupon.toFixed(2)} × [ (1 - (1 + {periodRate.toFixed(4)})^-{totalPeriods}) / {periodRate.toFixed(6)} ] = ₱{(computedBondPrice - (bondF * Math.pow(1 + periodRate, -totalPeriods))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div>6. PV of Face Value Principal = ₱{bondF.toLocaleString()} / (1 + {periodRate.toFixed(4)})^{totalPeriods} = ₱{(bondF * Math.pow(1 + periodRate, -totalPeriods)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>

                  <div className="text-xs font-semibold text-primary mt-2">
                    Computed Bond Price per Unit: <span className="text-secondary text-sm">₱{computedBondPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  type="button"
                  className="w-full h-8 text-[11px]"
                  onClick={() => {
                    updateProperty(index, 'securityUnitValue', parseFloat(computedBondPrice.toFixed(2)));
                    updateProperty(index, 'securityType', 'debt');
                    // auto-apply accrued interest to make UX flawless
                    const yearsPassed = 0.5; // arbitrary default or can be accrued
                    const accrued = parseFloat(((couponPayment / bondM) * 0.5).toFixed(2));
                    updateProperty(index, 'securityAccruedInterest', accrued);
                  }}
                >
                  Apply ₱{computedBondPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} to Unit Value & Auto-accrue Period Interest
                </Button>
              </motion.div>
            )}

            {activeSolver === 'tvm' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-3 bg-background rounded-lg border border-border text-xs"
              >
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Calculator className="w-3.5 h-3.5 text-secondary" />
                  <span>Time Value of Money (PV Solver)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Finds the Present Value (current price) of a single future cash flow. Formula: <strong>PV = FV / (1 + r)ⁿ</strong>
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Future Value (FV)</Label>
                    <Input type="number" className="h-8 text-xs" value={tvmFV} onChange={(e) => setTvmFV(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Annual Rate (r %)</Label>
                    <Input type="number" className="h-8 text-xs" value={tvmR} onChange={(e) => setTvmR(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Periods / Years (n)</Label>
                    <Input type="number" className="h-8 text-xs" value={tvmN} onChange={(e) => setTvmN(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="p-2.5 bg-secondary/5 rounded border border-secondary/10 space-y-1">
                  <div className="font-semibold text-[11px]">Step-by-Step Solving Process:</div>
                  <div className="font-mono text-[10px] space-y-0.5 text-muted-foreground">
                    <div>1. Rate r = {tvmR}% = {(tvmR/100).toFixed(4)}</div>
                    <div>2. Compounding factor (1 + r)ⁿ = (1 + {(tvmR/100).toFixed(4)})^{tvmN} = {Math.pow(1 + (tvmR / 100), tvmN).toFixed(6)}</div>
                    <div>3. Solve PV = FV / factor = {tvmFV.toLocaleString()} / {Math.pow(1 + (tvmR / 100), tvmN).toFixed(6)}</div>
                  </div>

                  <div className="text-xs font-semibold text-primary mt-2">
                    Computed Present Value (PV): <span className="text-secondary text-sm">₱{computedTVMPV.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  type="button"
                  className="w-full h-8 text-[11px]"
                  onClick={() => {
                    updateProperty(index, 'securityUnitValue', parseFloat(computedTVMPV.toFixed(2)));
                  }}
                >
                  Apply ₱{computedTVMPV.toLocaleString(undefined, { maximumFractionDigits: 2 })} to Security Unit Value
                </Button>
              </motion.div>
            )}

            {activeSolver === 'yields' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-3 bg-background rounded-lg border border-border text-xs"
              >
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Percent className="w-3.5 h-3.5 text-secondary" />
                  <span>Yield and Rates of Return Calculations</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Explore and compute standard return metrics (Current Yield, Holding Return, YTM) based on your notes' equations.
                </p>

                <div className="space-y-3 pt-1">
                  {/* Part 1: Current Yield */}
                  <div className="p-2.5 bg-muted/40 rounded-lg border space-y-2">
                    <div className="font-semibold text-primary flex items-center justify-between text-[11px]">
                      <span>A. Current Yield (Bond Income Measure)</span>
                      <span className="font-mono text-secondary">{computedCurrentYield.toFixed(2)}%</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Current Yield = Annual Coupon Payment ÷ Current Bond Price
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[9px]">Annual Coupon (₱)</Label>
                        <Input type="number" className="h-7 text-[11px]" value={yieldCoupon} onChange={(e) => setYieldCoupon(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px]">Current Price (₱)</Label>
                        <Input type="number" className="h-7 text-[11px]" value={yieldPrice} onChange={(e) => setYieldPrice(parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                    <div className="text-[10px] text-green-700 font-medium">
                      Math: ₱{yieldCoupon} ÷ ₱{yieldPrice} = {(yieldCoupon / (yieldPrice || 1)).toFixed(6)} → {computedCurrentYield.toFixed(2)}%
                    </div>
                  </div>

                  {/* Part 2: Yield to Maturity (YTM) Approximator */}
                  <div className="p-2.5 bg-muted/40 rounded-lg border space-y-2">
                    <div className="font-semibold text-primary flex items-center justify-between text-[11px]">
                      <span>B. Yield to Maturity (YTM) Approximator (From Slide 3)</span>
                      <span className="font-mono text-secondary">{computedYTM.toFixed(2)}%</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                      YTM ≈ [ Annual Interest + (Face Value - Price) / Years ] ÷ [ (Face Value + Price) / 2 ]
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[9px]">Face Value (₱)</Label>
                        <Input type="number" className="h-7 text-[11px]" value={yieldFaceValue} onChange={(e) => setYieldFaceValue(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px]">Current Price (₱)</Label>
                        <Input type="number" className="h-7 text-[11px]" value={yieldPrice} onChange={(e) => setYieldPrice(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px]">Years Left</Label>
                        <Input type="number" className="h-7 text-[11px]" value={yieldYears} onChange={(e) => setYieldYears(parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                    <div className="text-[10px] text-green-700 font-medium space-y-0.5">
                      <div>Numerator: ₱{yieldCoupon} + (₱{yieldFaceValue} - ₱{yieldPrice}) / {yieldYears} = ₱{ytmNumerator.toFixed(2)}</div>
                      <div>Denominator: (₱{yieldFaceValue} + ₱{yieldPrice}) / 2 = ₱{ytmDenominator.toFixed(2)}</div>
                      <div>YTM ≈ ₱{ytmNumerator.toFixed(2)} ÷ ₱{ytmDenominator.toFixed(2)} = {computedYTM.toFixed(2)}%</div>
                    </div>
                  </div>

                  {/* Part 3: Rate of Return */}
                  <div className="p-2.5 bg-muted/40 rounded-lg border space-y-2">
                    <div className="font-semibold text-primary flex items-center justify-between text-[11px]">
                      <span>C. Rate of Return (Holding Period Return)</span>
                      <span className="font-mono text-secondary">{computedRateOfReturn.toFixed(2)}%</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Rate of Return = (Income + Price Change) ÷ Beginning Price
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[9px]">Income (₱)</Label>
                        <Input type="number" className="h-7 text-[11px]" value={yieldIncome} onChange={(e) => setYieldIncome(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px]">Beg. Price (₱)</Label>
                        <Input type="number" className="h-7 text-[11px]" value={yieldBegPrice} onChange={(e) => setYieldBegPrice(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px]">End Price (₱)</Label>
                        <Input type="number" className="h-7 text-[11px]" value={yieldEndPrice} onChange={(e) => setYieldEndPrice(parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                    <div className="text-[10px] text-green-700 font-medium font-mono">
                      Price Change = ₱{yieldEndPrice} - ₱{yieldBegPrice} = ₱{priceChange}
                      <br />
                      HPR = (₱{yieldIncome} + ₱{priceChange}) ÷ ₱{yieldBegPrice} = {computedRateOfReturn.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}