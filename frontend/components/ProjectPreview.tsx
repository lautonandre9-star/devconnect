// src/components/ProjectPreview.tsx
import React, { useState } from 'react';
import { X, Play, Code2, Eye, Maximize2, Sparkles, Zap, ChevronRight, Copy, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description: string;
    code?: string;
    language?: 'html' | 'react' | 'javascript';
  };
}

const ProjectPreview: React.FC<ProjectPreviewProps> = ({ isOpen, onClose, project }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const runCode = () => {
    setError('');
    setOutput('');
    setActiveTab('preview');

    if (!project.code) {
      setError('A forja está vazia. Nenhum código disponível para compilar.');
      return;
    }

    try {
      if (project.language === 'html') {
        setOutput(project.code);
      } else if (project.language === 'javascript') {
        const workerCode = `
          const logs = [];
          const customConsole = {
            log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            error: (...args) => logs.push('ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            warn: (...args) => logs.push('WARN: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          };
          try {
            (new Function('console', \`${project.code.replace(/`/g, '\\`')}\`))(customConsole);
            self.postMessage({ output: logs.join('\\n'), error: '' });
          } catch (e) {
            self.postMessage({ output: '', error: e.message });
          }
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        worker.onmessage = (e) => {
          if (e.data.error) setError(e.data.error);
          else setOutput(e.data.output);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
        };

        worker.onerror = (e) => {
          setError(`Runtime anomaly: ${e.message}`);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
        };
      } else if (project.language === 'react') {
        setError('A engine de renderização React está em manutenção. Visualize o código para análise manual.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0d0f1e]/90 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative bg-[#12152a] border border-slate-800/60 rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.7)] w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden"
          >
            {/* Glossy Header Container */}
            <div className="flex flex-col">
              <div className="px-10 py-8 border-b border-slate-800/60 flex items-center justify-between bg-gradient-to-r from-indigo-600/5 via-transparent to-transparent">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                    <Code2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">{project.name}</h2>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-800 ${project.language === 'html' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          project.language === 'javascript' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                        {project.language || 'html'} Source
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium tracking-wide line-clamp-1">{project.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={runCode}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 group"
                  >
                    <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                    Executar Workspace
                  </button>
                  <button
                    onClick={onClose}
                    className="w-12 h-12 bg-slate-900 border border-slate-800/60 hover:bg-slate-800 text-slate-500 hover:text-white rounded-2xl transition-all flex items-center justify-center shadow-xl group"
                  >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                  </button>
                </div>
              </div>

              {/* Sub-navigation Toggles */}
              <div className="px-10 py-4 bg-[#0d0f1e]/40 border-b border-slate-800/60 flex items-center justify-between">
                <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-slate-800/40">
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-1.5xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'code' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    <Code2 className="w-4 h-4" /> Script View
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-1.5xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    <Eye className="w-4 h-4" /> Runtime Preview
                  </button>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compiler Online</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    Total {project.code?.split('\n').length || 0} Linhas
                  </div>
                </div>
              </div>
            </div>

            {/* Viewport Content */}
            <div className="flex-1 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
              <AnimatePresence mode="wait">
                {activeTab === 'code' ? (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full p-10"
                  >
                    <div className="h-full bg-black/40 border border-slate-800/60 rounded-3xl overflow-hidden relative group shadow-inner">
                      <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(project.code || '');
                            // TODO: Better notification
                          }}
                          className="px-4 py-2 bg-slate-800 border border-slate-700/60 text-indigo-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md transition-all flex items-center gap-2"
                        >
                          <Copy className="w-3 h-3" /> Clonar Script
                        </button>
                      </div>

                      <pre className="h-full p-8 text-sm font-mono text-slate-400 leading-relaxed overflow-auto no-scrollbar selection:bg-indigo-500/30">
                        <code>{project.code || '// Fragmento de código não localizado.'}</code>
                      </pre>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="h-full flex flex-col p-10"
                  >
                    {error ? (
                      <div className="h-full bg-red-500/5 border border-red-500/20 rounded-[2rem] flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20">
                          <Terminal className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-red-400 mb-4 uppercase tracking-tight">Violação de Runtime</h3>
                        <div className="bg-black/60 p-6 rounded-2xl border border-red-500/20 max-w-2xl w-full text-red-300 font-mono text-xs leading-relaxed overflow-auto">
                          {error}
                        </div>
                        <button onClick={() => setError('')} className="mt-10 px-8 py-3 bg-slate-900 border border-slate-800 text-slate-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                          Resetar Workspace
                        </button>
                      </div>
                    ) : output ? (
                      <div className="h-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-[0_48px_128px_-32px_rgba(0,0,0,0.8)] border-8 border-slate-950">
                        {project.language === 'html' ? (
                          <iframe srcDoc={output} className="w-full h-full" title="Live Preview" sandbox="allow-scripts" />
                        ) : (
                          <div className="bg-[#000] h-full p-8 font-mono text-sm text-green-500 overflow-auto no-scrollbar">
                            <div className="mb-4 flex items-center gap-2 text-green-900 text-[10px] font-black uppercase tracking-widest">
                              <div className="w-2 h-2 rounded-full bg-green-500" /> System Output v1.0.4
                            </div>
                            {output}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="relative mb-12">
                          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] animate-pulse rounded-full" />
                          <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center justify-center relative z-10 shadow-2xl">
                            <Maximize2 className="w-10 h-10 text-slate-700" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-black text-white/40 mb-4 uppercase tracking-tight">Núcleo de Execução</h3>
                        <p className="text-slate-600 max-w-md mx-auto text-sm font-medium leading-relaxed italic">
                          Pronto para compilação. Escolha uma fonte na esquerda ou clique no comando de execução para gerar o preview em tempo real.
                        </p>

                        {project.code && (
                          <button
                            onClick={runCode}
                            className="mt-12 px-10 py-4 bg-transparent border border-indigo-500/40 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/5 group"
                          >
                            Ativar Renderização <ChevronRight className="w-4 h-4 inline ml-2 group-hover:translate-x-1 transition-transform" />
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Data Grid */}
            <div className="px-10 py-6 bg-[#0b0d18] border-t border-slate-800/60 flex items-center justify-between">
              <div className="flex gap-12">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Ambiente</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-tight">DevConnect Sandbox v1</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Segurança</span>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-tight flex items-center gap-1.5 font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> EED Verified
                  </span>
                </div>
              </div>

              <div className="hidden md:block">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest opacity-60">
                  "Build things that matter, code with passion."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectPreview;