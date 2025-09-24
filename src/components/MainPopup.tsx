import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause, Settings, BarChart3, Target, Clock } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { useFocus } from '../contexts/FocusContext'
import { toast } from 'sonner'

console.log('🎯 MainPopup: Componente carregado')

const MainPopup: React.FC = () => {
  const { state, dispatch } = useFocus()
  const [taskInput, setTaskInput] = useState('')

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartQuickSession = () => {
    if (!taskInput.trim()) {
      toast.error('Por favor, defina uma tarefa antes de começar!')
      return
    }

    const newTask = {
      id: Date.now().toString(),
      title: taskInput.trim(),
      completed: false,
      focusTime: 0,
      createdAt: new Date()
    }

    console.log('🚀 MainPopup: Iniciando sessão rápida com tarefa:', newTask)
    
    dispatch({ type: 'SET_CURRENT_TASK', payload: newTask })
    dispatch({ type: 'ADD_TASK', payload: newTask })
    dispatch({ type: 'START_SESSION', payload: { type: 'quick' } })
    
    toast.success('Sessão de 5 minutos iniciada! Vamos focar! 🎯')
  }

  const handleContinueFocus = () => {
    console.log('⏭️ MainPopup: Continuando para sessão de foco')
    dispatch({ type: 'START_SESSION', payload: { type: 'focus' } })
    toast.success('Sessão de foco iniciada! Mantenha o ritmo! 💪')
  }

  const handleStartBreak = () => {
    const isLongBreak = (state.completedSessions % state.settings.sessionsUntilLongBreak) === 0 && state.completedSessions > 0
    const breakType = isLongBreak ? 'long-break' : 'short-break'
    
    console.log('☕ MainPopup: Iniciando pausa:', breakType)
    dispatch({ type: 'START_SESSION', payload: { type: breakType } })
    
    toast.success(isLongBreak ? 'Pausa longa iniciada! Descanse bem! 😴' : 'Pausa curta iniciada! Relaxe um pouco! ☕')
  }

  const handleStopSession = () => {
    console.log('⏹️ MainPopup: Parando sessão')
    dispatch({ type: 'STOP_SESSION' })
    toast.info('Sessão interrompida. Tudo bem, tente novamente! 🤗')
  }

  const getSessionTitle = () => {
    switch (state.sessionType) {
      case 'quick':
        return 'Sessão Rápida (5 min)'
      case 'focus':
        return 'Sessão de Foco'
      case 'short-break':
        return 'Pausa Curta'
      case 'long-break':
        return 'Pausa Longa'
      default:
        return 'Pronto para focar?'
    }
  }

  const getTimerColor = () => {
    if (state.sessionType === 'short-break' || state.sessionType === 'long-break') {
      return 'text-success-600'
    }
    if (state.timeRemaining < 60 && state.sessionType !== null) {
      return 'text-warning-600'
    }
    return 'text-focus-600'
  }

  // Estado inativo - formulário inicial
  if (!state.isActive && !state.currentTask) {
    return (
      <div className="w-96 h-[500px] bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 flex flex-col">
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="mb-8 text-center">
            <Target className="w-16 h-16 text-focus-500 mx-auto mb-4 animate-pulse-slow" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Foco Inicial</h1>
            <p className="text-slate-600 text-sm">Comece com apenas 5 minutos</p>
          </div>

          <div className="w-full space-y-4">
            <Input
              placeholder="Qual é o seu foco agora?"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="task-input text-center text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleStartQuickSession()}
              autoFocus
            />
            
            <Button
              onClick={handleStartQuickSession}
              className="focus-button w-full h-14 text-lg"
              disabled={!taskInput.trim()}
            >
              <Play className="w-6 h-6 mr-2" />
              Começar (5 min)
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <Link to="/stats" className="flex items-center text-slate-600 hover:text-focus-600 transition-colors">
            <BarChart3 className="w-5 h-5 mr-1" />
            Estatísticas
          </Link>
          <Link to="/settings" className="flex items-center text-slate-600 hover:text-focus-600 transition-colors">
            <Settings className="w-5 h-5 mr-1" />
            Configurações
          </Link>
        </div>
      </div>
    )
  }

  // Sessão ativa - timer
  if (state.isActive) {
    return (
      <div className="w-96 h-[500px] bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 flex flex-col">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">{getSessionTitle()}</h2>
          {state.currentTask && (
            <p className="text-slate-600 text-sm bg-slate-100 rounded-lg px-3 py-2">
              📝 {state.currentTask.title}
            </p>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
          <div className={`timer-display ${getTimerColor()} timer-pulse mb-8`}>
            {formatTime(state.timeRemaining)}
          </div>

          <div className="w-full bg-slate-200 rounded-full h-3 mb-8">
            <div 
              className="bg-gradient-to-r from-focus-500 to-focus-600 h-3 rounded-full transition-all duration-1000"
              style={{ 
                width: `${((state.currentSession?.duration || 1) - state.timeRemaining) / (state.currentSession?.duration || 1) * 100}%` 
              }}
            />
          </div>

          <Button
            onClick={handleStopSession}
            variant="outline"
            className="border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            <Pause className="w-5 h-5 mr-2" />
            Cancelar Sessão
          </Button>
        </div>

        <div className="text-center text-xs text-slate-500">
          Sessões completadas hoje: {state.completedSessions}
        </div>
      </div>
    )
  }

  // Fim da sessão rápida - opções de continuar
  if (state.timeRemaining === 0 && state.sessionType === 'quick') {
    return (
      <div className="w-96 h-[500px] bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 flex flex-col">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Parabéns! 🎉</h2>
          <p className="text-slate-600">Você completou 5 minutos de foco!</p>
          {state.currentTask && (
            <p className="text-sm text-slate-500 mt-2 bg-slate-100 rounded-lg px-3 py-2">
              📝 {state.currentTask.title}
            </p>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-4">
          <Button
            onClick={handleContinueFocus}
            className="focus-button h-14 text-lg"
          >
            <Clock className="w-6 h-6 mr-2" />
            Continuar Foco ({state.settings.focusTime} min)
          </Button>

          <Button
            onClick={() => {
              dispatch({ type: 'STOP_SESSION' })
              setTaskInput('')
            }}
            variant="outline"
            className="h-12 border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            Parar por Agora
          </Button>
        </div>
      </div>
    )
  }

  // Fim de sessão de foco - iniciar pausa
  if (state.timeRemaining === 0 && state.sessionType === 'focus') {
    const isLongBreak = (state.completedSessions % state.settings.sessionsUntilLongBreak) === 0 && state.completedSessions > 0

    return (
      <div className="w-96 h-[500px] bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 flex flex-col">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Sessão Concluída! 🏆</h2>
          <p className="text-slate-600">Hora de fazer uma pausa!</p>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-4">
          <Button
            onClick={handleStartBreak}
            className="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white h-14 text-lg"
          >
            <Clock className="w-6 h-6 mr-2" />
            {isLongBreak ? `Pausa Longa (${state.settings.longBreak} min)` : `Pausa Curta (${state.settings.shortBreak} min)`}
          </Button>

          <Button
            onClick={() => {
              dispatch({ type: 'STOP_SESSION' })
              setTaskInput('')
            }}
            variant="outline"
            className="h-12 border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            Terminar por Hoje
          </Button>
        </div>

        <div className="text-center text-xs text-slate-500">
          Sessões completadas: {state.completedSessions}
        </div>
      </div>
    )
  }

  // Fim da pausa - nova sessão
  if (state.timeRemaining === 0 && (state.sessionType === 'short-break' || state.sessionType === 'long-break')) {
    return (
      <div className="w-96 h-[500px] bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 flex flex-col">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-focus-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-focus-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Pausa Terminada! ⚡</h2>
          <p className="text-slate-600">Pronto para focar novamente?</p>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-4">
          <Button
            onClick={handleContinueFocus}
            className="focus-button h-14 text-lg"
          >
            <Play className="w-6 h-6 mr-2" />
            Nova Sessão ({state.settings.focusTime} min)
          </Button>

          <Button
            onClick={() => {
              dispatch({ type: 'STOP_SESSION' })
              setTaskInput('')
            }}
            variant="outline"
            className="h-12 border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            Terminar por Hoje
          </Button>
        </div>
      </div>
    )
  }

  return null
}

export default MainPopup