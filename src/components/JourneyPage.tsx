import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileDown, FileText, Calendar as CalendarIcon, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDateInUserTimezone } from "@/lib/timezone";
import type { Child } from "@/pages/Dashboard";

type JourneyPageProps = {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
};

type DailySummary = {
  id: string;
  summary_date: string;
  score: number;
  evolution_status: 'improved' | 'regressed' | 'neutral';
  insights: string[];
  alerts: string[];
  comparison_data: {
    previous_score: number | null;
    score_difference: number | null;
  };
};

export function JourneyPage({ children, selectedChild, onSelectChild }: JourneyPageProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedChild) {
      fetchSummaries();
    }
  }, [selectedChild]);

  const fetchSummaries = async () => {
    if (!selectedChild) return;

    setLoading(true);
    try {
      let query = supabase
        .from('daily_summary')
        .select('*')
        .eq('child_id', selectedChild.id)
        .order('summary_date', { ascending: false });

      if (startDate && endDate) {
        query = query.gte('summary_date', startDate).lte('summary_date', endDate);
      } else {
        // Default: last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte('summary_date', sevenDaysAgo.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSummaries((data as unknown) as DailySummary[]);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast.error('Erro ao carregar resumos');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      toast.error('Data inicial não pode ser maior que data final');
      return;
    }
    fetchSummaries();
  };

  const handleExportPDF = (summary: DailySummary) => {
    toast.info('Funcionalidade de exportação PDF em desenvolvimento');
  };

  const handleSendEmail = (summary: DailySummary) => {
    toast.info('Funcionalidade de envio por email em desenvolvimento');
  };

  const getEvolutionIcon = (status: string) => {
    switch (status) {
      case 'improved':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'regressed':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getEvolutionLabel = (status: string) => {
    switch (status) {
      case 'improved':
        return 'Melhorou';
      case 'regressed':
        return 'Piorou';
      default:
        return 'Neutro';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!selectedChild) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">Nenhuma Criança Selecionada</h3>
          <p className="text-muted-foreground">Por favor, selecione uma criança para ver sua jornada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Jornada & Relatórios</h1>
            <p className="text-muted-foreground">Resumos automáticos para {selectedChild.name}</p>
          </div>

          <Select
            value={selectedChild?.id || ""}
            onValueChange={(value) => {
              const child = children.find((c) => c.id === value);
              if (child) onSelectChild(child);
            }}
          >
            <SelectTrigger className="mt-4 sm:mt-0 w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Alert about daily journey availability */}
        <Alert className="mb-8 bg-primary/10 border-primary/30">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <AlertDescription className="ml-2 text-foreground">
            <div className="space-y-2">
              <p className="font-bold text-lg">
                A JORNADA DO DIA FICARÁ DISPONÍVEL AQUI ÀS 11:59PM.
              </p>
              <p className="text-sm">
                PARA CONSULTAR A JORNADA DE DIAS ANTERIORES, USE O FILTRO DE DATAS ABAIXO.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Date Range Filter */}
        <Card className="shadow-card border-border mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Filtrar por Período</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Data Inicial</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Data Final</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleApplyFilter} className="w-full sm:w-auto">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Aplicar Filtro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summaries List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando resumos...</p>
          </div>
        ) : summaries.length === 0 ? (
          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-medium text-foreground mb-2">Nenhum Resumo Disponível</h4>
                <p className="text-muted-foreground">
                  Os resumos são gerados automaticamente às 11:59 PM todos os dias
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {summaries.map((summary) => (
              <Card key={summary.id} className="shadow-card border-border">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {formatDateInUserTimezone(summary.summary_date)}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getEvolutionIcon(summary.evolution_status)}
                        <span className="text-sm font-medium">{getEvolutionLabel(summary.evolution_status)}</span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 text-right">
                      <div className={`text-4xl font-bold ${getScoreColor(summary.score)}`}>
                        {summary.score.toFixed(0)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Score do Dia</p>
                    </div>
                  </div>

                  {/* Score Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">Progresso Geral</span>
                      {summary.comparison_data.previous_score && (
                        <span className="text-sm text-muted-foreground">
                          {summary.comparison_data.score_difference! > 0 ? '+' : ''}
                          {summary.comparison_data.score_difference?.toFixed(1)}% vs dia anterior
                        </span>
                      )}
                    </div>
                    <Progress value={summary.score} className="h-3" />
                  </div>

                  {/* Alerts */}
                  {summary.alerts.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Alertas
                      </h4>
                      <div className="space-y-2">
                        {summary.alerts.map((alert, idx) => (
                          <Alert key={idx} className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                            <AlertDescription className="text-sm">{alert}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {summary.insights.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-500" />
                        Insights
                      </h4>
                      <div className="space-y-2">
                        {summary.insights.map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                            <span>{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPDF(summary)}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Baixar PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendEmail(summary)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar por Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
