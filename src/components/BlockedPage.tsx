import React, { useEffect, useState } from "react";
import { Shield, Clock, Target, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useFocus } from "../contexts/FocusContext";

console.log("🚫 BlockedPage: Componente carregado");

const BlockedPage: React.FC = () => {
  const { state } = useFocus();
  const [motivationalMessage, setMotivationalMessage] = useState("");

  const motivationalMessages = [
    "Você está no caminho certo! Continue focado! 💪",
    "Cada momento de foco te aproxima do seu objetivo! 🎯",
    "A disciplina de hoje é o sucesso de amanhã! ⭐",
    "Sua mente agradece por esta escolha consciente! 🧠",
    "Pequenos passos levam a grandes conquistas! 🚀",
    "O foco é um superpoder. Use-o sabiamente! ⚡",
    "Você é mais forte que suas distrações! 🛡️",
    "Grandes coisas acontecem quando você se mantém focado! 🌟",
  ];

  useEffect(() => {
    const randomMessage =
      motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ];
    setMotivationalMessage(randomMessage);
    console.log(
      "💬 BlockedPage: Mensagem motivacional selecionada:",
      randomMessage
    );
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="blocked-site-overlay">
      <div className="max-w-2xl mx-auto text-center p-8">
        <div className="mb-8">
          <div className="w-24 h-24 bg-focus-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-focus-600" />
          </div>

          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Opa! Site Bloqueado 🛡️
          </h1>

          <p className="text-xl text-slate-600 mb-2">{motivationalMessage}</p>
        </div>

        {state.currentTask && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-focus-600 mr-2" />
              <span className="text-lg font-semibold text-slate-800">
                Seu foco atual:
              </span>
            </div>
            <p className="text-xl text-focus-700 font-medium mb-4">
              "{state.currentTask.title}"
            </p>

            {state.isActive && (
              <div className="flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-600 mr-2" />
                <span className="text-lg text-slate-700">
                  Tempo restante:{" "}
                  <span className="font-mono font-bold text-focus-600">
                    {formatTime(state.timeRemaining)}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <p className="text-lg text-slate-700">
            Este site foi bloqueado para ajudar você a manter o foco.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => window.history.back()}
              className="focus-button hover-lift"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar ao Foco
            </Button>

            <Button
              onClick={() => window.close()}
              variant="outline"
              className="border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              Fechar Aba
            </Button>
          </div>
        </div>

        <div className="mt-12 text-sm text-slate-500">
          <p>💡 Dica: Use pausas para acessar sites recreativos!</p>
        </div>
      </div>
    </div>
  );
};

export default BlockedPage;
