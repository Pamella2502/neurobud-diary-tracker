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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

  // Generate chart data from record
  const generateMoodChartData = (record: DailyRecord | null) => {
    if (!record || !hasData(record.mood_data)) return [];
    
    const moodMap: { [key: string]: number } = {
      'Happy': 5,
      'Calm': 4,
      'Neutral': 3,
      'Sad': 2,
      'Angry': 1,
      'Anxious': 2,
      'Frustrated': 2
    };

    return ['morning', 'afternoon', 'evening'].map(period => ({
      period: period === 'morning' ? 'Manhã' : period === 'afternoon' ? 'Tarde' : 'Noite',
      mood: moodMap[record.mood_data[period]?.mood] || 0,
    })).filter(item => item.mood > 0);
  };

  const generateNutritionChartData = (record: DailyRecord | null) => {
    if (!record || !hasData(record.nutrition_data)) return [];
    
    const meals = ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner', 'nightSnack'];
    const mealLabels: { [key: string]: string } = {
      breakfast: 'Café',
      morningSnack: 'Lanche Manhã',
      lunch: 'Almoço',
      afternoonSnack: 'Lanche Tarde',
      dinner: 'Jantar',
      nightSnack: 'Ceia'
    };
    
    const qualityMap: { [key: string]: number } = {
      'Excellent': 5,
      'Good': 4,
      'Average': 3,
      'Poor': 2
    };

    return meals
      .filter(meal => record.nutrition_data[meal]?.quality)
      .map(meal => ({
        name: mealLabels[meal],
        quality: qualityMap[record.nutrition_data[meal].quality] || 0,
      }));
  };

  const generateCrisisChartData = (record: DailyRecord | null) => {
    if (!record || !hasData(record.crisis_data)) return [];
    
    const severityCount: { [key: string]: number } = {
      'Leve': 0,
      'Moderada': 0,
      'Intensa': 0
    };

    ['morning', 'afternoon', 'evening'].forEach(period => {
      const crises = record.crisis_data[period];
      if (crises && Array.isArray(crises)) {
        crises.forEach((crisis: any) => {
          if (crisis.severity && severityCount[crisis.severity] !== undefined) {
            severityCount[crisis.severity]++;
          }
        });
      }
    });

    return Object.entries(severityCount)
      .filter(([_, count]) => count > 0)
      .map(([severity, count]) => ({
        name: severity,
        value: count
      }));
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
            {reports.map((report) => {
              const { summary, record } = report;
              const moodData = generateMoodChartData(record);
              const nutritionData = generateNutritionChartData(record);
              const crisisData = generateCrisisChartData(record);

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
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Charts Section */}
                    {record && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-foreground mb-4">📈 Gráficos do Dia</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Mood Chart */}
                          {moodData.length > 0 && (
                            <Card className="border-muted">
                              <CardHeader>
                                <CardTitle className="text-base">😊 Humor ao Longo do Dia</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart data={moodData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Bar dataKey="mood" fill="#8884d8" name="Humor (1-5)" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          )}

                          {/* Nutrition Chart */}
                          {nutritionData.length > 0 && (
                            <Card className="border-muted">
                              <CardHeader>
                                <CardTitle className="text-base">🍎 Qualidade das Refeições</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart data={nutritionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Bar dataKey="quality" fill="#00C49F" name="Qualidade (1-5)" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          )}

                          {/* Crisis Chart */}
                          {crisisData.length > 0 && (
                            <Card className="border-muted">
                              <CardHeader>
                                <CardTitle className="text-base">⚠️ Crises por Gravidade</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                  <PieChart>
                                    <Pie
                                      data={crisisData}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={(entry) => `${entry.name}: ${entry.value}`}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                    >
                                      {crisisData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
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
