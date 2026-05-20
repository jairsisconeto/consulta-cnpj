type ApiData = Record<string, unknown>

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s || null
}

function obj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null
}

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

export interface CompanySummary {
  razaoSocial: string | null
  fantasia: string | null
  situacao: string | null
  endereco: string | null
  cidadeUf: string | null
  cnae: string | null
  telefone: string | null
  email: string | null
  inscricoesEstaduais: string | null
  cnpj: string | null
}

export function extractSummary(data: ApiData): CompanySummary {
  const est = obj(data.estabelecimento)
  const cidade = est ? obj(est.cidade) : null
  const estado = est ? obj(est.estado) : null
  const atividade = est ? obj(est.atividade_principal) : null

  const addressParts = est
    ? [
        est.tipo_logradouro,
        est.logradouro,
        est.numero && est.numero !== 'SN' ? `nº ${est.numero}` : est.numero,
        est.complemento,
        est.bairro,
        est.cep ? `CEP ${est.cep}` : null,
      ]
        .map((p) => str(p))
        .filter(Boolean)
    : []

  const ddd = str(est?.ddd1)
  const tel = str(est?.telefone1)
  const telefone =
    ddd && tel ? `(${ddd}) ${tel}` : tel ? tel : ddd ? `(${ddd})` : null

  const cidadeNome = str(cidade?.nome)
  const uf = str(estado?.sigla)
  const cidadeUf =
    cidadeNome && uf ? `${cidadeNome} / ${uf}` : cidadeNome ?? uf

  const inscricoes = arr<Record<string, unknown>>(est?.inscricoes_estaduais)
    .map((ie) => {
      const num = str(ie.inscricao_estadual)
      const sigla = str(obj(ie.estado)?.sigla)
      const ativo = ie.ativo === true ? 'ativa' : ie.ativo === false ? 'inativa' : null
      if (!num) return null
      return [num, sigla, ativo].filter(Boolean).join(' — ')
    })
    .filter(Boolean)
    .join('; ')

  return {
    razaoSocial: str(data.razao_social),
    fantasia: str(est?.nome_fantasia),
    situacao: str(est?.situacao_cadastral),
    endereco: addressParts.length ? addressParts.join(', ') : null,
    cidadeUf: cidadeUf ?? null,
    cnae: str(atividade?.descricao) ?? str(atividade?.id),
    telefone,
    email: str(est?.email),
    inscricoesEstaduais: inscricoes || null,
    cnpj: str(est?.cnpj) ?? str(data.cnpj_raiz),
  }
}
