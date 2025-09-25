import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  Award,
  Flame,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useFocus } from "../contexts/FocusContext";

console.log("📊 StatsPage: Componente carregado");

const StatsPage: React.FC = () => {
  const { state } = useFocus();

  const calculateTotalFocusTime = () => {
    return state.sessions
      .filter((session) => session.completed && session.type === "focus")
      .reduce((total, session) => total + session.duration, 0);
  };

  const calculateTodayFocusTime = () => {
    const today = new Date().toDateString();
    return state.sessions
      .filter(
        (session) =>
          session.completed &&
          session.type === "focus" &&
          new Date(session.startTime).toDateString() === today
      )
      .reduce((total, session) => total + session.duration, 0);
  };

  const calculateStreak = () => {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();

      const hasSession = state.sessions.some(
        (session) =>
          session.completed &&
          session.type === "focus" &&
          new Date(session.startTime).toDateString() === dateString
      );

      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getWeeklyData = () => {
    const weekData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toDateString();

      const dayFocusTime = state.sessions
        .filter(
          (session) =>
            session.completed &&
            session.type === "focus" &&
            new Date(session.startTime).toDateString() === dateString
        )
        .reduce((total, session) => total + session.duration, 0);

      weekData.push({
        day: date.toLocaleDateString("pt-BR", { weekday: "short" }),
        minutes: Math.floor(dayFocusTime / 60),
        date: dateString,
      });
    }

    return weekData;
  };

  const totalFocusTime = calculateTotalFocusTime();
  const todayFocusTime = calculateTodayFocusTime();
  const currentStreak = calculateStreak();
  const weeklyData = getWeeklyData();
  const maxWeeklyMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1);
  const completedSessions = state.sessions.filter(
    (s) => s.completed && s.type === "focus"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Estatísticas
              </h1>
              <p className="text-slate-600">
                Acompanhe seu progresso e conquistas
              </p>
            </div>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="stats-card text-center">
            <Clock className="w-8 h-8 text-focus-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {formatTime(todayFocusTime)}
            </div>
            <div className="text-sm text-slate-600">Foco Hoje</div>
          </Card>

          <Card className="stats-card text-center">
            <Target className="w-8 h-8 text-success-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {completedSessions}
            </div>
            <div className="text-sm text-slate-600">Sessões Completas</div>
          </Card>

          <Card className="stats-card text-center">
            <Flame className="w-8 h-8 text-warning-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {currentStreak}
            </div>
            <div className="text-sm text-slate-600">Dias de Sequência</div>
          </Card>

          <Card className="stats-card text-center">
            <TrendingUp className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {formatTime(totalFocusTime)}
            </div>
            <div className="text-sm text-slate-600">Tempo Total</div>
          </Card>
        </div>

        {/* Gráfico semanal */}
        <Card className="stats-card mb-8">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-focus-600 mr-3" />
            <h2 className="text-xl font-semibold text-slate-800">
              Últimos 7 Dias
            </h2>
          </div>

          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center">
                <div className="w-12 text-sm text-slate-600 font-medium">
                  {day.day}
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-slate-200 rounded-full h-4 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-focus-500 to-focus-600 h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${(day.minutes / maxWeeklyMinutes) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-16 text-sm text-slate-700 text-right font-medium">
                  {day.minutes}m
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;
