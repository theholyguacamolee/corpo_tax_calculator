import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileDown, Save, Landmark } from 'lucide-react';
import { computeEstateTax } from '@/lib/taxComputations';
import { generateTaxPDF } from '@/lib/pdfGenerator';
import { saveCalculation } from '@/lib/calculationsService';
import { useToast } from '@/components/ui/use-toast';
import EstateDeceasedForm from './EstateDeceasedForm';
import EstatePropertyForm from './EstatePropertyForm';
import TaxResultsDisplay from './TaxResultsDisplay';

export default function EstateTab() {
  const [deceasedInfo, setDeceasedInfo] = useState({});
  const [properties, setProperties] = useState([]);
  const [isMarried, setIsMarried] = useState(false);
  const [ordinaryDeductions, setOrdinaryDeductions] = useState({
    claimsAgainstEstate: 0,
    unpairedMortgage: 0,
    taxes: 0,
    lossesIncurredDuringSettlement: 0,
  });
  const [results, setResults] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const hasFamilyHome = properties.some(p => p.isFamilyHome);

  const updateDeduction = (field, value) => {
    setOrdinaryDeductions(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const totalOrdinaryDeductions = Object.values(ordinaryDeductions).reduce((a, b) => a + b, 0);

  const isActuallyMarried = isMarried || deceasedInfo?.civilStatus === 'married';

  const handleCompute = () => {
    const heirsList = deceasedInfo.heirs || [''];

    const res = computeEstateTax({
      dateOfDeath: deceasedInfo.dateOfDeath,
      properties,
      isMarried: isActuallyMarried,
      propertyRegime: deceasedInfo.propertyRegime || 'acp',
      ordinaryDeductions: totalOrdinaryDeductions,
      heirs: heirsList,
    });
    setResults(res);
  };

  const handleDownload = () => {
    generateTaxPDF({
      computation_type: 'estate',
      seller_info: deceasedInfo,
      property_details: { properties },
      computation_result: results,
      ordinaryDeductions,
    });
  };

  const handleSaveToHistory = async () => {
    setIsSaving(true);
    try {
      await saveCalculation({
        computationType: 'estate',
        partyInfo: { deceasedInfo },
        propertyDetails: { properties, isMarried: isActuallyMarried, ordinaryDeductions },
        results,
      });
      toast({ title: 'Saved', description: 'This calculation was added to your history.' });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Save failed',
        description: err.message || 'Could not save this calculation to Supabase.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Deceased Information */}
      <EstateDeceasedForm
        data={deceasedInfo}
        onChange={(info) => {
          setDeceasedInfo(info);
          if (info.civilStatus === 'married') {
            setIsMarried(true);
          }
        }}
      />

      {/* Marital Status */}
      <Card className="border-2 border-border/50 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isMarried"
              checked={isActuallyMarried}
              onCheckedChange={(v) => {
                const checked = Boolean(v);
                setIsMarried(checked);
                if (!checked && deceasedInfo.civilStatus === 'married') {
                  setDeceasedInfo({ ...deceasedInfo, civilStatus: 'single' });
                }
              }}
            />
            <Label htmlFor="isMarried" className="text-sm cursor-pointer">
              Deceased was married (conjugal/community property — 50% surviving spouse share deduction applied)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Properties */}
      <Card className="border-2 border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
            <Landmark className="w-5 h-5 text-secondary" />
            Estate Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EstatePropertyForm
            properties={properties}
            onChange={setProperties}
            hasFamilyHome={hasFamilyHome}
            dateOfDeath={deceasedInfo.dateOfDeath}
          />
        </CardContent>
      </Card>

      {/* Ordinary Deductions */}
      <Card className="border-2 border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-primary">
            Ordinary Deductions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Claims Against the Estate (₱)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={ordinaryDeductions.claimsAgainstEstate || ''}
                onChange={(e) => updateDeduction('claimsAgainstEstate', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Unpaid Mortgage / Indebtedness (₱)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={ordinaryDeductions.unpairedMortgage || ''}
                onChange={(e) => updateDeduction('unpairedMortgage', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Unpaid Taxes (₱)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={ordinaryDeductions.taxes || ''}
                onChange={(e) => updateDeduction('taxes', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Losses During Settlement (₱)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={ordinaryDeductions.lossesIncurredDuringSettlement || ''}
                onChange={(e) => updateDeduction('lossesIncurredDuringSettlement', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleCompute} className="w-full">
        Compute Estate Tax
      </Button>

      {results && (
        <>
          <TaxResultsDisplay results={results} title="Estate Tax Computation" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={handleDownload} variant="outline" className="w-full">
              <FileDown className="mr-2 h-4 w-4" /> Download BIR Form 1801
            </Button>
            <Button onClick={handleSaveToHistory} disabled={isSaving} variant="outline" className="w-full">
              <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving…' : 'Save to History'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}