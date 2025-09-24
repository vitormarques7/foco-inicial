import React, { createContext, useContext, useReducer, useEffect } from 'react'

export interface Task {
  id: string
  title: string
  completed: boolean
  focusTime: number
  createdAt: Date
}

export interface FocusSession {
  id: string
  taskId: string
  startTime: Date
  endTime?: Date
  duration: number
  type: 'quick' | 'focus' | 'break'
  completed: boolean
}

export interface Settings {
  focusTime: number
  shortBreak: number
  longBreak: number
  sessionsUntilLongBreak: number
  soundEnabled: boolean
  blockedSites: string[]
}

interface FocusState {
  currentTask: Task | null
  currentSession: FocusSession | null
  timeRemaining: number
  isActive: boolean
  sessionType: 'quick' | 'focus' | 'short-break' | 'long-break' | null
  tasks: Task[]
  sessions: FocusSession[]
  settings: Settings
  completedSessions: number
}

type FocusAction =
  | { type: 'SET_CURRENT_TASK'; payload: Task }
  | { type: 'START_SESSION'; payload: { type: 'quick' | 'focus' | 'short-break' | 'long-break' } }
  | { type: 'STOP_SESSION' }
  | { type: 'TICK' }
  | { type: 'COMPLETE_SESSION' }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'LOAD_STATE'; payload: Partial<FocusState> }

const defaultSettings: Settings = {
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
  blockedSites: ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'tiktok.com']
}

const initialState: FocusState = {
  currentTask: null,
  currentSession: null,
  timeRemaining: 0,
  isActive: false,
  sessionType: null,
  tasks: [],
  sessions: [],
  settings: defaultSettings,
  completedSessions: 0
}

function focusReducer(state: FocusState, action: FocusAction): FocusState {
  console.log('🔄 FocusContext: Ação disparada', action.type, action)

  switch (action.type) {
    case 'SET_CURRENT_TASK':
      return { ...state, currentTask: action.payload }

    case 'START_SESSION':
      const duration = action.payload.type === 'quick' ? 5 :
                      action.payload.type === 'focus' ? state.settings.focusTime :
                      action.payload.type === 'short-break' ? state.settings.shortBreak :
                      state.settings.longBreak

      const newSession: FocusSession = {
        id: Date.now().toString(),
        taskId: state.currentTask?.id || '',
        startTime: new Date(),
        duration: duration * 60,
        type: action.payload.type === 'short-break' || action.payload.type === 'long-break' ? 'break' : action.payload.type,
        completed: false
      }

      return {
        ...state,
        currentSession: newSession,
        timeRemaining: duration * 60,
        isActive: true,
        sessionType: action.payload.type
      }

    case 'STOP_SESSION':
      return {
        ...state,
        currentSession: null,
        timeRemaining: 0,
        isActive: false,
        sessionType: null
      }

    case 'TICK':
      if (state.timeRemaining <= 1) {
        return {
          ...state,
          timeRemaining: 0,
          isActive: false
        }
      }
      return {
        ...state,
        timeRemaining: state.timeRemaining - 1
      }

    case 'COMPLETE_SESSION':
      const completedSession = state.currentSession ? {
        ...state.currentSession,
        endTime: new Date(),
        completed: true
      } : null

      return {
        ...state,
        sessions: completedSession ? [...state.sessions, completedSession] : state.sessions,
        completedSessions: state.sessionType === 'focus' ? state.completedSessions + 1 : state.completedSessions,
        currentSession: null,
        isActive: false,
        sessionType: null,
        timeRemaining: 0
      }

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
        currentTask: state.currentTask?.id === action.payload.id ? action.payload : state.currentTask
      }

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        currentTask: state.currentTask?.id === action.payload ? null : state.currentTask
      }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      }

    case 'LOAD_STATE':
      return { ...state, ...action.payload }

    default:
      return state
  }
}

const FocusContext = createContext<{
  state: FocusState
  dispatch: React.Dispatch<FocusAction>
}>({
  state: initialState,
  dispatch: () => null
})

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(focusReducer, initialState)

  // Carregar estado do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('focusInitialState')
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        console.log('📥 FocusContext: Estado carregado do localStorage', parsedState)
        dispatch({ type: 'LOAD_STATE', payload: parsedState })
      } catch (error) {
        console.error('❌ FocusContext: Erro ao carregar estado', error)
      }
    }
  }, [])

  // Salvar estado no localStorage
  useEffect(() => {
    const stateToSave = {
      tasks: state.tasks,
      sessions: state.sessions,
      settings: state.settings,
      completedSessions: state.completedSessions
    }
    localStorage.setItem('focusInitialState', JSON.stringify(stateToSave))
    console.log('💾 FocusContext: Estado salvo no localStorage')
  }, [state.tasks, state.sessions, state.settings, state.completedSessions])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (state.isActive && state.timeRemaining > 0) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK' })
      }, 1000)
    } else if (state.isActive && state.timeRemaining === 0) {
      console.log('⏰ FocusContext: Sessão completada!')
      dispatch({ type: 'COMPLETE_SESSION' })
      
      // Notificação de áudio (se habilitada)
      if (state.settings.soundEnabled) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDpatbEzHmvP/M4b1Fv/k0Lrz+z+O8wL/9Mz8=')
        audio.play().catch(e => console.log('🔇 Audio não pôde ser reproduzido:', e))
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [state.isActive, state.timeRemaining, state.settings.soundEnabled])

  return (
    <FocusContext.Provider value={{ state, dispatch }}>
      {children}
    </FocusContext.Provider>
  )
}

export const useFocus = () => {
  const context = useContext(FocusContext)
  if (!context) {
    throw new Error('useFocus deve ser usado dentro de um FocusProvider')
  }
  return context
}