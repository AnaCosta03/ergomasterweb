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
          <td>${funcionario.dv}</td>
          <td>${funcionario.nome}</td>
          <td>${funcionario.cargoDescricao}</td>
          <td>${funcionario.centroCustoDescricao}</td>
        
          <td>${funcionario.statusDescricao}</td>
        `;

        tbody.appendChild(row);
      });

      document.getElementById("tabelaContainer").classList.remove("d-none");

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
  fetch("http://192.168.15.6:8080/api/basefuncionario/exportar")
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao exportar o Excel");
      }
      return response.blob(); // Recebe o Excel como blob
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "BASE_2025.xlsx"; // Nome do arquivo
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(error => {
      alert("Erro ao exportar: " + error.message);
    });
});