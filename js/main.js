document.getElementById("uploadForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const fileInput = document.getElementById("file");
  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  fetch("http://localhost:8080/api/basefuncionario/importar", {
    method: "POST",
    body: formData
  })
  .then(response => {
    return response.text().then(text => {
      if (!response.ok) {
        throw new Error(text); // Mostra erro real vindo do backend
      }
      return text;
    });
  })
  .then(data => {
    document.getElementById("mensagem").textContent = "Sucesso: " + data;
  })
  .catch(error => {
    document.getElementById("mensagem").textContent = error.message;
  });
});

document.getElementById("listarBtn").addEventListener("click", function () {
  fetch("http://192.168.15.6:8080/api/basefuncionario/listar")
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao buscar funcionários");
      }
      return response.json();
    })
    .then(data => {
      const tabela = document.getElementById("tabelaFuncionarios");
      const tbody = tabela.querySelector("tbody");
      const erro = document.getElementById("erroTabela");
      const total = document.getElementById("totalLinhas");

      tbody.innerHTML = ""; // limpa antes de adicionar

      data.forEach(funcionario => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${funcionario.matricula}</td>
          <td>${funcionario.nome}</td>
          <td>${funcionario.cargoDescricao}</td>
          <td>${funcionario.centroCustoDescricao}</td>
          <td>${funcionario.status}</td>
        `;

        tbody.appendChild(row);
      });

      tabela.style.display = "table";
      erro.textContent = "";

      // Atualiza o total de linhas
      total.textContent = `Total de funcionários: ${tbody.rows.length}`;
    })
    .catch(error => {
      document.getElementById("erroTabela").textContent = error.message;
    });
});

document.getElementById("filtro").addEventListener("input", function () {
  const filtro = this.value.toLowerCase();
  const linhas = document.querySelectorAll("#tabelaFuncionarios tbody tr");
  const total = document.getElementById("totalLinhas");

  let contadorVisiveis = 0;

  linhas.forEach(linha => {
    const texto = linha.textContent.toLowerCase();
    const visivel = texto.includes(filtro);
    linha.style.display = visivel ? "" : "none";
    if (visivel) contadorVisiveis++;
  });

  // Atualiza total de linhas visíveis após o filtro
  total.textContent = `Total de funcionários: ${contadorVisiveis}`;
});

document.getElementById("exportarBtn").addEventListener("click", function () {
  fetch("http://192.168.15.6:8080/api/basefuncionario/listar")
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao buscar funcionários");
      }
      return response.json();
    })
    .then(data => {
      // Remove só o campo "id", mantém "status"
      const funcionariosFiltrados = data.map(({ id, ...rest }) => rest);

      // Cabeçalhos conforme seu pedido, na ordem exata
      const headers = [
        "Matrícula", "DV", "Nome", "Cargo Básico-Descrição", "Centro Custo", "Centro Custo-Descrição",
        "Sexo", "ID Federal", "Carteira Identidade", "Data Nascimento", "Nome Mãe",
        "Data Admissão", "Tipo Mão-de-Obra-Descrição", "Endereço", "Número Endereço", "CEP", "Bairro",
        "Estado Civil", "Telefone", "PIS", "Turno-Descrição", "Grau Instrução-Descrição",
        "Classif Ocupação", "E-mail", "Término Contrato", "Status"
      ];

      // Chaves correspondentes na ordem correta para acessar os dados
      const keys = [
        "matricula", "dv", "nome", "cargoDescricao", "centroCusto", "centroCustoDescricao",
        "sexo", "idFederal", "identidade", "dataNascimento", "nomeMae",
        "dataAdmissao", "maoDeObraDescricao", "endereco", "nEndereco", "cep", "bairro",
        "estadoCivil", "telefone", "pis", "turnoDescricao", "grauInstrucao",
        "classifOcupacao", "email", "terminoContrato", "status"
      ];

      function formatDate(dataStr) {
        if (!dataStr) return "";
        const d = new Date(dataStr);
        if (isNaN(d)) return dataStr;
        return d.toISOString().split('T')[0];
      }

      const dados = funcionariosFiltrados.map(func => keys.map(chave => {
        if (["dataNascimento", "dataAdmissao", "terminoContrato"].includes(chave)) {
          return formatDate(func[chave]);
        }
        return func[chave] ?? "";
      }));

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dados]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Funcionários");

      XLSX.writeFile(workbook, "funcionarios.xlsx");
      alert("Exportação concluída com sucesso!");
    })
    .catch(error => {
      alert("Erro ao exportar: " + error.message);
    });
});