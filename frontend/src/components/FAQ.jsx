import React, { useState } from "react";

const perguntas = [
  {
    pergunta: "O que é melhor: PF ou PJ?",
    resposta: "Depende da sua renda e custos. A calculadora mostra o melhor caso."
  },
  {
    pergunta: "Posso enviar os dados por email?",
    resposta: "Sim, você pode enviar para o NAF diretamente pela aplicação."
  },
  {
    pergunta: "Quais profissões são suportadas?",
    resposta: "Psicólogo, arquiteto e advogado."
  }
];

export default function FAQ() {
  const [ativo, setAtivo] = useState(null);

  function toggle(index) {
    setAtivo(ativo === index ? null : index);
  }

  return (
    <div id="faq" className="container mt-5 d-flex justify-content-center">
      <div style={{ maxWidth: "800px", width: "100%" }}>
        
        <h2 className="mb-4 text-center">Perguntas Frequentes</h2>

        {perguntas.map((item, index) => (
          <div key={index} className="mb-2 border rounded">
            <div
              onClick={() => toggle(index)}
              style={{
                cursor: "pointer",
                padding: "15px",
                background: "#f5f5f5",
                fontWeight: "bold"
              }}
            >
              {item.pergunta}
            </div>

            {ativo === index && (
              <div style={{ padding: "15px" }}>
                {item.resposta}
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}