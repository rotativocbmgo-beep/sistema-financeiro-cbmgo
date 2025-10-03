import { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import { api } from "../services/api";
import { currencyBRL } from "../utils";

type Pagamento = { id:number; descricao:string; valor:number; data:string };

export default function Pagamentos() {
  const [items, setItems] = useState<Pagamento[]>([]);
  const [descricao, setD] = useState("");
  const [valor, setV] = useState(0);
  const [data, setData] = useState("");

  async function load() {
    const { data } = await api.get<Pagamento[]>("/pagamentos");
    setItems(data);
  }
  async function add() {
    await api.post("/pagamentos", { descricao, valor: Number(valor), data });
    setD(""); setV(0); setData("");
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding:16, display:"grid", gap:16 }}>
      <h1>Pagamentos</h1>
      <Card>
        <div style={{ display:"grid", gap:8, gridTemplateColumns:"2fr 1fr 1fr auto" }}>
          <Input placeholder="Descrição" value={descricao} onChange={e=>setD(e.target.value)} />
          <Input placeholder="Valor" type="number" value={valor} onChange={e=>setV(Number(e.target.value))} />
          <Input placeholder="Data (YYYY-MM-DD)" value={data} onChange={e=>setData(e.target.value)} />
          <Button onClick={add}>Adicionar</Button>
        </div>
      </Card>
      <Card>
        <ul style={{ listStyle:"none", padding:0, margin:0 }}>
          {items.map(p=>(
            <li key={p.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr auto", padding:"8px 0", borderBottom:"1px solid #1f2937" }}>
              <span>{p.descricao}</span>
              <span>{currencyBRL(p.valor)}</span>
              <span>{new Date(p.data).toLocaleDateString("pt-BR")}</span>
              {/* ações extras podem ser adicionadas aqui */}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
