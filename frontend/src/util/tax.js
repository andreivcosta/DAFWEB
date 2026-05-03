//teste arthur morrer
// IRPF mensal - exemplo baseado em tabelas progressivas (valor mensal)
export const IRPF_BRACKETS = [
  { upTo: 2428.8, rate: 0, deduction: 0 },
  { upTo: 2826.65, rate: 0.075, deduction: 182.16 },
  { upTo: 3751.05, rate: 0.15, deduction: 394.16 },
  { upTo: 4664.68, rate: 0.225, deduction: 675.49 },
  { upTo: Infinity, rate: 0.275, deduction: 908.73 },
];

function round2(x) {
  return Math.round(x * 100) / 100;
}

export function calcIRPF(base) {
  if (base <= 0) return { imposto: 0, effectiveRate: 0, bracket: null };

  if (base <= 5000) {
    return {
      imposto: 0,
      effectiveRate: 0,
      bracket: { rate: 0, label: "Isento 2026" },
    };
  }

  for (const b of IRPF_BRACKETS) {
    if (base <= b.upTo) {
      const imposto = Math.max(0, base * b.rate - b.deduction);
      const effectiveRate = imposto / base;

      return {
        imposto: round2(imposto),
        effectiveRate: round2(effectiveRate),
        bracket: b,
      };
    }
  }

  return { imposto: 0, effectiveRate: 0, bracket: null };
}

// Simples Nacional - Anexo IV - Advogado
export const SIMPLES_ANEXO_IV = [
  { upToAnnual: 180000, rate: 0.045, deduction: 0 },
  { upToAnnual: 360000, rate: 0.09, deduction: 8100 },
  { upToAnnual: 720000, rate: 0.102, deduction: 12420 },
  { upToAnnual: 1800000, rate: 0.14, deduction: 39780 },
  { upToAnnual: 3600000, rate: 0.22, deduction: 183780 },
  { upToAnnual: 4800000, rate: 0.33, deduction: 828000 },
];

// Simples Nacional - Anexo III - Psicólogo e outras profissões
export const SIMPLES_ANEXO_III = [
  { upToAnnual: 180000, rate: 0.06, deduction: 0 },
  { upToAnnual: 360000, rate: 0.112, deduction: 9360 },
  { upToAnnual: 720000, rate: 0.135, deduction: 17640 },
  { upToAnnual: 1800000, rate: 0.16, deduction: 35640 },
  { upToAnnual: 3600000, rate: 0.21, deduction: 125640 },
  { upToAnnual: 4800000, rate: 0.33, deduction: 648000 },
];

export function calcSimples(faturamentoMensal, custosMensais, profissao) {
  const receitaAnual = faturamentoMensal * 12;
  const profissaoFormatada = profissao?.toLowerCase() || "";

  const tabelaSimples = profissaoFormatada.includes("advogado")
    ? SIMPLES_ANEXO_IV
    : SIMPLES_ANEXO_III;

  let faixa = tabelaSimples[tabelaSimples.length - 1];

  for (const f of tabelaSimples) {
    if (receitaAnual <= f.upToAnnual) {
      faixa = f;
      break;
    }
  }

  const impostoAnual = Math.max(
    0,
    receitaAnual * faixa.rate - (faixa.deduction || 0)
  );

  const impostoMensal = impostoAnual / 12;
  const effectiveRate = impostoMensal / (faturamentoMensal || 1);

  return {
    impostoMensal: round2(impostoMensal),
    prolabore: 0,
    inss: 0,
    irProlabore: { imposto: 0, effectiveRate: 0, bracket: null },
    totalImpostos: round2(impostoMensal),
    effectiveRate: round2(effectiveRate),
    faixa,
  };
}

export function compareTaxes({ rendaMensal, custosMensais, pro }) {
  const inssPF = round2(rendaMensal * 0.11);
  const basePF = Math.max(0, rendaMensal - custosMensais - inssPF);
  const irpf = calcIRPF(basePF);
  const simples = calcSimples(rendaMensal, custosMensais, pro);

  const liquidoPF = round2(rendaMensal - (irpf.imposto + inssPF));
  const liquidoPJ = round2(rendaMensal - simples.totalImpostos);

  return {
    input: { rendaMensal, custosMensais, profissao: pro },
    PF: {
      inss: inssPF,
      ir: irpf.imposto,
      isentoIR: irpf.imposto === 0,
      imposto: round2(irpf.imposto + inssPF),
      effectiveRate: irpf.effectiveRate,
      liquido: liquidoPF,
      bracket: irpf.bracket,
    },
    PJ: {
      faturamento: rendaMensal,
      impostoMensal: simples.impostoMensal,
      prolabore: simples.prolabore,
      inss: simples.inss,
      irProlabore: simples.irProlabore,
      ir: simples.irProlabore.imposto,
      isentoIR: simples.irProlabore.imposto === 0,
      totalImpostos: simples.totalImpostos,
      effectiveRate: simples.effectiveRate,
      liquido: liquidoPJ,
      faixa: simples.faixa,
    },
  };
}
