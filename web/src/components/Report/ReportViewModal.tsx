// web/src/components/Report/ReportViewModal.tsx

import { Report } from '../../pages/Reports';
import { usePermissions } from '../../hooks/usePermissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FilePdf, CheckCircle, Seal, X as CloseIcon } from '@phosphor-icons/react';

interface ReportViewModalProps {
  report: Report;
  onClose: () => void;
  onAction: (action: 'finalize' | 'sign' | 'export', reportId: string) => void;
}

export function ReportViewModal({ report, onClose, onAction }: ReportViewModalProps) {
  const { hasPermission } = usePermissions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-2xl font-bold text-purple-400">{report.title}</h3>
                <p className="text-sm text-gray-400">Criado por {report.creator.name} em {format(new Date(report.updatedAt), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <CloseIcon size={24} />
            </button>
        </div>
        
        <div className="flex-grow overflow-y-auto bg-gray-900 p-4 rounded-md font-mono text-sm text-gray-300 my-4">
          <pre>{JSON.stringify(report.content, null, 2)}</pre>
        </div>

        {report.signatures && report.signatures.length > 0 && (
            <div className="mb-4">
                <h4 className="font-bold text-white">Assinaturas:</h4>
                <ul className="list-disc list-inside text-gray-400 text-sm">
                    {report.signatures.map(sig => (
                        <li key={sig.user.name}>
                            {sig.user.name} em {format(new Date(sig.signedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                report.status === 'RASCUNHO' ? 'bg-yellow-500 text-yellow-900' :
                report.status === 'FINALIZADO' ? 'bg-blue-500 text-blue-900' : 'bg-green-500 text-green-900'
            }`}>
                {report.status}
            </span>
            <div className="flex items-center gap-3">
                {report.status === 'RASCUNHO' && hasPermission('relatorio:criar') && <button onClick={() => onAction('finalize', report.id)} className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg"><CheckCircle size={16} /> Finalizar</button>}
                {report.status === 'FINALIZADO' && hasPermission('relatorio:assinar') && <button onClick={() => onAction('sign', report.id)} className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg"><Seal size={16} /> Assinar</button>}
                {hasPermission('relatorio:exportar') && <button onClick={() => onAction('export', report.id)} className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg"><FilePdf size={16} /> Exportar PDF</button>}
            </div>
        </div>
      </div>
    </div>
  );
}
