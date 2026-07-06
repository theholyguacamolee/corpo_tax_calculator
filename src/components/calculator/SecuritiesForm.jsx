import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Coins, Calculator, TrendingUp, Percent, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/taxComputations';

export default function SecuritiesForm({ data, onChange, mode }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  // Initial values setup via simple fallback
  const securityType = data?.securityType || 'equity';
  const quantity = parseFloat(data?.securityQuantity) || 1;
  const unitValue = parseFloat(data?.securityUnitValue) || 100;
  const accruedInterest = parseFloat(data?.securityAccruedInterest) || 0;
  const acquisitionCost = parseFloat(data?.acquisitionCost) || 0;
  const totalSecValue = (quantity * unitValue) + accruedInterest;

  // Solver local states
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

  // Net Gain for Sale mode
  const netGain = totalSecValue - acquisitionCost;

  return (
    <Card className="border-2 border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
          <Coins className="w-5 h-5 text-secondary" />
          Securities Details ({mode === 'sale' ? 'Sale Valuation' : 'Donation Valuation'})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Security Name / Issuer</Label>
          <Input 
            placeholder="e.g. San Miguel Bonds, AAPL Common Stock, Custom derivatives" 
            value={data?.description || ''} 
            onChange={(e) => update('description', e.target.value)} 
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Security Category</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            {[
              { id: 'equity', label: 'Equity Securities', desc: 'Stocks, Shares' },
              { id: 'debt', label: 'Debt Securities', desc: 'Bonds, T-bills, Notes' },
              { id: 'derivative', label: 'Derivative Securities', desc: 'Options, Futures, Swaps' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => update('securityType', type.id)}
                className={`flex-1 text-left p-2.5 rounded-lg border text-xs transition-all ${
                  securityType === type.id
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
            <Input 
              type="number" 
              placeholder="1" 
              value={data?.securityQuantity ?? ''} 
              onChange={(e) => update('securityQuantity', parseFloat(e.target.value) || 0)} 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {mode === 'sale' ? 'Value/Price Per Unit (₱)' : 'Fair Market Value Per Unit (₱)'}
            </Label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={data?.securityUnitValue ?? ''} 
              onChange={(e) => update('securityUnitValue', parseFloat(e.target.value) || 0)} 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Accrued Interest / Premium (₱)</Label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={data?.securityAccruedInterest ?? ''} 
              onChange={(e) => update('securityAccruedInterest', parseFloat(e.target.value) || 0)} 
            />
          </div>
        </div>

        {mode === 'sale' && (
          <div className="space-y-1.5 pt-2 border-t">
            <Label className="text-xs text-muted-foreground font-semibold">
              Total Acquisition Cost (₱) — total original purchase price of all units
            </Label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={data?.acquisitionCost ?? ''} 
              onChange={(e) => update('acquisitionCost', parseFloat(e.target.value) || 0)} 
            />
            <p className="text-[11px] text-muted-foreground">
              Used to compute the Capital Gains Tax (CGT) on any positive net capital gains.
            </p>
          </div>
        )}

        {/* Dynamic Formula Display */}
        <div className="p-3 bg-secondary/10 rounded-lg text-xs space-y-1 flex flex-col justify-center border border-secondary/20">
          <div className="text-muted-foreground font-medium flex items-center justify-between">
            <span>Valuation Base Formula:</span>
            <span>(Quantity × Value per Unit) + Accrued Interest</span>
          </div>
          <div className="text-sm font-bold text-primary flex items-center justify-between mt-1 pt-1 border-t border-secondary/10">
            <span>{mode === 'sale' ? 'Total Selling Price:' : 'Total Fair Market Value:'}</span>
            <span>
              ({quantity.toLocaleString()} × ₱{unitValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) + ₱{accruedInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = <span className="text-secondary">{formatCurrency(totalSecValue)}</span>
            </span>
          </div>
          {mode === 'sale' && acquisitionCost > 0 && (
            <div className={`text-xs font-semibold px-2 py-1 rounded mt-1.5 flex items-center justify-between ${netGain >= 0 ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
              <span>Net Capital Gain:</span>
              <span>₱{netGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>

        {/* Interactive Solvers Box */}
        <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
          <div className="p-3 bg-muted/40 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Calculator className="w-4 h-4 text-secondary" />
              <span>🧮 Interactive Financial Solvers / Calculators</span>
            </div>
            <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-medium">Study formulas embedded</span>
          </div>
          <div className="p-3 space-y-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Use standard financial equations to find and apply unit values automatically.
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
                      update('securityUnitValue', parseFloat(computedGordonPrice.toFixed(2)));
                      update('securityType', 'equity');
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
                      update('securityUnitValue', parseFloat(computedBondPrice.toFixed(2)));
                      update('securityType', 'debt');
                      // Auto-accrue coupon interest for outstanding UX
                      const accrued = parseFloat(((couponPayment / bondM) * 0.5).toFixed(2));
                      update('securityAccruedInterest', accrued);
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
                      update('securityUnitValue', parseFloat(computedTVMPV.toFixed(2)));
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
                    Explore and compute standard return metrics (Current Yield, Holding Return, YTM) based on study notes' equations.
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
                    </div>

                    {/* Part 2: Yield to Maturity (YTM) Approximator */}
                    <div className="p-2.5 bg-muted/40 rounded-lg border space-y-2">
                      <div className="font-semibold text-primary flex items-center justify-between text-[11px]">
                        <span>B. Yield to Maturity (YTM) Approximator</span>
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
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-secondary/5 rounded-lg border border-secondary/20">
          <Info className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong>Transfer Valuation Rule:</strong> For non-listed shares & bonds, taxes are evaluated on standard capital gains (15% CGT) or on donor's tax rules (6% Donor's Tax with a ₱250k annual exemption) with 0.75% Documentary Stamp Tax (DST) on the total value.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
