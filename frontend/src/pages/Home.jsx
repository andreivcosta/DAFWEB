import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CalculatorForm from "../components/CalculatorForm";
import CompareResult from "../components/CompareResult";
import { compareTaxes } from "../util/tax";
import FAQ from "../components/FAQ";

export default function Home() {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => navigate("/login");

  function handleCompare(data) {
    const comparison = compareTaxes({
      rendaMensal: Number(data.rendaMensal),
      custosMensais: Number(data.custosMensais),
      profissao: data.profissao,
    });
    setResult({
      ...comparison,
      input: {
        rendaMensal: data.rendaMensal,
        custosMensais: data.custosMensais,
        profissao: data.profissao,
        sendEmail: data.sendEmail,
        emailUser: data.emailUser,
        emailNAF: data.emailNAF,
      },
    });
  }

  function handleBack() {
    setResult(null);
  }

  return (
    <div
      className="container-fluid min-vh-100"
      style={{ backgroundColor: "#f3f1ff", color: "#333" }}
    >
      {/* Header com botão de sair */}
      <div
      className="header mb-4 d-flex align-items-center"
      style={{
        background: "linear-gradient(135deg, #6a5acd, #a6b1ff)",
        marginLeft: "-12px",
        marginRight: "-10px",
        padding: "25px",
        color: "white",
        }}
>
  {/* esquerda do topo */}
  <div style={{ flex: 1 }}>
    <h1 className="fw-bold mb-0">Calculadora Tributária</h1>
    <p className="mb-0">Compare PF vs PJ de forma simples</p>
  </div>

 {/* centralizar o faq */}
  <div style={{ flex: 1, textAlign: "center" }}>
    <a
      href="#faq"
      className="btn btn-light fw-bold rounded-pill px-4"
    >
      PERGUNTAS FREQUENTES
    </a>
  </div>

  {/* DIREITA do topo */}
  <div style={{ flex: 1, textAlign: "right" }}>
    <button
      onClick={handleLogout}
      className="btn btn-light fw-bold rounded-pill px-4"
    >
      Sair
    </button>
  </div>
</div>

      <div className="container">
        <div>
          <div className="card-body">
            {!result ? (
              <CalculatorForm onCompare={handleCompare} />
            ) : (
              <CompareResult result={result} onBack={handleBack} />
            )}
          </div>
        </div>
      </div>
      <FAQ />
    </div>
  );
}