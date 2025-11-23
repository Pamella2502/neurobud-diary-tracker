import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FileDown, FileText, Calendar as CalendarIcon, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDateInUserTimezone } from "@/lib/timezone";
import type { Child } from "@/pages/Dashboard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  insights: Array<{text: string; title: string}>;
  alerts: string[];
  comparison_data: {
    previous_score: number | null;
    score_difference: number | null;
  };
};

type DailyRecord = {
  id: string;
  record_date: string;
  sleep_data: any;
  mood_data: any;
  nutrition_data: any;
  medication_data: any;
  activity_data: any;
  crisis_data: any;
  incident_data: any;
  hyperfocus_data: any;
  extra_notes: string;
};

type CombinedDayReport = {
  summary: DailySummary;
  record: DailyRecord | null;
};

// Helper function to check if an object has any meaningful data
const hasData = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  
  return Object.values(obj).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return hasData(value);
    return value !== null && value !== undefined && value !== '';
  });
};

export function JourneyPage({ children, selectedChild, onSelectChild }: JourneyPageProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reports, setReports] = useState<CombinedDayReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedChild) {
      fetchReports();
    }
  }, [selectedChild]);

  const fetchReports = async () => {
    if (!selectedChild) return;

    setLoading(true);
    try {
      let summaryQuery = supabase
        .from('daily_summary')
        .select('*')
        .eq('child_id', selectedChild.id)
        .order('summary_date', { ascending: false });

      if (startDate && endDate) {
        summaryQuery = summaryQuery.gte('summary_date', startDate).lte('summary_date', endDate);
      } else {
        // Default: last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        summaryQuery = summaryQuery.gte('summary_date', sevenDaysAgo.toISOString().split('T')[0]);
      }

      const { data: summaries, error: summaryError } = await summaryQuery;

      if (summaryError) throw summaryError;

      // Fetch corresponding daily records for each summary
      const combinedReports: CombinedDayReport[] = await Promise.all(
        (summaries as unknown as DailySummary[]).map(async (summary) => {
          const { data: record, error: recordError } = await supabase
            .from('daily_records')
            .select('*')
            .eq('child_id', selectedChild.id)
            .eq('record_date', summary.summary_date)
            .maybeSingle();

          if (recordError) console.error('Error fetching record:', recordError);

          return {
            summary,
            record: record as DailyRecord | null,
          };
        })
      );

      setReports(combinedReports);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      toast.error('Data inicial não pode ser maior que data final');
      return;
    }
    fetchReports();
  };

  const handleExportPDF = (report: CombinedDayReport) => {
    toast.info('Funcionalidade de exportação PDF em desenvolvimento');
  };

  const handleSendEmail = (report: CombinedDayReport) => {
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

  // Generate trend data for line chart (multiple days)
  const generateTrendData = () => {
    return reports.map(r => ({
      date: formatDateInUserTimezone(r.summary.summary_date).split(',')[0], // Short date
      score: r.summary.score,
    })).reverse(); // Chronological order
  };

  // Calculate trend indicator for a specific metric
  const getTrendIndicator = (current: number, previous: number | null) => {
    if (previous === null || previous === undefined) return '➡';
    const diff = current - previous;
    if (diff > 5) return '⬆'; // Improved
    if (diff < -5) return '⬇'; // Worsened
    return '➡'; // Stable
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
            <p className="text-muted-foreground">Relatórios automáticos para {selectedChild.name}</p>
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

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        ) : reports.length === 0 ? (
          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-medium text-foreground mb-2">Nenhum Relatório Disponível</h4>
                <p className="text-muted-foreground">
                  Os relatórios são gerados automaticamente às 11:59 PM todos os dias
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Trend Chart - Shows evolution across all reports */}
            {reports.length > 1 && (
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📈 Tendência de Evolução
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={generateTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                        name="Pontuação"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {reports.map((report, reportIndex) => {
              const { summary, record } = report;
              const previousReport = reportIndex < reports.length - 1 ? reports[reportIndex + 1] : null;

              return (
                <Card key={summary.id} className="shadow-card border-border">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                          📊 Relatório Diário - {selectedChild.name}
                        </h2>
                        <h3 className="text-xl text-foreground mb-1">
                          {formatDateInUserTimezone(summary.summary_date)}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getEvolutionIcon(summary.evolution_status)}
                          <span className="text-sm font-medium">{getEvolutionLabel(summary.evolution_status)}</span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(summary.score)}`}>
                          {summary.score.toFixed(0)}/100
                        </div>
                        <p className="text-sm text-muted-foreground">Pontuação do Dia</p>
                      </div>
                    </div>

                    {/* Score Progress */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">Progresso Geral</span>
                        {summary.comparison_data.previous_score && (
                          <span className="text-sm text-muted-foreground">
                            {summary.comparison_data.score_difference! > 0 ? '↗️ +' : '↘️ '}
                            {summary.comparison_data.score_difference?.toFixed(1)} pontos vs dia anterior
                          </span>
                        )}
                      </div>
                      <Progress value={summary.score} className="h-3" />
                    </div>

                    {/* Alerts */}
                    {summary.alerts.length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                          🚨 Alertas Automáticos
                        </h4>
                        <div className="space-y-2">
                          {summary.alerts.map((alert, idx) => (
                            <Alert key={idx} className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <AlertDescription className="ml-2 text-sm">{alert}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Insights */}
                    {summary.insights.length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                          💡 Insights do Dia
                        </h4>
                        <div className="space-y-2">
                          {summary.insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm text-foreground bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                              <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                {insight.title && <p className="font-semibold mb-1">{insight.title}</p>}
                                <span>{insight.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Simple Indicators Section */}
                    {record && previousReport && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-foreground mb-4">📊 Indicadores de Tendência</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Score Trend */}
                          <Card className="border-muted">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Pontuação Geral</p>
                                  <p className="text-2xl font-bold text-foreground">{summary.score.toFixed(0)}</p>
                                </div>
                                <div className="text-3xl">
                                  {getTrendIndicator(summary.score, previousReport.summary.score)}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Sleep Quality Trend */}
                          {record.sleep_data?.quality && previousReport?.record?.sleep_data?.quality && (
                            <Card className="border-muted">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Qualidade do Sono</p>
                                    <p className="text-base font-semibold text-foreground">{record.sleep_data.quality}</p>
                                  </div>
                                  <div className="text-3xl">
                                    {(() => {
                                      const qualityMap: { [key: string]: number } = {
                                        'Excellent': 5, 'Good': 4, 'Regular': 3, 'Poor': 2, 'Terrible': 1, 'Did not sleep': 0
                                      };
                                      const current = qualityMap[record.sleep_data.quality] || 0;
                                      const previous = qualityMap[previousReport?.record?.sleep_data?.quality || ''] || 0;
                                      return getTrendIndicator(current * 20, previous * 20);
                                    })()}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Mood Trend */}
                          {record.mood_data && previousReport?.record?.mood_data && (
                            <Card className="border-muted">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Humor Geral</p>
                                    <p className="text-base font-semibold text-foreground">
                                      {['morning', 'afternoon', 'evening'].filter(p => record.mood_data[p]?.mood).length} registros
                                    </p>
                                  </div>
                                  <div className="text-3xl">
                                    {(() => {
                                      const moodMap: { [key: string]: number } = {
                                        'Happy': 5, 'Calm': 4, 'Normal': 3, 'Sad': 2, 'Irritated': 2, 'Anxious': 2, 'Agitated': 1
                                      };
                                      const currentMoods = ['morning', 'afternoon', 'evening']
                                        .map(p => moodMap[record.mood_data[p]?.mood] || 0)
                                        .filter(v => v > 0);
                                      const previousMoods = ['morning', 'afternoon', 'evening']
                                        .map(p => moodMap[previousReport?.record?.mood_data?.[p]?.mood] || 0)
                                        .filter(v => v > 0);
                                      
                                      const currentAvg = currentMoods.length ? currentMoods.reduce((a, b) => a + b, 0) / currentMoods.length : 0;
                                      const previousAvg = previousMoods.length ? previousMoods.reduce((a, b) => a + b, 0) / previousMoods.length : 0;
                                      
                                      return getTrendIndicator(currentAvg * 20, previousAvg * 20);
                                    })()}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Crisis Trend */}
                          {record.crisis_data && previousReport?.record?.crisis_data && (
                            <Card className="border-muted">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Crises</p>
                                    <p className="text-base font-semibold text-foreground">
                                      {(() => {
                                        let count = 0;
                                        ['morning', 'afternoon', 'evening'].forEach(p => {
                                          if (Array.isArray(record.crisis_data[p])) count += record.crisis_data[p].length;
                                        });
                                        return count;
                                      })()} episódios
                                    </p>
                                  </div>
                                  <div className="text-3xl">
                                    {(() => {
                                      let currentCount = 0;
                                      let previousCount = 0;
                                      ['morning', 'afternoon', 'evening'].forEach(p => {
                                        if (Array.isArray(record.crisis_data[p])) currentCount += record.crisis_data[p].length;
                                        if (Array.isArray(previousReport?.record?.crisis_data?.[p])) previousCount += previousReport.record.crisis_data[p].length;
                                      });
                                      // Inverted: fewer crises = improvement
                                      const current = Math.max(0, 100 - (currentCount * 20));
                                      const previous = Math.max(0, 100 - (previousCount * 20));
                                      return getTrendIndicator(current, previous);
                                    })()}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Detailed Records Section */}
                    {record && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">📋 Registros Detalhados do Dia</h4>
                        <div className="space-y-6">
                          {/* Sleep Record */}
                          {hasData(record.sleep_data) && (
                            <Card className="border-muted">
                              <CardHeader>
                                <CardTitle className="flex items-center text-base">
                                  <span className="mr-2">💤</span> Sono
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {record.sleep_data.quality && (
                                    <div>
                                      <label className="block text-sm font-medium text-muted-foreground mb-1">Qualidade</label>
                                      <p className="text-foreground">{record.sleep_data.quality}</p>
                                    </div>
                                  )}
                                  {record.sleep_data.bedtime && (
                                    <div>
                                      <label className="block text-sm font-medium text-muted-foreground mb-1">Horário de Dormir</label>
                                      <p className="text-foreground">{record.sleep_data.bedtime}</p>
                                    </div>
                                  )}
                                  {record.sleep_data.wakeTime && (
                                    <div>
                                      <label className="block text-sm font-medium text-muted-foreground mb-1">Horário de Acordar</label>
                                      <p className="text-foreground">{record.sleep_data.wakeTime}</p>
                                    </div>
                                  )}
                                  {record.sleep_data.timeToSleep && (
                                    <div>
                                      <label className="block text-sm font-medium text-muted-foreground mb-1">Tempo para Adormecer</label>
                                      <p className="text-foreground">{record.sleep_data.timeToSleep} minutos</p>
                                    </div>
                                  )}
                                  {record.sleep_data.wokeUpDuringSleep && (
                                    <div>
                                      <label className="block text-sm font-medium text-muted-foreground mb-1">Acordou Durante o Sono</label>
                                      <p className="text-foreground">Sim</p>
                                    </div>
                                  )}
                                  {record.sleep_data.wakeUpReason && (
                                    <div>
                                      <label className="block text-sm font-medium text-muted-foreground mb-1">Motivo do Despertar</label>
                                      <p className="text-foreground">{record.sleep_data.wakeUpReason}</p>
                                    </div>
                                  )}
                                </div>
                                {record.sleep_data.notes && (
                                  <div className="mt-4">
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Observações</label>
                                    <p className="text-foreground whitespace-pre-wrap">{record.sleep_data.notes}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* Mood Record */}
                          {hasData(record.mood_data) && (
                            <Card className="border-muted">
                              <CardHeader>
                                <CardTitle className="flex items-center text-base">
                                  <span className="mr-2">😊</span> Humor
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {['morning', 'afternoon', 'evening'].map((period) => (
                                    record.mood_data[period] && (
                                      <div key={period} className="border rounded-lg p-3">
                                        <label className="block text-sm font-medium text-muted-foreground mb-2 capitalize">
                                          {period === 'morning' ? 'Manhã' : period === 'afternoon' ? 'Tarde' : 'Noite'}
                                        </label>
                                        <p className="text-foreground font-semibold">{record.mood_data[period].mood || "Não registrado"}</p>
                                        {record.mood_data[period].notes && (
                                          <p className="text-sm text-muted-foreground mt-2">{record.mood_data[period].notes}</p>
                                        )}
                                      </div>
                                    )
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Nutrition Record */}
                          {hasData(record.nutrition_data) && (
                            <Card className="border-muted">
                              <CardHeader>
                                <CardTitle className="flex items-center text-base">
                                  <span className="mr-2">🍎</span> Nutrição
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner', 'nightSnack'].map((meal) => {
                                    const mealData = record.nutrition_data[meal];
                                    if (!mealData || !mealData.quality) return null;
                                    
                                    const mealLabels: { [key: string]: string } = {
                                      breakfast: 'Café da Manhã',
                                      morningSnack: 'Lanche da Manhã',
                                      lunch: 'Almoço',
                                      afternoonSnack: 'Lanche da Tarde',
                                      dinner: 'Jantar',
                                      nightSnack: 'Ceia'
                                    };
                                    
                                    return (
                                      <div key={meal} className="border rounded-lg p-3">
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">{mealLabels[meal]}</label>
                                        <p className="text-foreground font-semibold mb-1">{mealData.quality}</p>
                                        {mealData.foods && mealData.foods.length > 0 && (
                                          <p className="text-xs text-muted-foreground mb-1">Categorias: {mealData.foods.join(', ')}</p>
                                        )}
                                        {mealData.waterIntake && (
                                          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">💧 Água: {mealData.waterIntake}ml</p>
                                        )}
                                        {mealData.notes && (
                                          <p className="text-sm text-muted-foreground mt-1">{mealData.notes}</p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                {record.nutrition_data.generalNotes && (
                                  <div className="mt-4">
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Observações Gerais</label>
                                    <p className="text-foreground whitespace-pre-wrap">{record.nutrition_data.generalNotes}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* Crisis Record */}
                          {record.crisis_data && Object.keys(record.crisis_data).some(key => 
                            Array.isArray(record.crisis_data[key]) && record.crisis_data[key].length > 0
                          ) && (
                            <Card className="border-muted">
                              <CardHeader>
                                <CardTitle className="flex items-center text-base">
                                  <span className="mr-2">⚠️</span> Crises e Episódios
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {['morning', 'afternoon', 'evening'].map((period) => {
                                  const crises = record.crisis_data[period];
                                  if (!crises || crises.length === 0) return null;
                                  
                                  return (
                                    <div key={period} className="mb-6 last:mb-0">
                                      <h4 className="font-medium text-foreground mb-3 capitalize">
                                        {period === 'morning' ? 'Manhã' : period === 'afternoon' ? 'Tarde' : 'Noite'}
                                      </h4>
                                      <div className="space-y-3">
                                        {crises.map((crisis: any, idx: number) => (
                                          <div key={idx} className="border rounded-lg p-3 bg-orange-50 dark:bg-orange-950/10">
                                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                              {crisis.severity && <div><span className="text-muted-foreground">Gravidade:</span> {crisis.severity}</div>}
                                              {crisis.duration && <div><span className="text-muted-foreground">Duração:</span> {crisis.duration}</div>}
                                              {crisis.context && <div className="col-span-2"><span className="text-muted-foreground">Contexto:</span> {crisis.context}</div>}
                                            </div>
                                            {crisis.triggers && crisis.triggers.length > 0 && (
                                              <div className="text-sm mb-2">
                                                <span className="text-muted-foreground">Gatilhos:</span> {crisis.triggers.join(', ')}
                                              </div>
                                            )}
                                            {crisis.interventions && crisis.interventions.length > 0 && (
                                              <div className="text-sm mb-2">
                                                <span className="text-muted-foreground">Intervenções:</span> {crisis.interventions.join(', ')}
                                              </div>
                                            )}
                                            {crisis.notes && (
                                              <p className="text-sm text-muted-foreground">{crisis.notes}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </CardContent>
                            </Card>
                          )}

                          {/* Activities Record */}
                          {record.activity_data && Object.keys(record.activity_data).some(key => 
                            Array.isArray(record.activity_data[key]) && record.activity_data[key].length > 0
                          ) && (
                            <Card className="border-muted">
                              <CardHeader>
                                <CardTitle className="flex items-center text-base">
                                  <span className="mr-2">🎯</span> Atividades & Terapias
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {['morning', 'afternoon', 'evening'].map((period) => {
                                  const activities = record.activity_data[period];
                                  if (!activities || activities.length === 0) return null;
                                  
                                  return (
                                    <div key={period} className="mb-6 last:mb-0">
                                      <h4 className="font-medium text-foreground mb-3 capitalize">
                                        {period === 'morning' ? 'Manhã' : period === 'afternoon' ? 'Tarde' : 'Noite'}
                                      </h4>
                                      <div className="space-y-3">
                                        {activities.map((activity: any, idx: number) => (
                                          <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                              {activity.type && <div><span className="text-muted-foreground">Tipo:</span> {activity.type}</div>}
                                              {activity.name && <div><span className="text-muted-foreground">Atividade:</span> {activity.name}</div>}
                                              {activity.duration && <div><span className="text-muted-foreground">Duração:</span> {activity.duration} min</div>}
                                              {activity.participation && <div><span className="text-muted-foreground">Participação:</span> {activity.participation}</div>}
                                            </div>
                                            {activity.skills && activity.skills.length > 0 && (
                                              <div className="text-sm mb-2">
                                                <span className="text-muted-foreground">Habilidades praticadas:</span> {activity.skills.join(', ')}
                                              </div>
                                            )}
                                            {activity.observations && (
                                              <p className="text-sm text-muted-foreground">{activity.observations}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </CardContent>
                            </Card>
                          )}

                          {/* Medication Record */}
                          {record.medication_data && Object.keys(record.medication_data).some(key => 
                            Array.isArray(record.medication_data[key]) && record.medication_data[key].length > 0
                          ) && (
                            <Card className="border-muted">
                              <CardHeader>
                                <CardTitle className="flex items-center text-base">
                                  <span className="mr-2">💊</span> Medicação
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {['morning', 'afternoon', 'evening'].map((period) => {
                                  const meds = record.medication_data[period];
                                  if (!meds || meds.length === 0) return null;
                                  
                                  return (
                                    <div key={period} className="mb-6 last:mb-0">
                                      <h4 className="font-medium text-foreground mb-3 capitalize">
                                        {period === 'morning' ? 'Manhã' : period === 'afternoon' ? 'Tarde' : 'Noite'}
                                      </h4>
                                      <div className="space-y-3">
                                        {meds.map((med: any, idx: number) => (
                                          <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                              {med.type && <div><span className="text-muted-foreground">Tipo:</span> {med.type}</div>}
                                              {med.name && <div><span className="text-muted-foreground">Nome:</span> {med.name}</div>}
                                              {med.dosage && <div><span className="text-muted-foreground">Dosagem:</span> {med.dosage}</div>}
                                              {med.time && <div><span className="text-muted-foreground">Horário:</span> {med.time}</div>}
                                            </div>
                                            {med.sideEffects && (
                                              <p className="text-sm text-muted-foreground mt-2">Efeitos colaterais: {med.sideEffects}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </CardContent>
                            </Card>
                          )}

                          {/* Extra Notes */}
                          {record.extra_notes && (
                            <Card className="border-muted">
                              <CardHeader>
                                <CardTitle className="flex items-center text-base">
                                  <span className="mr-2">📝</span> Observações Gerais
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-foreground whitespace-pre-wrap">{record.extra_notes}</p>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPDF(report)}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Baixar PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEmail(report)}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar por Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
