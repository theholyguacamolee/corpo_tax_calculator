import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { History, Trash2, RefreshCw, Building2, Gift, Landmark, Inbox } from 'lucide-react';
import { formatCurrency } from '@/lib/taxComputations';
import { listCalculations, deleteCalculation } from '@/lib/calculationsService';
import { useToast } from '@/components/ui/use-toast';
import TaxResultsDisplay from './TaxResultsDisplay';

const typeMeta = {
  sale: { label: 'Sale', icon: Building2 },
  donation: { label: 'Donation', icon: Gift },
  estate: { label: 'Estate', icon: Landmark },
};

export default function CalculationHistory() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listCalculations({ limit: 100 });
      setItems(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load saved calculations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    try {
      await deleteCalculation(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({ title: 'Deleted', description: 'The saved calculation was removed.' });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Delete failed',
        description: err.message || 'Could not delete this calculation.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <History className="w-5 h-5 text-secondary" />
          Saved Calculations
        </h2>
        <Button variant="outline" size="sm" onClick={load} disabled={isLoading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-2 border-destructive/30">
          <CardContent className="pt-4 text-sm text-destructive">
            {error}
            <div className="text-xs text-muted-foreground mt-1">
              Check that VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set and the{' '}
              <code>tax_calculations</code> table exists (see supabase/schema.sql).
            </div>
          </CardContent>
        </Card>
      )}

      {!error && !isLoading && items.length === 0 && (
        <Card className="border-2 border-dashed border-border/60">
          <CardContent className="py-10 text-center text-muted-foreground">
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No saved calculations yet.</p>
            <p className="text-xs mt-1">Compute a tax in the Sale, Donation, or Estate tab, then hit "Save to History".</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {items.map((item, index) => {
            const meta = typeMeta[item.computation_type] || { label: item.computation_type, icon: History };
            const Icon = meta.icon;
            const isExpanded = expandedId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
              >
                <Card className="border-2 border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader
                    className="pb-3 cursor-pointer select-none"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 text-secondary shrink-0" />
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-semibold text-primary truncate">
                            {item.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(item.created_at).toLocaleString('en-PH')} • {item.created_by}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary">{meta.label}</Badge>
                        <span className="font-bold text-sm text-secondary whitespace-nowrap">
                          {formatCurrency(item.total_tax)}
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this calculation?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{item.title}" will be permanently removed. This can't be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <TaxResultsDisplay results={item.computation_result} title="Saved Result" />
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
