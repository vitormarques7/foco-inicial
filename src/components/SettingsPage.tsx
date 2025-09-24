import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Volume2, VolumeX, Shield, Trash2, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { useFocus } from '../contexts/FocusContext'
import { toast } from 'sonner'

console.log('⚙️ SettingsPage: Componente carregado')

const SettingsPage: React.FC = () => {
  const { state, dispatch } = useFocus()
  const [newSite, setNewSite] = useState('')

  const handleUpdateSetting = (key: keyof typeof state.settings, value: any) => {
    console.log(`🔧 SettingsPage: Atualizando configuração ${key}:`, value)
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } })
    toast.success('Configuração atualizada!')
  }

  const handleAddBlockedSite = () => {
    if (!newSite.trim()) return

    let site = newSite.trim().toLowerCase()
    // Remove protocolo se existir
    site = site.replace(/^https?:\/\//, '')
    // Remove www. se existir
    site = site.replace(/^www\./, '')

    if (state.settings.blockedSites.includes(site)) {
      toast.error('Este site já está na lista!')
      return
    }

    console.log('🚫 SettingsPage: Adicionando site bloqueado:', site)
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { 
        blockedSites: [...state.settings.blockedSites, site] 
      } 
    })
    setNewSite('')
    toast.success('Site adicionado à lista de bloqueio!')
  }

  const handleRemoveBlockedSite = (site: string) => {
    console.log('✅ SettingsPage: Removendo site bloqueado:', site)
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { 
        blockedSites: state.settings.blockedSites.filter(s => s !== site) 
      } 
    })
    toast.success('Site removido da lista de bloqueio!')
  }

  const handleResetStats = () => {
    if (window.confirm('Tem certeza que deseja resetar todas as estatísticas? Esta ação não pode ser desfeita.')) {
      console.log('🗑️ SettingsPage: Resetando estatísticas')
      localStorage.removeItem('focusInitialState')
      window.location.reload()
      toast.success('Estatísticas resetadas!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
            <p className="text-slate-600">Personalize sua experiência de foco</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Configurações de Tempo */}
          <Card className="stats-card">
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 text-focus-600 mr-3" />
              <h2 className="text-xl font-semibold text-slate-800">Tempos das Sessões</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="focusTime" className="text-sm font-medium text-slate-700 mb-2 block">
                  Sessão de Foco (minutos)
                </Label>
                <Input
                  id="focusTime"
                  type="number"
                  min="10"
                  max="60"
                  value={state.settings.focusTime}
                  onChange={(e) => handleUpdateSetting('focusTime', parseInt(e.target.value))}
                  className="text-center"
                />
              </div>

              <div>
                <Label htmlFor="shortBreak" className="text-sm font-medium text-slate-700 mb-2 block">
                  Pausa Curta (minutos)
                </Label>
                <Input
                  id="shortBreak"
                  type="number"
                  min="3"
                  max="15"
                  value={state.settings.shortBreak}
                  onChange={(e) => handleUpdateSetting('shortBreak', parseInt(e.target.value))}
                  className="text-center"
                />
              </div>

              <div>
                <Label htmlFor="longBreak" className="text-sm font-medium text-slate-700 mb-2 block">
                  Pausa Longa (minutos)
                </Label>
                <Input
                  id="longBreak"
                  type="number"
                  min="15"
                  max="30"
                  value={state.settings.longBreak}
                  onChange={(e) => handleUpdateSetting('longBreak', parseInt(e.target.value))}
                  className="text-center"
                />
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="sessionsUntilLongBreak" className="text-sm font-medium text-slate-700 mb-2 block">
                Sessões até pausa longa
              </Label>
              <Input
                id="sessionsUntilLongBreak"
                type="number"
                min="2"
                max="8"
                value={state.settings.sessionsUntilLongBreak}
                onChange={(e) => handleUpdateSetting('sessionsUntilLongBreak', parseInt(e.target.value))}
                className="w-32 text-center"
              />
            </div>
          </Card>

          {/* Configurações de Áudio */}
          <Card className="stats-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {state.settings.soundEnabled ? (
                  <Volume2 className="w-6 h-6 text-focus-600 mr-3" />
                ) : (
                  <VolumeX className="w-6 h-6 text-slate-400 mr-3" />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Notificações Sonoras</h2>
                  <p className="text-sm text-slate-600">Som ao final das sessões</p>
                </div>
              </div>
              <Switch
                checked={state.settings.soundEnabled}
                onCheckedChange={(checked) => handleUpdateSetting('soundEnabled', checked)}
              />
            </div>
          </Card>

          {/* Sites Bloqueados */}
          <Card className="stats-card">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-warning-600 mr-3" />
              <h2 className="text-xl font-semibold text-slate-800">Sites Bloqueados</h2>
            </div>

            <div className="mb-4">
              <Label htmlFor="newSite" className="text-sm font-medium text-slate-700 mb-2 block">
                Adicionar novo site
              </Label>
              <div className="flex gap-2">
                <Input
                  id="newSite"
                  placeholder="exemplo.com"
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBlockedSite()}
                  className="flex-1"
                />
                <Button onClick={handleAddBlockedSite} disabled={!newSite.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Digite apenas o domínio (ex: facebook.com, youtube.com)
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {state.settings.blockedSites.map((site, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <span className="text-slate-700">{site}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveBlockedSite(site)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Resetar Dados */}
          <Card className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Resetar Dados</h2>
                <p className="text-sm text-slate-600">Remove todas as estatísticas e sessões salvas</p>
              </div>
              <Button
                onClick={handleResetStats}
                variant="destructive"
                className="flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Resetar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage