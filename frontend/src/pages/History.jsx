import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { stockService, getErrorMessage } from "../services/api";
import { formatDateBR, formatNumberBR } from "../utils/format";

const movementConfig = {
  entrada: {
    label: "Entrada",
    style: "text-success bg-success/10 border-success/20",
    sign: "+",
  },
  saida: {
    label: "Saída",
    style: "text-danger bg-danger/10 border-danger/20",
    sign: "-",
  },
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await stockService.getHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Falha ao carregar histórico de estoque."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <Layout
      title="Histórico de Estoque"
      subtitle="Acompanhe as movimentações do inventário em tempo real"
    >
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 card opacity-50" />
          ))}
        </div>
      ) : error ? (
        <div className="card p-12 text-center text-danger text-[13px]">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-text-muted text-[13px]">
            Nenhuma movimentação de estoque registrada ainda.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Data
                </th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Movimento
                </th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Motivo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {history.map((item) => {
                const type = movementConfig[item.type] ?? movementConfig.saida;
                const productName =
                  item.product?.name || `Produto #${item.product_id}`;
                const unitType = item.product?.unit_type?.toUpperCase() || "";

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.01] transition-colors h-14"
                  >
                    <td className="px-5 py-2">
                      <span className="text-[12px] text-text-muted font-mono">
                        {formatDateBR(item.created_at)}
                      </span>
                    </td>
                    <td className="px-5 py-2">
                      <span className="text-[13px] font-medium text-text-primary">
                        {productName}
                      </span>
                    </td>
                    <td className="px-5 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border ${type.style}`}
                      >
                        {type.label}
                      </span>
                    </td>
                    <td className="px-5 py-2">
                      <span
                        className={`text-[12px] font-mono ${item.type === "entrada" ? "text-success" : "text-danger"}`}
                      >
                        {type.sign}
                        {formatNumberBR(item.quantity)} {unitType}
                      </span>
                    </td>
                    <td className="px-5 py-2 max-w-[320px] truncate">
                      <span className="text-[12px] text-text-tertiary">
                        {item.reason || "Sem motivo informado"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
