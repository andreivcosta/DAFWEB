// ================= IRPF =================

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

export function calcIRPF(renda) {
  if (renda <= 0) {
    return { imposto: 0, effectiveRate: 0 };
  }

  const baseCalculo = Math.max(0, renda - 607.20);

  let impostoBruto = 0;

  for (const b of IRPF_BRACKETS) {
    if (baseCalculo <= b.upTo) {
      impostoBruto = Math.max(0, (baseCalculo * b.rate) - b.deduction);
      break;
    }
  }

  let impostoFinal = impostoBruto;

  // regra do redutor
  if (renda <= 5000) {
    impostoFinal = 0;
  } else if (renda <= 7350) {
    const redutor = 978.62 - (0.133145 * renda);
    impostoFinal = Math.max(0, impostoBruto - redutor);
  }

  return {
    imposto: round2(impostoFinal),
    effectiveRate: round2(impostoFinal / renda),
  };
}

// ================= SIMPLES =================

export const SIMPLES_ANEXO_III = [
  { upToAnnual: 180000, rate: 0.06, deduction: 0 },
  { upToAnnual: 360000, rate: 0.112, deduction: 9360 },
  { upToAnnual: 720000, rate: 0.135, deduction: 17640 },
  { upToAnnual: 1800000, rate: 0.16, deduction: 35640 },
  { upToAnnual: 3600000, rate: 0.21, deduction: 125640 },
  { upToAnnual: 4800000, rate: 0.33, deduction: 648000 },
];

export const SIMPLES_ANEXO_IV = [
  { upToAnnual: 180000, rate: 0.045, deduction: 0 },
  { upToAnnual: 360000, rate: 0.09, deduction: 8100 },
  { upToAnnual: 720000, rate: 0.102, deduction: 12420 },
  { upToAnnual: 1800000, rate: 0.14, deduction: 39780 },
  { upToAnnual: 4800000, rate: 0.22, deduction: 183780 },
  { upToAnnual: 4800000, rate: 0.33, deduction: 828000 },
];

// ================= PROFISSÕES =================

const PROFISSOES_CONFIG = {
  "Psicólogo(a)": { anexo: "III" },
  "Arquiteto(a)": { anexo: "III" },
  "Advogado(a)": { anexo: "IV" },
};

const INSS_RATE = 0.11;

// ================= SIMPLES BASE =================

export function calcSimplesDinamico(faturamentoMensal, profissao) {
  const receitaAnual = faturamentoMensal * 12;

  const config = PROFISSOES_CONFIG[profissao] || { anexo: "III" };
  const tabela =
    config.anexo === "IV" ? SIMPLES_ANEXO_IV : SIMPLES_ANEXO_III;

  let faixa = tabela[tabela.length - 1];

  for (const f of tabela) {
    if (receitaAnual <= f.upToAnnual) {
      faixa = f;
      break;
    }
  }

  const impostoAnual = Math.max(
    0,
    receitaAnual * faixa.rate - (faixa.deduction || 0)
  );

  return {
    impostoMensal: impostoAnual / 12,
    anexo: config.anexo,
  };
}

// ================= ANEXO III =================

export function calcAnexoIII(faturamentoMensal, impostoMensal) {
  const prolabore = faturamentoMensal * 0.28;
  const inss = prolabore * INSS_RATE;

  const baseIR = prolabore - inss;
  const irProlabore = calcIRPF(baseIR);

  const total = impostoMensal + inss + irProlabore.imposto;

  return {
    impostoMensal: round2(impostoMensal),
    prolabore: round2(prolabore),
    inss: round2(inss),
    irProlabore,
    totalImpostos: round2(total),
    effectiveRate: round2(total / faturamentoMensal),
  };
}

// ================= ANEXO IV (ADVOGADO) =================

export function calcAnexoIV(faturamentoMensal, impostoMensal) {
  const prolabore = Math.max(1621, faturamentoMensal * 0.28);

  const inss = prolabore * INSS_RATE;
  const cpp = prolabore * 0.2;

  const baseIR = prolabore - inss;
  const irProlabore = calcIRPF(baseIR);

  const total =
    impostoMensal + inss + cpp + irProlabore.imposto;

  return {
    impostoMensal: round2(impostoMensal),
    prolabore: round2(prolabore),
    inss: round2(inss),
    cpp: round2(cpp),
    irProlabore,
    totalImpostos: round2(total),
    effectiveRate: round2(total / faturamentoMensal),
  };
}

// ================= FUNÇÃO PRINCIPAL =================

export function compareTaxes({
  rendaMensal,
  custosMensais = 0,
  profissao,
}) {
  // PF
  const basePF = Math.max(0, rendaMensal - custosMensais);
  const irpf = calcIRPF(basePF);

  const liquidoPF = round2(rendaMensal - irpf.imposto);

  // PJ
  const simplesBase = calcSimplesDinamico(
    rendaMensal,
    profissao
  );

  let pj;

  if (simplesBase.anexo === "IV") {
    pj = calcAnexoIV(
      rendaMensal,
      simplesBase.impostoMensal
    );
  } else {
    pj = calcAnexoIII(
      rendaMensal,
      simplesBase.impostoMensal
    );
  }

  const liquidoPJ = round2(
    rendaMensal - pj.totalImpostos
  );

  return {
    input: { rendaMensal, custosMensais, profissao },

    PF: {
      imposto: irpf.imposto,
      liquido: liquidoPF,
      effectiveRate: irpf.effectiveRate,
    },

    PJ: {
      impostoMensal: pj.impostoMensal,
      prolabore: pj.prolabore,
      inss: pj.inss,
      cpp: pj.cpp || 0,
      irProlabore: pj.irProlabore.imposto,
      totalImpostos: pj.totalImpostos,
      liquido: liquidoPJ,
      effectiveRate: pj.effectiveRate,
    },
  };
}

// ================= TESTE =================

console.log(
  compareTaxes({
    rendaMensal: 10000,
    custosMensais: 0,
    profissao: "Advogado(a)",
  })
);