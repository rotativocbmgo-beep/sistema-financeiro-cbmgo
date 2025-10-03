type Pagamento = {
  id: number;
  descricao: string;
  valor: number;
  data: string; // ISO
};

// Implementação em memória para exemplo (trocar por DB)
const mem: Pagamento[] = [];
let seq = 1;

export class PagamentoService {
  async list(): Promise<Pagamento[]> {
    return mem;
  }
  async getById(id: number): Promise<Pagamento | undefined> {
    return mem.find(p => p.id === id);
  }
  async create(data: Omit<Pagamento, "id">): Promise<Pagamento> {
    const novo = { id: seq++, ...data };
    mem.push(novo);
    return novo;
  }
  async update(id: number, patch: Partial<Omit<Pagamento, "id">>): Promise<Pagamento> {
    const idx = mem.findIndex(p => p.id === id);
    if (idx < 0) throw new Error("Not found");
    mem[idx] = { ...mem[idx], ...patch };
    return mem[idx];
  }
  async remove(id: number): Promise<void> {
    const idx = mem.findIndex(p => p.id === id);
    if (idx >= 0) mem.splice(idx, 1);
  }
}
